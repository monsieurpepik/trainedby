import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Slugify a name
function slugify(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { name, email, phone, title, specialties, reps_number, referred_by } = body;

    if (!name || !email) {
      return new Response(JSON.stringify({ error: "Name and email are required" }), { status: 400, headers: corsHeaders });
    }

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Check if email already exists
    const { data: existing } = await sb.from("trainers").select("id,slug").eq("email", email.toLowerCase()).single();
    if (existing) {
      // Send magic link to existing account
      const token = crypto.randomUUID() + "-" + Date.now().toString(36);
      await sb.from("magic_links").insert({
        email: email.toLowerCase(), token, trainer_id: existing.id,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      });
      await sendWelcomeEmail(email, existing.slug, token, true);
      return new Response(JSON.stringify({ ok: true, existing: true, slug: existing.slug }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate unique slug
    let baseSlug = slugify(name);
    let slug = baseSlug;
    let attempt = 0;
    while (true) {
      const { data: taken } = await sb.from("trainers").select("id").eq("slug", slug).single();
      if (!taken) break;
      attempt++;
      slug = `${baseSlug}${attempt}`;
    }

    // Create trainer
    const { data: trainer, error } = await sb.from("trainers").insert({
      slug, name: name.trim(), email: email.toLowerCase().trim(),
      phone: phone?.trim() || null, title: title?.trim() || null,
      specialties: specialties || [],
      reps_number: reps_number?.trim() || null,
      verification_status: reps_number ? "pending" : "unsubmitted",
      referred_by: referred_by || null,
    }).select().single();

    if (error) throw error;

    // Handle referral
    if (referred_by) {
      await sb.from("referrals").insert({
        referrer_slug: referred_by, referred_email: email.toLowerCase(), referred_id: trainer.id,
      });
    }

    // Generate magic link token
    const token = crypto.randomUUID() + "-" + Date.now().toString(36);
    await sb.from("magic_links").insert({
      email: email.toLowerCase(), token, trainer_id: trainer.id,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });

    // Send welcome email
    await sendWelcomeEmail(email, slug, token, false);

    return new Response(JSON.stringify({ ok: true, slug, trainer_id: trainer.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: corsHeaders });
  }
});

async function sendWelcomeEmail(email: string, slug: string, token: string, isExisting: boolean) {
  const editUrl = `https://trainedby.ae/edit?token=${token}`;
  const profileUrl = `https://trainedby.ae/${slug}`;

  const subject = isExisting ? "Welcome back to TrainedBy" : "Your TrainedBy profile is ready 🔥";
  const headline = isExisting ? "Welcome back!" : "Your profile is live!";
  const body = isExisting
    ? `Sign in to edit your profile and check your leads.`
    : `Your TrainedBy profile is live at <a href="${profileUrl}" style="color:#FF5C00;">${profileUrl}</a>. Complete your profile to get your REPs badge and start receiving leads.`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "TrainedBy <hello@trainedby.ae>",
      to: email,
      subject,
      html: `
        <div style="background:#0a0a0a;padding:40px 24px;font-family:Inter,sans-serif;max-width:480px;margin:0 auto;">
          <div style="margin-bottom:32px;">
            <span style="background:#FF5C00;color:#fff;font-family:Manrope,sans-serif;font-weight:800;font-size:16px;padding:6px 12px;border-radius:8px;">TB</span>
            <span style="color:#fff;font-family:Manrope,sans-serif;font-weight:800;font-size:16px;margin-left:8px;">TrainedBy</span>
          </div>
          <h1 style="color:#fff;font-family:Manrope,sans-serif;font-size:24px;font-weight:800;margin-bottom:8px;">${headline}</h1>
          <p style="color:rgba(255,255,255,0.55);font-size:15px;margin-bottom:28px;line-height:1.6;">${body}</p>
          <a href="${editUrl}" style="display:inline-block;background:#FF5C00;color:#fff;font-family:Manrope,sans-serif;font-weight:700;font-size:15px;padding:16px 32px;border-radius:12px;text-decoration:none;">
            ${isExisting ? "Sign In →" : "Complete My Profile →"}
          </a>
          <p style="color:rgba(255,255,255,0.25);font-size:12px;margin-top:28px;">This sign-in link expires in 15 minutes. Your profile URL: ${profileUrl}</p>
        </div>`,
    }),
  });
}
