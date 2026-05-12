import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_NAME = 80;
const MAX_TITLE = 60;
const MAX_SPECIALTY = 40;
const MAX_SPECIALTIES = 10;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const { name, specialties, title, market } = body;

    if (!name || typeof name !== "string") {
      return new Response(JSON.stringify({ error: "name required" }), {
        status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }
    if (name.length > MAX_NAME) {
      return new Response(JSON.stringify({ error: "name too long" }), {
        status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const safeTitle = typeof title === "string" ? title.slice(0, MAX_TITLE) : "Personal Trainer";
    const specialtyList = Array.isArray(specialties) && specialties.length
      ? specialties
          .slice(0, MAX_SPECIALTIES)
          .map((s) => String(s).trim().slice(0, MAX_SPECIALTY))
          .filter(Boolean)
          .join(", ")
      : "fitness";
    const marketHint = market === "ae" ? "based in Dubai" : market === "us" ? "based in the US" : "";

    const prompt = `Write a professional fitness trainer bio in 2-3 sentences (max 160 characters).
Trainer name: ${name}
Title: ${safeTitle}
Specialties: ${specialtyList}
${marketHint ? `Location: ${marketHint}` : ""}
Write in first person. Be specific and energetic. No hashtags. No emojis.`;

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY not set");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    let response: Response;
    try {
      response = await fetch("https://api.anthropic.com/v1/messages", {
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
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic error:", err);
      throw new Error("Anthropic API failed");
    }

    const data = await response.json();
    const bio = data.content?.[0]?.text?.trim() ?? "";

    if (!bio) {
      return new Response(JSON.stringify({ error: "Bio generation failed" }), {
        status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

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
