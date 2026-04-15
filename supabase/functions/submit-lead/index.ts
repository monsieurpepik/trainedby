import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Input Sanitization ───────────────────────────────────────────────────────
function sanitize(value: string | undefined | null, maxLen = 500): string {
  if (!value) return "";
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, "")
    .trim()
    .slice(0, maxLen);
}

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Limits lead submissions to 5 per IP per minute to prevent spam.
async function checkRateLimit(
  sb: ReturnType<typeof createClient>,
  key: string,
  maxCount: number,
  windowMinutes: number
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  await sb.from("rate_limits")
    .delete()
    .eq("key", key)
    .lt("window_start", windowStart);

  const { data: existing } = await sb.from("rate_limits")
    .select("id, count")
    .eq("key", key)
    .gte("window_start", windowStart)
    .single();

  if (!existing) {
    await sb.from("rate_limits").insert({ key, count: 1 });
    return true;
  }

  if (existing.count >= maxCount) return false;

  await sb.from("rate_limits")
    .update({ count: existing.count + 1 })
    .eq("id", existing.id);

  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const {
      trainer_id, name, phone, email, goal, type,
      age, gender, weight_kg, height_cm, bmi, tdee,
      activity_level, location_pref, package_id, source,
    } = body;

    // ── Validate trainer_id is a real UUID ────────────────────────────────────
    if (!trainer_id || !isValidUUID(trainer_id)) {
      return new Response(JSON.stringify({ error: "Valid trainer_id required" }), {
        status: 400, headers: corsHeaders,
      });
    }

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── Rate limit: 5 lead submissions per IP per minute ──────────────────────
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const allowed = await checkRateLimit(sb, `submit-lead:ip:${clientIp}`, 5, 1);
    if (!allowed) {
      return new Response(JSON.stringify({ error: "Too many requests. Please slow down." }), {
        status: 429, headers: corsHeaders,
      });
    }

    // ── Sanitize all text inputs ──────────────────────────────────────────────
    const cleanName = sanitize(name, 100);
    const cleanPhone = sanitize(phone, 20);
    const cleanEmail = sanitize(email, 254);
    const cleanGoal = sanitize(goal, 300);
    const cleanType = ["booking", "assessment", "enquiry"].includes(type) ? type : "booking";
    const cleanSource = ["profile", "directory", "referral", "social"].includes(source) ? source : "profile";
    const cleanActivityLevel = sanitize(activity_level, 50);
    const cleanLocationPref = sanitize(location_pref, 100);

    // Validate numeric fields  -  reject if non-numeric values are passed
    const cleanAge = Number.isFinite(Number(age)) && age > 0 && age < 120 ? Number(age) : null;
    const cleanWeightKg = Number.isFinite(Number(weight_kg)) && weight_kg > 0 ? Number(weight_kg) : null;
    const cleanHeightCm = Number.isFinite(Number(height_cm)) && height_cm > 0 ? Number(height_cm) : null;
    const cleanBmi = Number.isFinite(Number(bmi)) ? Number(bmi) : null;
    const cleanTdee = Number.isFinite(Number(tdee)) ? Number(tdee) : null;
    const cleanPackageId = package_id && isValidUUID(package_id) ? package_id : null;
    const cleanGender = ["male", "female", "other"].includes(gender) ? gender : null;

    // ── Insert lead ───────────────────────────────────────────────────────────
    const { data: lead, error } = await sb.from("leads").insert({
      trainer_id,
      name: cleanName,
      phone: cleanPhone || null,
      email: cleanEmail || null,
      goal: cleanGoal || null,
      type: cleanType,
      age: cleanAge,
      gender: cleanGender,
      weight_kg: cleanWeightKg,
      height_cm: cleanHeightCm,
      bmi: cleanBmi,
      tdee: cleanTdee,
      activity_level: cleanActivityLevel || null,
      location_pref: cleanLocationPref || null,
      package_id: cleanPackageId,
      source: cleanSource,
    }).select().single();

    if (error) throw error;

    // ── Log event ─────────────────────────────────────────────────────────────
    await sb.from("events").insert({
      trainer_id,
      event_type: cleanType === "assessment" ? "assessment_complete" : "booking_request",
    });

    // ── Fetch trainer for notification ────────────────────────────────────────
    const { data: trainer } = await sb.from("trainers")
      .select("name,phone,plan")
      .eq("id", trainer_id)
      .single();

    // ── Send WhatsApp notification to trainer (Pro+ only) ─────────────────────
    if (trainer?.plan !== "free" && trainer?.phone) {
      await sendWhatsAppNotification(trainer, { name: cleanName, goal: cleanGoal, type: cleanType });
    }

    return new Response(JSON.stringify({ ok: true, lead_id: lead.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("submit-lead error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: corsHeaders,
    });
  }
});

async function sendWhatsAppNotification(
  trainer: { name: string; phone: string },
  lead: { name?: string; goal?: string; type?: string }
) {
  const apiKey = Deno.env.get("WHATSAPP_API_KEY");
  const apiUrl = Deno.env.get("WHATSAPP_API_URL");
  if (!apiKey || !apiUrl) return;

  const message = `🔥 New lead on TrainedBy!\n\nName: ${lead.name || "Unknown"}\nGoal: ${lead.goal || "Not specified"}\nType: ${lead.type || "Booking"}\n\nSign in to view: https://trainedby.ae/dashboard`;

  try {
    await fetch(apiUrl, {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ to: trainer.phone, message }),
    });
  } catch (e) {
    console.error("WhatsApp notification failed:", e);
  }
}
