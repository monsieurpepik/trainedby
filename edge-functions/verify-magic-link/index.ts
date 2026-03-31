import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { token } = await req.json();
    if (!token) return new Response(JSON.stringify({ error: "Token required" }), { status: 400, headers: corsHeaders });

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Fetch the magic link
    const { data: link, error } = await sb
      .from("magic_links")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .single();

    if (error || !link) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), { status: 401, headers: corsHeaders });
    }

    if (new Date(link.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "Token expired" }), { status: 401, headers: corsHeaders });
    }

    // Mark token as used
    await sb.from("magic_links").update({ used: true }).eq("id", link.id);

    // Fetch trainer
    let trainer = null;
    if (link.trainer_id) {
      const { data } = await sb.from("trainers").select("*").eq("id", link.trainer_id).single();
      trainer = data;
    } else {
      // Look up by email
      const { data } = await sb.from("trainers").select("*").eq("email", link.email.toLowerCase()).single();
      trainer = data;
    }

    if (!trainer) {
      return new Response(JSON.stringify({ error: "No trainer found for this email" }), { status: 404, headers: corsHeaders });
    }

    // Update last seen
    await sb.from("trainers").update({ last_seen_at: new Date().toISOString() }).eq("id", trainer.id);

    return new Response(JSON.stringify({ ok: true, trainer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
