import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: link } = await sb.from("magic_links").select("trainer_id").eq("token", token).single();
    if (!link?.trainer_id) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const trainer_id = link.trainer_id;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

    // This week
    const [leadsThisWeek, viewsThisWeek, eventsThisWeek, leadsLastWeek, viewsLastWeek] = await Promise.all([
      sb.from("leads").select("id", { count: "exact" }).eq("trainer_id", trainer_id).gte("created_at", weekAgo),
      sb.from("profile_views").select("id", { count: "exact" }).eq("trainer_id", trainer_id).gte("created_at", weekAgo),
      sb.from("events").select("event_type").eq("trainer_id", trainer_id).gte("created_at", weekAgo),
      sb.from("leads").select("id", { count: "exact" }).eq("trainer_id", trainer_id).gte("created_at", twoWeeksAgo).lt("created_at", weekAgo),
      sb.from("profile_views").select("id", { count: "exact" }).eq("trainer_id", trainer_id).gte("created_at", twoWeeksAgo).lt("created_at", weekAgo),
    ]);

    const waTaps = eventsThisWeek.data?.filter(e => e.event_type === "wa_tap").length || 0;
    const assessments = eventsThisWeek.data?.filter(e => e.event_type === "assessment_complete").length || 0;

    return new Response(JSON.stringify({
      leads_this_week: leadsThisWeek.count || 0,
      views_this_week: viewsThisWeek.count || 0,
      wa_taps_this_week: waTaps,
      assessments_this_week: assessments,
      leads_change: (leadsThisWeek.count || 0) - (leadsLastWeek.count || 0),
      views_change: (viewsThisWeek.count || 0) - (viewsLastWeek.count || 0),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
