import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const BOOKING_FROM_EMAIL = "TrainedBy <bookings@trainedby.com>";

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("No signature", { status: 400 });

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
  const webhookSecret = Deno.env.get("STRIPE_BOOKING_WEBHOOK_SECRET")!;

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (e) {
    console.error("Webhook signature verification failed:", e);
    return new Response("Invalid signature", { status: 400 });
  }

  // Only handle payment_intent.succeeded
  if (event.type !== "payment_intent.succeeded") {
    return new Response("OK", { status: 200 });
  }

  const pi = event.data.object as Stripe.PaymentIntent;
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Find booking by payment intent ID
  const { data: booking, error: bookingError } = await sb
    .from("bookings")
    .select("id, trainer_id, session_type_id, scheduled_at, duration_min, consumer_name, consumer_email, consumer_phone, status, amount_cents")
    .eq("stripe_payment_intent_id", pi.id)
    .single();

  if (bookingError || !booking) {
    console.error("Booking not found for payment intent:", pi.id);
    return new Response("OK", { status: 200 }); // Return 200 to avoid Stripe retries for missing bookings
  }

  // Idempotency: skip if already confirmed
  if (booking.status === "confirmed") {
    return new Response("OK", { status: 200 });
  }

  // Update booking status to confirmed
  const { error: updateError } = await sb
    .from("bookings")
    .update({ status: "confirmed" })
    .eq("id", booking.id);

  if (updateError) {
    console.error("Failed to confirm booking:", updateError);
    return new Response("Error", { status: 500 });
  }

  // Activate package credits if they exist
  await sb
    .from("package_credits")
    .update({ status: "available" })
    .eq("booking_id", booking.id)
    .eq("status", "pending");

  // Load trainer info for emails
  const { data: trainer } = await sb
    .from("trainers")
    .select("name, email, slug")
    .eq("id", booking.trainer_id)
    .single();

  // Load session type for email content
  const { data: sessionType } = await sb
    .from("session_types")
    .select("name, price_cents, duration_min, package_count")
    .eq("id", booking.session_type_id)
    .single();

  // Generate and store random tokens in booking_tokens table
  const appUrl = Deno.env.get("APP_URL") || "https://trainedby.com";

  const cancelToken = generateToken();
  const myBookingsToken = generateToken();
  const now = new Date();

  const { error: tokenError } = await sb.from("booking_tokens").insert([
    {
      token: cancelToken,
      token_type: "cancel",
      booking_id: booking.id,
      expires_at: new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString(),
    },
    {
      token: myBookingsToken,
      token_type: "my_bookings",
      booking_id: booking.id,
      consumer_email: booking.consumer_email,
      stripe_payment_intent_id: pi.id,
      expires_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  if (tokenError) {
    console.error("Failed to insert booking tokens:", tokenError);
    // Non-fatal — booking confirmed; email links will be broken but booking stands
  }

  const cancelUrl = `${appUrl}/book/cancel?token=${cancelToken}`;
  const myBookingsUrl = `${appUrl}/my-bookings?token=${myBookingsToken}`;

  // Format the date nicely
  const sessionDate = new Date(booking.scheduled_at);
  const formattedDate = sessionDate.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", timeZoneName: "short"
  });

  const amountFormatted = `$${(booking.amount_cents / 100).toFixed(0)}`;
  const trainerName = trainer?.name || "your trainer";
  const sessionName = sessionType?.name || "Session";
  const isPackage = (sessionType?.package_count ?? 0) > 1;

  // Send confirmation email to consumer
  const consumerHtml = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111;">
      <h2 style="color:#FF5C00;">Your booking is confirmed! 🎉</h2>
      <p>Hi ${booking.consumer_name},</p>
      <p>You've successfully booked a <strong>${sessionName}</strong> with <strong>${trainerName}</strong>.</p>
      <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="margin:4px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
        <p style="margin:4px 0;"><strong>Duration:</strong> ${booking.duration_min} minutes</p>
        <p style="margin:4px 0;"><strong>Amount paid:</strong> ${amountFormatted}</p>
        ${isPackage ? `<p style="margin:4px 0;"><strong>Package:</strong> ${sessionType!.package_count} sessions included</p>` : ''}
      </div>
      <p>Your trainer will reach out to confirm the location or meeting link.</p>
      <div style="margin:24px 0;">
        <a href="${cancelUrl}" style="color:#999;font-size:13px;">Need to cancel? Click here (24h notice required)</a>
      </div>
      <div style="margin:16px 0;">
        <a href="${myBookingsUrl}" style="color:#FF5C00;font-size:13px;">View all your bookings</a>
      </div>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p style="font-size:12px;color:#999;">TrainedBy — Find and book top personal trainers worldwide.</p>
    </div>
  `;

  await sendEmail(booking.consumer_email, `Booking confirmed: ${sessionName} with ${trainerName}`, consumerHtml);

  // Send notification email to trainer
  const trainerEmail = trainer?.email;
  if (trainerEmail) {
    const trainerHtml = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111;">
        <h2 style="color:#FF5C00;">New booking received! 📅</h2>
        <p>Hi ${trainerName},</p>
        <p>You have a new booking for <strong>${sessionName}</strong>.</p>
        <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="margin:4px 0;"><strong>Client:</strong> ${booking.consumer_name}</p>
          <p style="margin:4px 0;"><strong>Email:</strong> ${booking.consumer_email}</p>
          ${booking.consumer_phone ? `<p style="margin:4px 0;"><strong>Phone:</strong> ${booking.consumer_phone}</p>` : ''}
          <p style="margin:4px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
          <p style="margin:4px 0;"><strong>Duration:</strong> ${booking.duration_min} minutes</p>
          <p style="margin:4px 0;"><strong>Amount:</strong> ${amountFormatted}</p>
          ${isPackage ? `<p style="margin:4px 0;"><strong>Package:</strong> ${sessionType!.package_count} sessions</p>` : ''}
        </div>
        <p>Please reach out to your client to confirm logistics.</p>
        <a href="${appUrl}/dashboard" style="display:inline-block;background:#FF5C00;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">View Dashboard</a>
      </div>
    `;
    await sendEmail(trainerEmail, `New booking: ${booking.consumer_name} — ${sessionName}`, trainerHtml);
  }

  return new Response("OK", { status: 200 });
});

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) { console.warn("RESEND_API_KEY not set — skipping email"); return; }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({ from: BOOKING_FROM_EMAIL, to, subject, html }),
    });
    if (!res.ok) console.error("Email send failed:", await res.text());
  } catch (e) {
    console.error("Email send error:", e);
  }
}
