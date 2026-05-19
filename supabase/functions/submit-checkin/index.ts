import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Verify JWT and extract authenticated user identity
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const sbAnon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: { user }, error: authErr } = await sbAnon.auth.getUser(token);
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { club_id, mission_id, user_id, note, proof_url } = await req.json();
  if (!club_id || !mission_id || !user_id) {
    return new Response(JSON.stringify({ error: "club_id, mission_id, user_id required" }), {
      status: 400, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Verify the user_id in the body matches the authenticated caller
  if (user.id !== user_id) {
    return new Response(JSON.stringify({ error: "user_id mismatch" }), {
      status: 403, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Verify active membership
  const { data: membership } = await sb
    .from("club_members")
    .select("id")
    .eq("club_id", club_id)
    .eq("user_id", user_id)
    .eq("status", "active")
    .maybeSingle();

  if (!membership) {
    return new Response(JSON.stringify({ error: "Not a member of this club" }), {
      status: 403, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Calculate streak: look for yesterday's check-in in this club
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const { data: yesterdayCheckin } = await sb
    .from("checkins")
    .select("streak_day")
    .eq("club_id", club_id)
    .eq("user_id", user_id)
    .gte("completed_at", yesterdayStart.toISOString())
    .lt("completed_at", todayStart.toISOString())
    .maybeSingle();

  const streak_day = yesterdayCheckin ? yesterdayCheckin.streak_day + 1 : 1;

  const { data: checkin, error } = await sb
    .from("checkins")
    .insert({
      club_id,
      mission_id,
      user_id,
      source: "manual",
      note: note ?? null,
      proof_url: proof_url ?? null,
      streak_day,
    })
    .select("id, streak_day, completed_at")
    .single();

  if (error) {
    // Unique constraint violation = already checked in today
    if (error.code === "23505") {
      return new Response(JSON.stringify({ ok: true, already_done: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ ok: true, streak_day: checkin.streak_day }), {
    headers: { ...corsHeaders, "content-type": "application/json" }
  });
});
