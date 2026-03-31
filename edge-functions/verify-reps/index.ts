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

    const { trainer_id, reps_number } = await req.json();
    if (link.trainer_id !== trainer_id) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    if (!reps_number) return new Response(JSON.stringify({ error: "REPs number required" }), { status: 400, headers: corsHeaders });

    // Update trainer with submitted REPs number, set to pending verification
    await sb.from("trainers").update({
      reps_number: reps_number.trim().toUpperCase(),
      verification_status: "pending",
      reps_verified: false,
    }).eq("id", trainer_id);

    // Notify admin for manual verification
    // In production: send email to admin, or integrate with REPs UAE API if available
    const adminEmail = Deno.env.get("ADMIN_EMAIL");
    if (adminEmail) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "TrainedBy System <system@trainedby.ae>",
          to: adminEmail,
          subject: `REPs Verification Request — ${reps_number}`,
          html: `<p>Trainer ID: ${trainer_id}<br>REPs Number: ${reps_number}</p><p>Please verify at <a href="https://repsuae.com/searcht">repsuae.com/searcht</a> and update the trainer record.</p>`,
        }),
      });
    }

    return new Response(JSON.stringify({ ok: true, status: "pending" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
