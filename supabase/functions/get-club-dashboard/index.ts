import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return new Response(JSON.stringify({ error: "slug required" }), {
    status: 400, headers: { ...corsHeaders, "content-type": "application/json" }
  });

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: club } = await sb.from("clubs").select("*").eq("slug", slug).single();
  if (!club) return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404, headers: { ...corsHeaders, "content-type": "application/json" }
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: members } = await sb
    .from("club_members")
    .select("user_id, joined_at, users(display_name, avatar_url)")
    .eq("club_id", club.id)
    .eq("status", "active");

  const { data: todayCheckins } = await sb
    .from("checkins")
    .select("user_id, streak_day")
    .eq("club_id", club.id)
    .gte("completed_at", todayStart.toISOString());

  const checkinSet = new Set((todayCheckins ?? []).map((c: any) => c.user_id));
  const streakMap: Record<string, number> = Object.fromEntries(
    (todayCheckins ?? []).map((c: any) => [c.user_id, c.streak_day])
  );

  const roster = (members ?? []).map((m: any) => ({
    user_id: m.user_id,
    display_name: m.users?.display_name ?? 'Member',
    avatar_url: m.users?.avatar_url ?? null,
    checked_in_today: checkinSet.has(m.user_id),
    streak_day: streakMap[m.user_id] ?? 0,
  }));

  const dayNumber = club.starts_at
    ? Math.min(
        Math.max(1, Math.floor((Date.now() - new Date(club.starts_at).getTime()) / 86400000) + 1),
        club.duration_days
      )
    : 1;

  const { data: upcomingMissions } = await sb
    .from("missions")
    .select("id, day_number, title, description, type, ai_draft, edited_by_trainer")
    .eq("club_id", club.id)
    .gte("day_number", dayNumber)
    .order("day_number", { ascending: true })
    .limit(7);

  const totalMembers = roster.length;
  const checkedInToday = roster.filter((r: any) => r.checked_in_today).length;
  const avgCompletion = totalMembers > 0 ? Math.round((checkedInToday / totalMembers) * 100) : 0;
  const atRisk = roster.filter((r: any) => !r.checked_in_today && r.streak_day >= 1).length;

  return new Response(JSON.stringify({
    club,
    stats: { total_members: totalMembers, checked_in_today: checkedInToday, avg_completion: avgCompletion, at_risk: atRisk },
    roster,
    upcoming_missions: upcomingMissions ?? [],
    current_day: dayNumber,
  }), { headers: { ...corsHeaders, "content-type": "application/json" } });
});
