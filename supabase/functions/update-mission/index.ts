import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { mission_id, title, description, type } = await req.json();

  if (!mission_id || !title) {
    return new Response(JSON.stringify({ error: "mission_id, title required" }), {
      status: 400, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Verify trainer owns the club this mission belongs to
  const { data: mission } = await sb
    .from("missions")
    .select("id, club_id, clubs(trainer_id)")
    .eq("id", mission_id)
    .single();

  const { data: trainer } = await sb.from("trainers").select("id").eq("email", trainer_email).single();

  const clubTrainerId = (mission?.clubs as any)?.trainer_id;
  if (!trainer || !mission || clubTrainerId !== trainer.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 403, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const updates: Record<string, unknown> = { title, edited_by_trainer: true };
  if (description !== undefined) updates.description = description;
  if (type !== undefined) updates.type = type;

  const { error } = await sb.from("missions").update(updates).eq("id", mission_id);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, "content-type": "application/json" }
  });
});
