import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Admin-only: approve or reject a cert review ──────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Require admin secret header
    const adminSecret = req.headers.get("x-admin-secret");
    const expectedSecret = Deno.env.get("ADMIN_SECRET");
    if (!expectedSecret || adminSecret !== expectedSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const body = await req.json();
    const { action, cert_review_id, trainer_id, reviewer_note } = body;

    if (!action || !cert_review_id || !trainer_id) {
      return new Response(
        JSON.stringify({ error: "action, cert_review_id, and trainer_id are required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return new Response(
        JSON.stringify({ error: "action must be 'approve' or 'reject'" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch the cert review
    const { data: review, error: reviewErr } = await sb
      .from("cert_reviews")
      .select("*")
      .eq("id", cert_review_id)
      .single();

    if (reviewErr || !review) {
      return new Response(JSON.stringify({ error: "Cert review not found" }), { status: 404, headers: corsHeaders });
    }

    // Fetch trainer
    const { data: trainer } = await sb
      .from("trainers")
      .select("id, name, email")
      .eq("id", trainer_id)
      .single();

    const now = new Date().toISOString();

    if (action === "approve") {
      // Update cert review record
      await sb.from("cert_reviews").update({
        final_status: "verified",
        reviewed_by: "admin",
        reviewed_at: now,
        reviewer_note: reviewer_note || null,
      }).eq("id", cert_review_id);

      // Update trainer record
      await sb.from("trainers").update({
        verification_status: "verified",
        reps_verified: true,
        verified_at: now,
        reps_number: review.cert_number || null,
      }).eq("id", trainer_id);

      // Send approval email via lifecycle-email
      await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/lifecycle-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({ type: "cert_approved", trainer_id }),
      }).catch(() => {});

      return new Response(JSON.stringify({
        ok: true,
        action: "approved",
        trainer_id,
        message: `${trainer?.name || trainer_id} has been verified.`,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    } else {
      // Reject
      await sb.from("cert_reviews").update({
        final_status: "rejected",
        reviewed_by: "admin",
        reviewed_at: now,
        reviewer_note: reviewer_note || null,
      }).eq("id", cert_review_id);

      // Update trainer record — back to unverified, not banned
      await sb.from("trainers").update({
        verification_status: "rejected",
        reps_verified: false,
      }).eq("id", trainer_id);

      // Send rejection email via lifecycle-email
      await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/lifecycle-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({ type: "cert_rejected", trainer_id, note: reviewer_note }),
      }).catch(() => {});

      return new Response(JSON.stringify({
        ok: true,
        action: "rejected",
        trainer_id,
        message: `${trainer?.name || trainer_id} cert rejected.`,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

  } catch (e) {
    console.error("admin-verify error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
