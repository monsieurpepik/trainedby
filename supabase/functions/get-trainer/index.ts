import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    if (!slug) return new Response(JSON.stringify({ error: "Slug required" }), { status: 400, headers: corsHeaders });

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Fetch trainer
    const { data: trainer, error } = await sb
      .from("trainers")
      .select("id,slug,name,title,bio,avatar_url,cover_url,specialties,certifications,reps_number,reps_level,reps_verified,years_experience,clients_trained,sessions_delivered,locations,city,instagram,tiktok,youtube,accepting_clients,gallery_urls,plan,verification_status,created_at,stripe_connect_onboarded")
      .eq("slug", slug.toLowerCase())
      .single();

    if (error || !trainer) {
      return new Response(JSON.stringify({ error: "Trainer not found" }), { status: 404, headers: corsHeaders });
    }

    // Fetch packages
    const { data: packages } = await sb
      .from("session_packages")
      .select("id,name,price,currency,duration,sessions,description,is_featured,sort_order")
      .eq("trainer_id", trainer.id)
      .order("sort_order", { ascending: true });

    // Log profile view (fire and forget)
    const ipHash = await hashIp(req.headers.get("x-forwarded-for") || "unknown");
    sb.from("profile_views").insert({
      trainer_id: trainer.id,
      ip_hash: ipHash,
      referrer: req.headers.get("referer") || null,
    }).then(() => {});

    // Deduplicate packages by name — keep the one with the lowest sort_order
    const seen = new Set<string>();
    const dedupedPackages = (packages || []).filter(p => {
      if (seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });

    // Check if trainer is bookable (has Stripe, active session types, and availability)
    let bookingReady = false;
    if (trainer.stripe_connect_onboarded) {
      const [{ count: stCount }, { count: avCount }] = await Promise.all([
        sb.from('session_types').select('id', { count: 'exact', head: true }).eq('trainer_id', trainer.id).eq('is_active', true),
        sb.from('trainer_availability').select('id', { count: 'exact', head: true }).eq('trainer_id', trainer.id),
      ]);
      bookingReady = (stCount ?? 0) > 0 && (avCount ?? 0) > 0;
    }

    return new Response(JSON.stringify({ trainer: { ...trainer, booking_ready: bookingReady }, packages: dedupedPackages }), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=30" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: corsHeaders });
  }
});

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + Deno.env.get("IP_HASH_SALT", "trainedby_salt"));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}
