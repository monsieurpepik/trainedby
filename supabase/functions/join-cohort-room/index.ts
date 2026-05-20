import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SignJWT, importPKCS8 } from "https://deno.land/x/jose@v4.14.4/index.ts";
import { createLogger } from "../_shared/logger.ts";

const logger = createLogger("join-cohort-room");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function signMuxToken(playbackId: string): Promise<string> {
  const keyId = Deno.env.get("MUX_SIGNING_KEY_ID");
  const privKeyB64 = Deno.env.get("MUX_SIGNING_PRIVATE_KEY");
  if (!keyId || !privKeyB64) throw new Error("MUX signing keys not configured");
  const pem = atob(privKeyB64);
  const key = await importPKCS8(pem, "RS256");
  return await new SignJWT({})
    .setProtectedHeader({ alg: "RS256", kid: keyId })
    .setSubject(playbackId)
    .setAudience("v")
    .setExpirationTime("4h")
    .sign(key);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: CORS });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);
  const sbAnon = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!);

  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: { user }, error: authErr } = await sbAnon.auth.getUser(jwt);
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  let body: { room_id: string };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
  if (!body.room_id) {
    return new Response(JSON.stringify({ error: "room_id required" }), {
      status: 400, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  // Fetch room
  const { data: room } = await sb
    .from("cohort_rooms")
    .select("id, cohort_id, mux_playback_id, status")
    .eq("id", body.room_id)
    .single();

  if (!room || room.status !== "open") {
    return new Response(JSON.stringify({ error: "room_not_open" }), {
      status: 404, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  // Verify caller is a member of this cohort
  const { data: membership } = await sb
    .from("cohort_members")
    .select("id")
    .eq("cohort_id", room.cohort_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return new Response(JSON.stringify({ error: "not_a_member" }), {
      status: 403, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  // Fetch member count
  const { count } = await sb
    .from("cohort_members")
    .select("*", { count: "exact", head: true })
    .eq("cohort_id", room.cohort_id);

  // Sign Mux token if trainer is streaming
  let playback_token: string | null = null;
  if (room.mux_playback_id) {
    try {
      playback_token = await signMuxToken(room.mux_playback_id);
    } catch (e) {
      logger.error("Mux signing failed", { error: String(e) });
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      room_id: room.id,
      cohort_id: room.cohort_id,
      mux_playback_id: room.mux_playback_id,
      playback_token,
      member_count: count ?? 0,
    }),
    { headers: { ...CORS, "Content-Type": "application/json" } }
  );
});
