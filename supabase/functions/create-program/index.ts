import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-academy-token",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Authenticate via academy magic token
    const token = req.headers.get("x-academy-token");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: academy, error: authErr } = await sb
      .from("academies")
      .select("id, name")
      .eq("admin_magic_token", token)
      .single();

    if (authErr || !academy) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      name, sport, age_min, age_max, age_label,
      description, duration_weeks, sessions_per_week,
      price_aed, price_gbp, currency,
      max_capacity, location, start_date, end_date,
      program_type, is_featured,
    } = body;

    if (!name || !sport) {
      return new Response(JSON.stringify({ error: "name and sport are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: program, error } = await sb
      .from("programs")
      .insert({
        academy_id: academy.id,
        name,
        sport,
        age_min: age_min || null,
        age_max: age_max || null,
        age_label: age_label || null,
        description: description || null,
        duration_weeks: duration_weeks || null,
        sessions_per_week: sessions_per_week || 1,
        price_aed: price_aed || null,
        price_gbp: price_gbp || null,
        currency: currency || "AED",
        max_capacity: max_capacity || 20,
        location: location || null,
        start_date: start_date || null,
        end_date: end_date || null,
        program_type: program_type || "term",
        is_featured: is_featured || false,
        is_active: true,
      })
      .select()
      .single();

    if (error || !program) {
      console.error("Program insert error:", error);
      return new Response(JSON.stringify({ error: "Failed to create program" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ program }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("create-program error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
