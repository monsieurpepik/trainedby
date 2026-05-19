import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const sbAnon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: { user }, error: authErr } = await sbAnon.auth.getUser(token);
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const { parent_club_id, name, goal, price_cents, is_free } = await req.json();
  if (!parent_club_id || !name || !goal) {
    return new Response(JSON.stringify({ error: "parent_club_id, name, and goal required" }), {
      status: 400, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Fetch parent club to verify ownership and get season_number
  const { data: parent, error: parentErr } = await sb
    .from("clubs")
    .select("id, trainer_id, season_number, trainers(auth_id)")
    .eq("id", parent_club_id)
    .single();

  if (parentErr || !parent) {
    return new Response(JSON.stringify({ error: "Parent club not found" }), {
      status: 404, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Verify caller is the trainer who owns this club
  if ((parent.trainers as { auth_id: string }).auth_id !== user.id) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Generate a unique slug from name + season number
  const newSeasonNumber = parent.season_number + 1;
  const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const slug = `${baseSlug}-s${newSeasonNumber}-${Date.now().toString(36)}`;

  // Create the new season club
  const { data: newClub, error: createErr } = await sb
    .from("clubs")
    .insert({
      trainer_id: parent.trainer_id,
      name,
      slug,
      goal,
      price_cents: is_free ? 0 : (price_cents ?? 4900),
      is_free: is_free ?? false,
      duration_days: 30,
      max_members: 50,
      status: "draft",
      season_number: newSeasonNumber,
      parent_club_id,
    })
    .select("id, slug, season_number")
    .single();

  if (createErr || !newClub) {
    return new Response(JSON.stringify({ error: createErr?.message ?? "Failed to create season" }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Kick off mission generation in the background
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  fetch(`${supabaseUrl}/functions/v1/generate-missions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ club_id: newClub.id, goal }),
  }).catch(() => {});

  return new Response(JSON.stringify({ ok: true, club: newClub }), {
    headers: { ...corsHeaders, "content-type": "application/json" }
  });
});
