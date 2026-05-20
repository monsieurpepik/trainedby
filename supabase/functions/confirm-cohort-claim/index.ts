// supabase/functions/confirm-cohort-claim/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createLogger } from "../_shared/logger.ts";

const logger = createLogger("confirm-cohort-claim");

Deno.serve(async (req) => {
  // Internal-only: verify shared secret
  const INTERNAL_SECRET = Deno.env.get("INTERNAL_WEBHOOK_SECRET");
  const authHeader = req.headers.get("authorization") ?? "";
  if (!INTERNAL_SECRET || authHeader !== `Bearer ${INTERNAL_SECRET}`) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  let body: {
    live_session_id: string;
    user_id: string;
    stripe_checkout_id: string;
  };

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const { live_session_id, user_id, stripe_checkout_id } = body;
  if (!live_session_id || !user_id || !stripe_checkout_id) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  const sb = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    // 1. Update drop claim to paid
    const { error: claimErr } = await sb
      .from("live_drop_claims")
      .update({ status: "paid" })
      .eq("stripe_checkout_id", stripe_checkout_id);

    if (claimErr) {
      logger.error("Failed to update claim status", { stripe_checkout_id, error: claimErr.message });
      return new Response(JSON.stringify({ error: "claim_update_failed" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    // 2. Fetch session for title + trainer_id + trainer name
    const { data: session, error: sessionErr } = await sb
      .from("live_sessions")
      .select("id, title, trainer_id, trainers(name)")
      .eq("id", live_session_id)
      .single();

    if (sessionErr || !session) {
      logger.error("Session not found", { live_session_id });
      return new Response(JSON.stringify({ error: "session_not_found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    const trainerName = (session.trainers as { name: string } | null)?.name ?? "Your trainer";

    // 3. Upsert cohort (one cohort per live_session_id)
    const endsAt = new Date(Date.now() + 8 * 7 * 24 * 60 * 60 * 1000).toISOString();

    // ignoreDuplicates: true means ON CONFLICT DO NOTHING — returns nothing on conflict.
    // Fall back to a SELECT if the upsert returns no row (cohort already existed).
    const { data: upsertedCohort } = await sb
      .from("cohorts")
      .upsert(
        {
          trainer_id: session.trainer_id,
          live_session_id,
          title: session.title,
          ends_at: endsAt,
          status: "active",
        },
        { onConflict: "live_session_id", ignoreDuplicates: true }
      )
      .select()
      .maybeSingle();

    const cohort = upsertedCohort ?? (await sb
      .from("cohorts")
      .select()
      .eq("live_session_id", live_session_id)
      .single()
    ).data;

    if (!cohort) {
      logger.error("Failed to upsert or fetch cohort", { live_session_id });
      return new Response(JSON.stringify({ error: "cohort_create_failed" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    // 4. Insert cohort_member (ignore if already exists)
    const { error: memberErr } = await sb
      .from("cohort_members")
      .upsert({ cohort_id: cohort.id, user_id }, { onConflict: "cohort_id,user_id", ignoreDuplicates: true });

    if (memberErr) {
      logger.error("Failed to upsert cohort member", { cohort_id: cohort.id, user_id, error: memberErr.message });
      return new Response(JSON.stringify({ error: "member_insert_failed" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    // 5. Broadcast cohort_confirmed on cohort-room:{live_session_id}
    try {
      await fetch(`${SUPABASE_URL}/realtime/v1/broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": ANON_KEY,
          "Authorization": `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            {
              topic: `realtime:cohort-room:${live_session_id}`,
              event: "cohort_confirmed",
              payload: {
                cohort_id: cohort.id,
                title: cohort.title,
                trainer_name: trainerName,
                starts_at: cohort.starts_at,
                ends_at: cohort.ends_at,
              },
              private: false,
            },
          ],
        }),
      });
    } catch (broadcastErr) {
      logger.warn("Broadcast failed (best-effort)", { error: String(broadcastErr) });
    }

    logger.info("Cohort confirmed", { cohort_id: cohort.id, user_id });
    return new Response(JSON.stringify({ ok: true, cohort_id: cohort.id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    logger.error("confirm-cohort-claim error", { error: String(err) });
    return new Response(JSON.stringify({ error: "internal_error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
