import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLATFORM_FEE_PERCENT = 0.10; // 10% platform fee

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

    const {
      program_id,
      parent_name,
      parent_email,
      parent_phone,
      child_name,
      child_dob,
      child_notes,
    } = await req.json();

    if (!program_id || !parent_name || !parent_email || !parent_phone || !child_name) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch program + academy details
    const { data: program, error: progErr } = await sb
      .from("programs")
      .select("*, academies(id, name, slug, contact_email)")
      .eq("id", program_id)
      .eq("is_active", true)
      .single();

    if (progErr || !program) {
      return new Response(JSON.stringify({ error: "Program not found or inactive" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check capacity
    if (program.enrolled_count >= program.max_capacity) {
      return new Response(JSON.stringify({ error: "Program is fully booked" }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const currency = program.currency?.toLowerCase() || "aed";
    const priceRaw = currency === "gbp" ? program.price_gbp : program.price_aed;
    if (!priceRaw || priceRaw <= 0) {
      return new Response(JSON.stringify({ error: "Program has no price set" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amountCents = Math.round(priceRaw * 100);
    const platformFeeCents = Math.round(amountCents * PLATFORM_FEE_PERCENT);
    const academyPayoutCents = amountCents - platformFeeCents;

    const academy = program.academies as { id: string; name: string; slug: string; contact_email: string };
    const baseUrl = Deno.env.get("SITE_URL") || "https://trainedby.ae";

    // Pre-create booking record in pending state
    const { data: booking, error: bookErr } = await sb
      .from("academy_bookings")
      .insert({
        program_id,
        academy_id: academy.id,
        parent_name,
        parent_email,
        parent_phone,
        child_name,
        child_dob: child_dob || null,
        child_notes: child_notes || null,
        amount_paid: priceRaw,
        currency: currency.toUpperCase(),
        platform_fee: priceRaw * PLATFORM_FEE_PERCENT,
        academy_payout: priceRaw * (1 - PLATFORM_FEE_PERCENT),
        status: "pending",
      })
      .select()
      .single();

    if (bookErr || !booking) {
      console.error("Booking insert error:", bookErr);
      return new Response(JSON.stringify({ error: "Failed to create booking record" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: parent_email,
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: amountCents,
            product_data: {
              name: `${program.name} — ${academy.name}`,
              description: `${program.sport} | ${program.age_label || "All ages"} | ${program.location || academy.name}`,
              metadata: { program_id, academy_id: academy.id },
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/booking/${booking.id}?success=1`,
      cancel_url: `${baseUrl}/academy/${academy.slug}?cancelled=1`,
      metadata: {
        booking_id: booking.id,
        program_id,
        academy_id: academy.id,
        parent_email,
        child_name,
      },
      payment_intent_data: {
        metadata: {
          booking_id: booking.id,
          program_id,
          academy_id: academy.id,
        },
      },
    });

    // Store checkout session ID on booking
    await sb
      .from("academy_bookings")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", booking.id);

    return new Response(
      JSON.stringify({ url: session.url, booking_id: booking.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("create-academy-booking error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
