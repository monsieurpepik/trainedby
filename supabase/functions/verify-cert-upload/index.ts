import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Claude Vision: analyse certificate image ─────────────────────────────────
async function analyseCertWithClaude(imageBase64: string, mimeType: string, trainerName: string, certNumber: string): Promise<{
  confidence: "high" | "medium" | "low";
  extractedName: string;
  extractedCertNumber: string;
  issuingBody: string;
  expiryDate: string | null;
  nameMatch: boolean;
  certMatch: boolean;
  decision: "approve" | "manual_review" | "reject";
  reasoning: string;
}> {
  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY not set");

  const prompt = `You are a fitness certification verification specialist. Analyse this certificate image and extract the following information.

Trainer claims:
- Name: ${trainerName}
- Certification number: ${certNumber}

Extract from the certificate:
1. The full name on the certificate
2. The certification/registration number
3. The issuing body (e.g., NSCA, ACSM, ACE, NASM, REPs UK, CIMSPA, REPs UAE)
4. The expiry date if visible (format: YYYY-MM-DD or null if not found/no expiry)
5. Whether the name on the cert matches the claimed name (allow for minor variations like middle names)
6. Whether the cert number matches the claimed number

Then make a verification decision:
- "approve": High confidence the cert is genuine and matches the claimed details
- "manual_review": Cert looks genuine but something needs human eyes (name variation, partial number visible, expiry unclear)
- "reject": Cert appears fake, heavily edited, or clearly doesn't match claimed details

Respond ONLY with valid JSON in this exact format:
{
  "extractedName": "Full Name on Cert",
  "extractedCertNumber": "CERT-NUMBER",
  "issuingBody": "NSCA",
  "expiryDate": "2026-12-31",
  "nameMatch": true,
  "certMatch": true,
  "confidence": "high",
  "decision": "approve",
  "reasoning": "One sentence explaining the decision"
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType,
              data: imageBase64,
            },
          },
          { type: "text", text: prompt },
        ],
      }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error: ${err}`);
  }

  const data = await res.json();
  const text = data.content[0]?.text || "{}";

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Claude did not return valid JSON");

  return JSON.parse(jsonMatch[0]);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Parse multipart form data
    const contentType = req.headers.get("content-type") || "";

    let trainerId: string;
    let certNumber: string;
    let imageBase64: string;
    let mimeType: string;
    let trainerName: string;

    if (contentType.includes("application/json")) {
      // Accept base64-encoded image in JSON body
      const body = await req.json();
      trainerId = body.trainer_id;
      certNumber = body.cert_number || "";
      imageBase64 = body.image_base64;
      mimeType = body.mime_type || "image/jpeg";
      trainerName = body.trainer_name || "";
    } else {
      return new Response(JSON.stringify({ error: "Send JSON with image_base64 field" }), {
        status: 400, headers: corsHeaders,
      });
    }

    if (!trainerId || !imageBase64) {
      return new Response(JSON.stringify({ error: "trainer_id and image_base64 required" }), {
        status: 400, headers: corsHeaders,
      });
    }

    // Validate trainer exists
    const { data: trainer } = await sb.from("trainers")
      .select("id, name, email, verification_status")
      .eq("id", trainerId)
      .single();

    if (!trainer) {
      return new Response(JSON.stringify({ error: "Trainer not found" }), { status: 404, headers: corsHeaders });
    }

    const resolvedName = trainerName || trainer.name || "";

    // Store the uploaded cert image in Supabase Storage
    const fileName = `certs/${trainerId}/${Date.now()}.jpg`;
    const imageBytes = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0));

    const { error: uploadError } = await sb.storage
      .from("trainer-certs")
      .upload(fileName, imageBytes, { contentType: mimeType, upsert: true });

    const certImageUrl = uploadError ? null : `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/trainer-certs/${fileName}`;

    // Run Claude Vision analysis
    let claudeResult;
    try {
      claudeResult = await analyseCertWithClaude(imageBase64, mimeType as "image/jpeg" | "image/png" | "image/webp", resolvedName, certNumber);
    } catch (e) {
      console.error("Claude Vision error:", e);
      // Fall back to manual review if Claude fails
      claudeResult = {
        confidence: "low" as const,
        extractedName: "",
        extractedCertNumber: certNumber,
        issuingBody: "Unknown",
        expiryDate: null,
        nameMatch: false,
        certMatch: false,
        decision: "manual_review" as const,
        reasoning: "Claude Vision unavailable  -  manual review required",
      };
    }

    // Determine final verification status
    let verificationStatus: string;
    let repsVerified = false;

    if (claudeResult.decision === "approve" && claudeResult.confidence === "high") {
      verificationStatus = "verified";
      repsVerified = true;
    } else if (claudeResult.decision === "approve" && claudeResult.confidence === "medium") {
      verificationStatus = "pending"; // Medium confidence → human confirms
    } else if (claudeResult.decision === "manual_review") {
      verificationStatus = "pending";
    } else {
      verificationStatus = "rejected";
    }

    // Update trainer record
    await sb.from("trainers").update({
      reps_number: certNumber || claudeResult.extractedCertNumber,
      verification_status: verificationStatus,
      reps_verified: repsVerified,
      verified_at: repsVerified ? new Date().toISOString() : null,
    }).eq("id", trainerId);

    // Store verification attempt in cert_reviews table
    await sb.from("cert_reviews").insert({
      trainer_id: trainerId,
      cert_image_url: certImageUrl,
      cert_number: certNumber || claudeResult.extractedCertNumber,
      issuing_body: claudeResult.issuingBody,
      expiry_date: claudeResult.expiryDate,
      extracted_name: claudeResult.extractedName,
      claude_decision: claudeResult.decision,
      claude_confidence: claudeResult.confidence,
      claude_reasoning: claudeResult.reasoning,
      name_match: claudeResult.nameMatch,
      cert_match: claudeResult.certMatch,
      final_status: verificationStatus,
      reviewed_by: "claude-haiku-4-5",
    });

    // Send Telegram alert for anything needing human review
    const telegramToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("FOUNDER_CHAT_ID");

    if (telegramToken && chatId) {
      if (verificationStatus === "pending") {
        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: `🔍 *Cert Review Needed*\n\nTrainer: ${resolvedName}\nEmail: ${trainer.email}\nCert: \`${certNumber || claudeResult.extractedCertNumber}\`\nIssued by: ${claudeResult.issuingBody}\nClaude: ${claudeResult.reasoning}\nConfidence: ${claudeResult.confidence}\n\nReview at /admin → Verification Queue`,
            parse_mode: "Markdown",
          }),
        });
      } else if (verificationStatus === "verified") {
        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: `✅ *Auto-Verified*\n\nTrainer: ${resolvedName}\nCert: \`${claudeResult.extractedCertNumber}\`\nIssued by: ${claudeResult.issuingBody}\nConfidence: high`,
            parse_mode: "Markdown",
          }),
        });
      } else if (verificationStatus === "rejected") {
        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: `❌ *Cert Rejected by Claude*\n\nTrainer: ${resolvedName}\nReason: ${claudeResult.reasoning}\n\nTrainer has been notified.`,
            parse_mode: "Markdown",
          }),
        });
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      status: verificationStatus,
      verified: repsVerified,
      claude: {
        decision: claudeResult.decision,
        confidence: claudeResult.confidence,
        issuingBody: claudeResult.issuingBody,
        reasoning: claudeResult.reasoning,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("verify-cert-upload error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
