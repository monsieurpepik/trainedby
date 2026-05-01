import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { jsonResponse, errorResponse, validationError, isValidEmail, sanitize } from "../_shared/errors.ts";

const PLATFORM_FEE_PERCENT = 0.10; // 10% platform fee

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") return errorResponse("Method not allowed", 405);

  try {
    const body = await req.json();
    const { session_type_id, trainer_id, scheduled_at, consumer_name, consumer_email, consumer_phone } = body;

    // Validate required fields
    if (!session_type_id) return validationError("session_type_id", "session_type_id is required");
    if (!trainer_id) return validationError("trainer_id", "trainer_id is required");
    if (!scheduled_at) return validationError("scheduled_at", "scheduled_at is required");
    if (!consumer_name?.trim()) return validationError("consumer_name", "consumer_name is required");
    if (!consumer_email?.trim()) return validationError("consumer_email", "consumer_email is required");
    if (!isValidEmail(consumer_email)) return validationError("consumer_email", "Invalid email address");

    const cleanName = sanitize(consumer_name);
    const cleanEmail = consumer_email.trim().toLowerCase();
    const cleanPhone = consumer_phone ? sanitize(consumer_phone) : null;

    // Validate scheduled_at is a valid ISO date in the future
    const scheduledDate = new Date(scheduled_at);
    if (isNaN(scheduledDate.getTime())) return validationError("scheduled_at", "Invalid scheduled_at date");
    if (scheduledDate <= new Date()) return validationError("scheduled_at", "scheduled_at must be in the future");

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

    // Load session type
    const { data: sessionType, error: stError } = await sb
      .from("session_types")
      .select("id, trainer_id, name, price_cents, duration_min, package_count, is_active")
      .eq("id", session_type_id)
      .eq("trainer_id", trainer_id)
      .single();

    if (stError || !sessionType) return errorResponse("Session type not found", 404, "NOT_FOUND");
    if (!sessionType.is_active) return errorResponse("Session type is no longer available", 409, "UNAVAILABLE");

    // Load trainer (verify onboarded + get Stripe account)
    const { data: trainer, error: trainerError } = await sb
      .from("trainers")
      .select("id, name, email, stripe_connect_account_id, stripe_connect_onboarded")
      .eq("id", trainer_id)
      .single();

    if (trainerError || !trainer) return errorResponse("Trainer not found", 404, "NOT_FOUND");
    if (!trainer.stripe_connect_onboarded || !trainer.stripe_connect_account_id) {
      return errorResponse("Trainer is not set up to accept payments", 409, "TRAINER_NOT_READY");
    }

    // Check slot availability — query existing active bookings for this trainer at the same time window
    const slotEnd = new Date(scheduledDate.getTime() + sessionType.duration_min * 60 * 1000).toISOString();
    const { data: conflicting } = await sb
      .from("bookings")
      .select("id")
      .eq("trainer_id", trainer_id)
      .in("status", ["pending", "confirmed"])
      .gte("scheduled_at", scheduledDate.toISOString())
      .lt("scheduled_at", slotEnd)
      .limit(1);

    if (conflicting && conflicting.length > 0) {
      return errorResponse("This time slot is no longer available. Please choose another.", 409, "SLOT_TAKEN");
    }

    // Calculate platform fee
    const platformFeeCents = Math.round(sessionType.price_cents * PLATFORM_FEE_PERCENT);

    // Create Stripe PaymentIntent with Connect transfer
    const paymentIntent = await stripe.paymentIntents.create({
      amount: sessionType.price_cents,
      currency: "usd",
      transfer_data: {
        destination: trainer.stripe_connect_account_id,
        amount: sessionType.price_cents - platformFeeCents,
      },
      metadata: {
        trainer_id,
        session_type_id,
        session_type_name: sessionType.name,
        consumer_email: cleanEmail,
        consumer_name: cleanName,
        scheduled_at: scheduledDate.toISOString(),
      },
      receipt_email: cleanEmail,
      description: `${sessionType.name} with ${trainer.name}`,
    });

    // Insert booking record (status: pending — confirmed by webhook on payment success)
    const { data: booking, error: bookingError } = await sb
      .from("bookings")
      .insert({
        trainer_id,
        session_type_id,
        stripe_payment_intent_id: paymentIntent.id,
        amount_cents: sessionType.price_cents,
        platform_fee_cents: platformFeeCents,
        currency: "usd",
        scheduled_at: scheduledDate.toISOString(),
        duration_min: sessionType.duration_min,
        consumer_name: cleanName,
        consumer_email: cleanEmail,
        consumer_phone: cleanPhone,
        status: "pending",
        notes: null,
      })
      .select("id")
      .single();

    if (bookingError || !booking) {
      console.error("Booking insert error:", bookingError);
      // Cancel the PaymentIntent to avoid orphaned charges
      await stripe.paymentIntents.cancel(paymentIntent.id).catch(() => {});
      return errorResponse("Failed to create booking. Please try again.", 500, "BOOKING_FAILED");
    }

    // If it's a package, pre-create the credit records (all pending until payment confirmed)
    if (sessionType.package_count && sessionType.package_count > 1) {
      const credits = Array.from({ length: sessionType.package_count }, () => ({
        booking_id: booking.id,
        trainer_id,
        consumer_email: cleanEmail,
        status: "pending" as const,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      }));
      const { error: creditError } = await sb.from("package_credits").insert(credits);
      if (creditError) {
        console.error("Credit insert error (non-fatal):", creditError);
        // Non-fatal — webhook will retry or we can handle manually
      }
    }

    return jsonResponse({
      client_secret: paymentIntent.client_secret,
      booking_id: booking.id,
      amount_cents: sessionType.price_cents,
      currency: "usd",
    });

  } catch (err) {
    console.error("book-session error:", err);
    return errorResponse("Internal server error", 500, "SERVER_ERROR");
  }
});
