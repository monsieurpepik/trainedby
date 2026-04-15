import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── UAE: REPs UAE register scraper ──────────────────────────────────────────
async function checkRepsUAE(repsNumber: string, trainerName: string): Promise<{
  found: boolean; nameMatch: boolean; status: string; rawName?: string;
}> {
  try {
    const searchUrl = `https://repsuae.com/searcht?search=${encodeURIComponent(repsNumber)}`;
    const res = await fetch(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TrainedBy-Verify/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { found: false, nameMatch: false, status: "register_unavailable" };

    const html = await res.text();

    // REPs UAE search returns a table with trainer name and registration number
    const found = html.includes(repsNumber.toUpperCase()) || html.includes(repsNumber.toLowerCase());
    if (!found) return { found: false, nameMatch: false, status: "not_found" };

    // Try to extract the name from the result row
    const nameMatch = trainerName
      ? html.toLowerCase().includes(trainerName.split(" ")[0].toLowerCase())
      : true; // If no name provided, skip name check

    return { found: true, nameMatch, status: nameMatch ? "verified" : "name_mismatch" };
  } catch (e) {
    console.error("REPs UAE scrape error:", e);
    return { found: false, nameMatch: false, status: "scrape_error" };
  }
}

// ─── UK: REPs UK register scraper ────────────────────────────────────────────
async function checkRepsUK(repsNumber: string, trainerName: string): Promise<{
  found: boolean; nameMatch: boolean; status: string; rawName?: string;
}> {
  try {
    // REPs UK public register search
    const searchUrl = `https://www.reps-uk.org/find-a-trainer/?s=${encodeURIComponent(repsNumber)}`;
    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TrainedBy-Verify/1.0)",
        "Accept": "text/html",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      // Fallback: try CIMSPA register
      return await checkCIMSPA(repsNumber, trainerName);
    }

    const html = await res.text();
    const found = html.includes(repsNumber) ||
      html.toLowerCase().includes(repsNumber.toLowerCase());

    if (!found) {
      // Try CIMSPA as fallback
      return await checkCIMSPA(repsNumber, trainerName);
    }

    const nameMatch = trainerName
      ? html.toLowerCase().includes(trainerName.split(" ")[0].toLowerCase())
      : true;

    return { found: true, nameMatch, status: nameMatch ? "verified" : "name_mismatch" };
  } catch (e) {
    console.error("REPs UK scrape error:", e);
    return { found: false, nameMatch: false, status: "scrape_error" };
  }
}

// ─── UK: CIMSPA register fallback ────────────────────────────────────────────
async function checkCIMSPA(certNumber: string, trainerName: string): Promise<{
  found: boolean; nameMatch: boolean; status: string;
}> {
  try {
    const searchUrl = `https://www.cimspa.co.uk/find-a-professional/?search=${encodeURIComponent(trainerName || certNumber)}`;
    const res = await fetch(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TrainedBy-Verify/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { found: false, nameMatch: false, status: "register_unavailable" };

    const html = await res.text();
    const found = html.toLowerCase().includes(trainerName?.split(" ")[0]?.toLowerCase() || "");
    return { found, nameMatch: found, status: found ? "verified" : "not_found" };
  } catch {
    return { found: false, nameMatch: false, status: "scrape_error" };
  }
}

// ─── US: NASM / ACE / NSCA GraphQL verification ─────────────────────────────
async function checkNASM(certNumber: string, trainerName: string): Promise<{
  found: boolean; nameMatch: boolean; status: string; rawName?: string; certName?: string; certStatus?: string;
}> {
  try {
    const NASM_GRAPHQL = "https://edge-graph.adobe.io/api/de7b6266-9abd-41e1-9c34-15384fab7ee9/graphql";

    const query = `query ValidateByCert($certNumber: String!) {
      validateByCert(certNumber: $certNumber) {
        data {
          certName certNumber country expirationDate firstName lastName state status
        }
      }
    }`;

    const res = await fetch(NASM_GRAPHQL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { certNumber: certNumber.replace(/^NASM-?/i, "") } }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return { found: false, nameMatch: false, status: "register_unavailable" };

    const json = await res.json();
    const records: Array<{
      certName: string; certNumber: string; country: string;
      expirationDate: string; firstName: string; lastName: string;
      state: string; status: string;
    }> = json?.data?.validateByCert?.data ?? [];

    if (!records.length) return { found: false, nameMatch: false, status: "not_found" };

    // Use the first matching record
    const record = records[0];
    const rawName = `${record.firstName} ${record.lastName}`.trim();
    const certStatus = record.status?.toLowerCase(); // 'active', 'expired', 'suspended'

    // Name match: check first name at minimum
    const nameMatch = trainerName
      ? rawName.toLowerCase().includes(trainerName.split(" ")[0].toLowerCase())
      : true;

    // Only 'Active' certs get verified status
    if (certStatus !== "active") {
      return { found: true, nameMatch, status: `cert_${certStatus}`, rawName, certName: record.certName, certStatus };
    }

    return {
      found: true,
      nameMatch,
      status: nameMatch ? "verified" : "name_mismatch",
      rawName,
      certName: record.certName,
      certStatus,
    };
  } catch (e) {
    console.error("NASM verification error:", e);
    return { found: false, nameMatch: false, status: "scrape_error" };
  }
}

// ─── Determine market from cert number format ─────────────────────────────────
function detectCertMarket(certNumber: string): "ae" | "uk" | "us" | "in" | "unknown" {
  const n = certNumber.toUpperCase().trim();
  if (n.startsWith("REP-") || n.startsWith("REP") || /^\d{5,8}$/.test(n)) {
    // Could be UAE or UK — check prefix
    if (n.startsWith("R0") || n.startsWith("REP-UK")) return "uk";
    return "ae"; // Default REPs format to UAE
  }
  if (n.startsWith("NASM") || n.startsWith("ACE") || n.startsWith("NSCA") || n.startsWith("ACSM")) return "us";
  if (n.startsWith("CIMSPA")) return "uk";
  return "unknown";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { trainer_id, reps_number, market, trainer_name } = body;

    // Support both authenticated (from dashboard) and internal (from register-trainer) calls
    const isInternal = req.headers.get("x-internal-key") === Deno.env.get("INTERNAL_SECRET");
    if (!isInternal) {
      const token = req.headers.get("authorization")?.replace("Bearer ", "");
      if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
      const { data: link } = await sb
        .from("magic_links")
        .select("trainer_id, expires_at, used")
        .eq("token", token)
        .eq("used", false)
        .gt("expires_at", new Date().toISOString())
        .single();
      if (!link?.trainer_id || link.trainer_id !== trainer_id) {
        return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
      }
    }

    if (!reps_number) {
      return new Response(JSON.stringify({ error: "Certification number required" }), { status: 400, headers: corsHeaders });
    }

    const certNum = reps_number.trim().toUpperCase();

    // Determine which register to check
    const certMarket = market || detectCertMarket(certNum);

    let result: { found: boolean; nameMatch: boolean; status: string; rawName?: string; certName?: string; certStatus?: string };

    if (certMarket === "uk") {
      result = await checkRepsUK(certNum, trainer_name || "");
    } else if (certMarket === "ae") {
      result = await checkRepsUAE(certNum, trainer_name || "");
    } else if (certMarket === "us") {
      result = await checkNASM(certNum, trainer_name || "");
    } else {
      // India / other — no automated register, set to pending for document review
      result = { found: false, nameMatch: false, status: "manual_review_required" };
    }

    // Map result to verification_status
    let verificationStatus: string;
    let repsVerified = false;

    if (result.status === "verified") {
      verificationStatus = "verified";
      repsVerified = true;
    } else if (result.status === "name_mismatch") {
      verificationStatus = "name_mismatch";
    } else if (result.status === "not_found") {
      verificationStatus = "not_found";
    } else if (result.status === "manual_review_required") {
      verificationStatus = "pending";
    } else if (result.status?.startsWith("cert_")) {
      // NASM cert found but expired/suspended — flag for human review
      verificationStatus = "pending";
    } else {
      // scrape_error or register_unavailable — set to pending, don't penalise
      verificationStatus = "pending";
    }

    // Update trainer record
    await sb.from("trainers").update({
      reps_number: certNum,
      verification_status: verificationStatus,
      reps_verified: repsVerified,
      verified_at: repsVerified ? new Date().toISOString() : null,
    }).eq("id", trainer_id);

    // Notify admin via Telegram for anything that needs human review
    const needsHumanReview = ["name_mismatch", "pending", "not_found"].includes(verificationStatus);
    if (needsHumanReview) {
      const telegramToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
      const chatId = Deno.env.get("FOUNDER_CHAT_ID");
      if (telegramToken && chatId) {
        const emoji = verificationStatus === "name_mismatch" ? "⚠️" : "🔍";
        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: `${emoji} *Verification Review Needed*\n\nTrainer: ${trainer_name || trainer_id}\nCert: \`${certNum}\`\nMarket: ${certMarket}\nStatus: \`${verificationStatus}\`\n\nCheck: /admin`,
            parse_mode: "Markdown",
          }),
        });
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      status: verificationStatus,
      verified: repsVerified,
      market: certMarket,
      certName: (result as { certName?: string }).certName,
      certStatus: (result as { certStatus?: string }).certStatus,
      rawName: result.rawName,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("verify-reps error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
