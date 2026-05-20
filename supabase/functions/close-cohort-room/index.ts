import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createLogger } from "../_shared/logger.ts";

const logger = createLogger("close-cohort-room");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);
  const sbAnon = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!);

  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: { user }, error: authErr } = await sbAnon.auth.getUser(jwt);
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  let body: { cohort_id: string };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  if (!body.cohort_id) {
    return new Response(JSON.stringify({ error: "cohort_id required" }), {
      status: 400, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  // Find trainer record by email
  const { data: trainer } = await sb
    .from("trainers")
    .select("id")
    .eq("email", user.email)
    .maybeSingle();

  if (!trainer) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  // Verify this trainer owns this cohort
  const { data: cohort } = await sb
    .from("cohorts")
    .select("id")
    .eq("id", body.cohort_id)
    .eq("trainer_id", trainer.id)
    .maybeSingle();

  if (!cohort) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  // Close all open rooms for this cohort
  const { error: closeErr } = await sb
    .from("cohort_rooms")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("cohort_id", body.cohort_id)
    .eq("status", "open");

  if (closeErr) {
    logger.error("Failed to close room", { error: closeErr.message });
    return new Response(JSON.stringify({ error: "room_close_failed" }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  // Broadcast room_closed on cohort-room:{cohort_id}
  try {
    await fetch(`${SUPABASE_URL}/realtime/v1/broadcast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": ANON_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({
        messages: [{
          topic: `realtime:cohort-room:${body.cohort_id}`,
          event: "room_closed",
          payload: { cohort_id: body.cohort_id },
          private: false,
        }],
      }),
    });
  } catch (e) {
    logger.warn("Broadcast failed (best-effort)", { error: String(e) });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
