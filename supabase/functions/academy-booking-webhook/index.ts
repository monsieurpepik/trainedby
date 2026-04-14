import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET_ACADEMY") || Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Webhook Error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;
    const programId = session.metadata?.program_id;

    if (!bookingId) {
      console.error("No booking_id in session metadata");
      return new Response("OK", { status: 200 });
    }

    // Confirm the booking
    const { data: booking, error } = await sb
      .from("academy_bookings")
      .update({
        status: "confirmed",
        stripe_payment_intent_id: session.payment_intent as string,
        payment_method: session.payment_method_types?.[0] || "card",
      })
      .eq("id", bookingId)
      .select("*, programs(name, sport, age_label, location, start_date, academies(name, slug, contact_email, whatsapp))")
      .single();

    if (error || !booking) {
      console.error("Failed to confirm booking:", error);
      return new Response("OK", { status: 200 });
    }

    // Increment enrolled count on program
    if (programId) {
      await sb.rpc("increment_enrolled", { program_uuid: programId }).catch(console.error);
      // Fallback if RPC doesn't exist:
      const { data: prog } = await sb.from("programs").select("enrolled_count").eq("id", programId).single();
      if (prog) {
        await sb.from("programs").update({ enrolled_count: (prog.enrolled_count || 0) + 1 }).eq("id", programId);
      }
    }

    // Send confirmation email via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey && booking.parent_email) {
      const prog = booking.programs as any;
      const academy = prog?.academies as any;
      const emailBody = {
        from: "TrainedBy <noreply@trainedby.ae>",
        to: booking.parent_email,
        subject: `Booking Confirmed: ${prog?.name || "Academy Programme"} — ${academy?.name || ""}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <img src="https://trainedby.ae/logo.png" alt="TrainedBy" style="height:40px;margin-bottom:24px">
            <h2 style="color:#1a1a2e">Booking Confirmed ✓</h2>
            <p>Hi ${booking.parent_name},</p>
            <p>Your booking for <strong>${booking.child_name}</strong> has been confirmed.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666">Programme</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">${prog?.name || "—"}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666">Academy</td><td style="padding:8px;border-bottom:1px solid #eee">${academy?.name || "—"}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666">Sport</td><td style="padding:8px;border-bottom:1px solid #eee">${prog?.sport || "—"}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666">Start Date</td><td style="padding:8px;border-bottom:1px solid #eee">${prog?.start_date || "TBC"}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666">Location</td><td style="padding:8px;border-bottom:1px solid #eee">${prog?.location || "—"}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666">Amount Paid</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">${booking.currency} ${booking.amount_paid}</td></tr>
            </table>
            <p>If you have any questions, contact the academy directly${academy?.whatsapp ? ` on WhatsApp: <a href="https://wa.me/${academy.whatsapp.replace(/\D/g,'')}">Click here</a>` : ""}.</p>
            <p style="color:#666;font-size:13px">Booking reference: ${booking.id}</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
            <p style="color:#999;font-size:12px">TrainedBy — Find the best coaches in Dubai & the UK</p>
          </div>
        `,
      };

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(emailBody),
      }).catch(console.error);

      await sb.from("academy_bookings").update({ confirmation_sent: true }).eq("id", bookingId);
    }

    // Notify academy via Telegram if configured
    const telegramToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const founderChatId = Deno.env.get("TELEGRAM_FOUNDER_CHAT_ID");
    if (telegramToken && founderChatId) {
      const prog = booking.programs as any;
      const academy = prog?.academies as any;
      const msg = `🎉 New Academy Booking!\n\n🏟 ${academy?.name || "Academy"}\n📋 ${prog?.name || "Programme"}\n👶 ${booking.child_name}\n👤 Parent: ${booking.parent_name}\n📧 ${booking.parent_email}\n💰 ${booking.currency} ${booking.amount_paid}`;
      await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: founderChatId, text: msg }),
      }).catch(console.error);
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;
    if (bookingId) {
      await sb.from("academy_bookings").update({ status: "cancelled" }).eq("id", bookingId).eq("status", "pending");
    }
  }

  return new Response("OK", { status: 200 });
});
