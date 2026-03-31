import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { trainer_id, name, phone, email, goal, type, age, gender, weight_kg, height_cm, bmi, tdee, activity_level, location_pref, package_id, source } = body;

    if (!trainer_id) return new Response(JSON.stringify({ error: "trainer_id required" }), { status: 400, headers: corsHeaders });

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Insert lead
    const { data: lead, error } = await sb.from("leads").insert({
      trainer_id, name, phone, email, goal,
      type: type || "booking",
      age, gender, weight_kg, height_cm, bmi, tdee,
      activity_level, location_pref, package_id,
      source: source || "profile",
    }).select().single();

    if (error) throw error;

    // Log event
    await sb.from("events").insert({ trainer_id, event_type: type === "assessment" ? "assessment_complete" : "booking_request" });

    // Fetch trainer for notification
    const { data: trainer } = await sb.from("trainers").select("name,phone,plan").eq("id", trainer_id).single();

    // Send WhatsApp notification to trainer (Pro+ only)
    if (trainer?.plan !== "free" && trainer?.phone) {
      await sendWhatsAppNotification(trainer, lead);
    }

    return new Response(JSON.stringify({ ok: true, lead_id: lead.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: corsHeaders });
  }
});

async function sendWhatsAppNotification(trainer: { name: string; phone: string }, lead: { name?: string; goal?: string; type?: string }) {
  // Integrate with your WhatsApp Business API provider (e.g. Twilio, 360dialog, WATI)
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
