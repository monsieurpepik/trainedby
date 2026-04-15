import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function checkRepsUAE(repsNumber: string, trainerName: string): Promise<boolean> {
  try {
    const res = await fetch(`https://repsuae.com/searcht?search=${encodeURIComponent(repsNumber)}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TrainedBy-Verify/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return true; // Don't downgrade if register is unavailable
    const html = await res.text();
    return html.includes(repsNumber.toUpperCase()) || html.includes(repsNumber.toLowerCase());
  } catch {
    return true; // Don't downgrade on network error
  }
}

async function checkRepsUK(repsNumber: string): Promise<boolean> {
  try {
    const res = await fetch(`https://www.reps-uk.org/find-a-trainer/?s=${encodeURIComponent(repsNumber)}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TrainedBy-Verify/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return true;
    const html = await res.text();
    return html.includes(repsNumber) || html.toLowerCase().includes(repsNumber.toLowerCase());
  } catch {
    return true;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Allow cron trigger (GET) or manual trigger (POST)
  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Fetch all currently verified trainers with a cert number
    const { data: trainers, error } = await sb
      .from("trainers")
      .select("id, name, email, reps_number, verification_status, market")
      .eq("reps_verified", true)
      .not("reps_number", "is", null);

    if (error) throw error;
    if (!trainers || trainers.length === 0) {
      return new Response(JSON.stringify({ ok: true, message: "No verified trainers to re-check" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = {
      total: trainers.length,
      stillValid: 0,
      lapsed: 0,
      skipped: 0,
      lapsedTrainers: [] as { name: string; email: string; certNumber: string; market: string }[],
    };

    for (const trainer of trainers) {
      if (!trainer.reps_number) { results.skipped++; continue; }

      const market = trainer.market || "ae";
      let stillActive = true;

      if (market === "ae") {
        stillActive = await checkRepsUAE(trainer.reps_number, trainer.name);
      } else if (market === "uk") {
        stillActive = await checkRepsUK(trainer.reps_number);
      } else {
        // India / global certs  -  skip automated re-check, require manual review annually
        results.skipped++;
        continue;
      }

      if (stillActive) {
        results.stillValid++;
      } else {
        // Downgrade to lapsed
        await sb.from("trainers").update({
          verification_status: "lapsed",
          reps_verified: false,
        }).eq("id", trainer.id);

        results.lapsed++;
        results.lapsedTrainers.push({
          name: trainer.name,
          email: trainer.email,
          certNumber: trainer.reps_number,
          market,
        });

        // Send lapse notification email to trainer via lifecycle-email
        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/lifecycle-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            type: "cert_lapsed",
            trainer_id: trainer.id,
          }),
        }).catch(() => {}); // Non-blocking
      }

      // Small delay to avoid hammering the registers
      await new Promise(r => setTimeout(r, 500));
    }

    // Send Telegram summary to founder
    const telegramToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("FOUNDER_CHAT_ID");

    if (telegramToken && chatId) {
      let msg = `📋 *Monthly Re-Verification Report*\n\n`;
      msg += `✅ Still valid: ${results.stillValid}\n`;
      msg += `⚠️ Lapsed: ${results.lapsed}\n`;
      msg += `⏭️ Skipped (manual): ${results.skipped}\n`;
      msg += `📊 Total checked: ${results.total}\n`;

      if (results.lapsedTrainers.length > 0) {
        msg += `\n*Lapsed Trainers:*\n`;
        for (const t of results.lapsedTrainers.slice(0, 10)) {
          msg += ` -  ${t.name} (${t.market.toUpperCase()}) \`${t.certNumber}\`\n`;
        }
        if (results.lapsedTrainers.length > 10) {
          msg += `...and ${results.lapsedTrainers.length - 10} more. See /admin for full list.`;
        }
      }

      await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: "Markdown" }),
      });
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("reverify-agent error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
