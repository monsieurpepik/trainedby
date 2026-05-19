import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Verify JWT and extract authenticated trainer email
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const sbAnon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: { user }, error: authErr } = await sbAnon.auth.getUser(token);
  if (authErr || !user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }
  const trainer_email = user.email;

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const {
    name,
    goal,
    duration_days = 30,
    is_free,
    price_cents,
    max_members,
    starts_at,
  } = await req.json();

  if (!name || !goal) {
    return new Response(JSON.stringify({ error: "name, goal required" }), {
      status: 400, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const { data: trainer } = await sb
    .from("trainers")
    .select("id")
    .eq("email", trainer_email)
    .single();

  if (!trainer) {
    return new Response(JSON.stringify({ error: "Trainer not found" }), {
      status: 404, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Generate unique slug
  let baseSlug = slugify(name);
  let slug = baseSlug;
  let attempt = 0;
  while (true) {
    const { data: existing } = await sb.from("clubs").select("id").eq("slug", slug).maybeSingle();
    if (!existing) break;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
    if (attempt > 99) { slug = `${baseSlug}-${Date.now()}`; break; }
  }

  // Calculate ends_at from starts_at + duration_days
  let ends_at: string | null = null;
  if (starts_at) {
    const end = new Date(starts_at);
    end.setDate(end.getDate() + duration_days);
    ends_at = end.toISOString().split('T')[0];
  }

  const { data: club, error } = await sb
    .from("clubs")
    .insert({
      trainer_id: trainer.id,
      slug,
      name,
      goal,
      duration_days,
      is_free: is_free ?? !price_cents,
      price_cents: (is_free || !price_cents) ? null : price_cents,
      max_members: max_members ?? null,
      starts_at: starts_at ?? null,
      ends_at,
      status: 'draft',
    })
    .select("id, slug")
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Kick off mission generation (fire and forget)
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  fetch(`${supabaseUrl}/functions/v1/generate-missions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
    },
    body: JSON.stringify({ club_id: club.id }),
  }).catch(() => {});

  return new Response(JSON.stringify({ ok: true, club_id: club.id, slug: club.slug }), {
    headers: { ...corsHeaders, "content-type": "application/json" }
  });
});
