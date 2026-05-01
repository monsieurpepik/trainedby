import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  try {
    const { name, specialties, title, market } = await req.json();

    if (!name || typeof name !== "string") {
      return new Response(JSON.stringify({ error: "name required" }), {
        status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const specialtyList = Array.isArray(specialties) && specialties.length
      ? specialties.join(", ")
      : "fitness";
    const trainerTitle = title || "Personal Trainer";
    const marketHint = market === "ae" ? "based in Dubai" : market === "us" ? "based in the US" : "";

    const prompt = `Write a professional fitness trainer bio in 2-3 sentences (max 160 characters).
Trainer name: ${name}
Title: ${trainerTitle}
Specialties: ${specialtyList}
${marketHint ? `Location: ${marketHint}` : ""}
Write in first person. Be specific and energetic. No hashtags. No emojis.`;

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY not set");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic error:", err);
      throw new Error("Anthropic API failed");
    }

    const data = await response.json();
    const bio = data.content?.[0]?.text?.trim() ?? "";

    return new Response(JSON.stringify({ bio }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("ai-bio-writer error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
