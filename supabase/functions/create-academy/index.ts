import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function slugify(text: string): string {
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const {
      name,
      sport,
      contact_email,
      contact_phone,
      whatsapp,
      location,
      city,
      description,
      website_url,
      instagram_url,
    } = await req.json();

    if (!name || !contact_email) {
      return new Response(JSON.stringify({ error: "name and contact_email are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate unique slug
    let baseSlug = slugify(name);
    let slug = baseSlug;
    let attempt = 0;
    while (attempt < 10) {
      const { data: existing } = await sb.from("academies").select("id").eq("slug", slug).maybeSingle();
      if (!existing) break;
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    // Generate magic token for admin access
    const magicToken = crypto.randomUUID();

    const { data: academy, error } = await sb
      .from("academies")
      .insert({
        slug,
        name,
        sport: sport || "multi-sport",
        contact_email,
        contact_phone: contact_phone || null,
        whatsapp: whatsapp || null,
        location: location || null,
        city: city || "Dubai",
        description: description || null,
        website_url: website_url || null,
        instagram_url: instagram_url || null,
        admin_email: contact_email,
        admin_magic_token: magicToken,
        plan: "free",
        verified: false,
      })
      .select()
      .single();

    if (error || !academy) {
      console.error("Academy insert error:", error);
      return new Response(JSON.stringify({ error: "Failed to create academy" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send welcome email with admin link
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const baseUrl = Deno.env.get("SITE_URL") || "https://trainedby.ae";
    const adminUrl = `${baseUrl}/academy/${slug}/admin?token=${magicToken}`;

    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "TrainedBy <noreply@trainedby.ae>",
          to: contact_email,
          subject: `Welcome to TrainedBy — Your Academy Profile is Live`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
              <h2>Welcome to TrainedBy, ${name}! 🎉</h2>
              <p>Your academy profile is live at:</p>
              <p><a href="${baseUrl}/academy/${slug}" style="color:#e85d04;font-weight:600">${baseUrl}/academy/${slug}</a></p>
              <p>Manage your programmes and view bookings here:</p>
              <a href="${adminUrl}" style="display:inline-block;background:#e85d04;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">Open Academy Dashboard →</a>
              <p style="color:#666;font-size:13px">Keep this link safe — it's your admin access link. Don't share it publicly.</p>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
              <p style="color:#999;font-size:12px">TrainedBy — The home of elite coaches in Dubai & the UK</p>
            </div>
          `,
        }),
      }).catch(console.error);
    }

    // Notify founder
    const telegramToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const founderChatId = Deno.env.get("TELEGRAM_FOUNDER_CHAT_ID");
    if (telegramToken && founderChatId) {
      await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: founderChatId,
          text: `🏟 New Academy Registered!\n\n${name}\n📍 ${city || "Dubai"}\n🏅 ${sport || "Multi-sport"}\n📧 ${contact_email}\n\nProfile: ${baseUrl}/academy/${slug}`,
        }),
      }).catch(console.error);
    }

    return new Response(
      JSON.stringify({ academy: { id: academy.id, slug, name }, admin_url: adminUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("create-academy error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
