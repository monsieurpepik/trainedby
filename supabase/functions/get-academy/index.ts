import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return new Response(JSON.stringify({ error: "slug is required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Fetch academy
  const { data: academy, error } = await sb
    .from("academies")
    .select("id, slug, name, sport, logo_url, cover_url, description, location, city, country, google_maps_url, contact_phone, whatsapp, website_url, instagram_url, verified, plan")
    .eq("slug", slug)
    .single();

  if (error || !academy) {
    return new Response(JSON.stringify({ error: "Academy not found" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Fetch active programs
  const { data: programs } = await sb
    .from("programs")
    .select("id, name, sport, age_min, age_max, age_label, description, duration_weeks, sessions_per_week, price_aed, price_gbp, currency, max_capacity, enrolled_count, location, start_date, end_date, program_type, is_featured")
    .eq("academy_id", academy.id)
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("start_date", { ascending: true });

  // Fetch coaches
  const { data: coaches } = await sb
    .from("academy_coaches")
    .select("id, name, role, bio, photo_url, display_order, trainer_id, trainers(name, slug, photo_url, specialisms, bio)")
    .eq("academy_id", academy.id)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  // Increment profile view (fire and forget)
  sb.from("profile_views").insert({ entity_type: "academy", entity_id: academy.id }).catch(() => {});

  return new Response(
    JSON.stringify({ academy, programs: programs || [], coaches: coaches || [] }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
