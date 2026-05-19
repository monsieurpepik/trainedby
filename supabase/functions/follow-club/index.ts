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

  const { club_id } = await req.json();
  if (!club_id) {
    return new Response(JSON.stringify({ error: "club_id required" }), {
      status: 400, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { error } = await sb
    .from("club_followers")
    .upsert({ club_id, user_id: user.id }, { onConflict: "club_id,user_id" });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ ok: true, following: true }), {
    headers: { ...corsHeaders, "content-type": "application/json" }
  });
});
