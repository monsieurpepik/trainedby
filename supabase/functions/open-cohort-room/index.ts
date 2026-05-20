import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createLogger } from "../_shared/logger.ts";

const logger = createLogger("open-cohort-room");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: CORS });

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

  let body: { cohort_id: string; mux_playback_id?: string };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const { cohort_id, mux_playback_id } = body;
  if (!cohort_id) {
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
    .eq("id", cohort_id)
    .eq("trainer_id", trainer.id)
    .maybeSingle();

  if (!cohort) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  // Close any previously open room for this cohort
  await sb
    .from("cohort_rooms")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("cohort_id", cohort_id)
    .eq("status", "open");

  // Create new room
  const { data: room, error: roomErr } = await sb
    .from("cohort_rooms")
    .insert({ cohort_id, mux_playback_id: mux_playback_id ?? null, status: "open" })
    .select()
    .single();

  if (roomErr || !room) {
    logger.error("Failed to create room", { error: roomErr?.message });
    return new Response(JSON.stringify({ error: "room_create_failed" }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  // Fetch member count
  const { count } = await sb
    .from("cohort_members")
    .select("*", { count: "exact", head: true })
    .eq("cohort_id", cohort_id);

  // Broadcast room_opened on cohort-room:{cohort_id}
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
          topic: `realtime:cohort-room:${cohort_id}`,
          event: "room_opened",
          payload: {
            room_id: room.id,
            cohort_id,
            mux_playback_id: room.mux_playback_id,
            member_count: count ?? 0,
          },
          private: false,
        }],
      }),
    });
  } catch (e) {
    logger.warn("Broadcast failed (best-effort)", { error: String(e) });
  }

  return new Response(JSON.stringify({ ok: true, room_id: room.id }), {
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
