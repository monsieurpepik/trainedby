import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// This function runs weekly (via pg_cron or manual trigger).
// It calculates earnings for each coach based on confirmed bookings
// in the past week, creates payout records, and notifies the founder.
// Actual bank transfers are initiated manually or via Wise batch API.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Require admin secret for manual triggers
  const adminSecret = req.headers.get("x-admin-secret");
  const expectedSecret = Deno.env.get("ADMIN_SECRET");
  const isCron = req.headers.get("x-supabase-cron") === "1";

  if (!isCron && adminSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Calculate period: last 7 days
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setHours(23, 59, 59, 999);
  const periodStart = new Date(now);
  periodStart.setDate(periodStart.getDate() - 7);
  periodStart.setHours(0, 0, 0, 0);

  const periodStartStr = periodStart.toISOString().split("T")[0];
  const periodEndStr = periodEnd.toISOString().split("T")[0];

  // Get all confirmed bookings in the period, grouped by academy
  const { data: bookings, error: bookErr } = await sb
    .from("academy_bookings")
    .select("id, program_id, academy_id, amount_paid, platform_fee, academy_payout, currency, programs(academy_id)")
    .eq("status", "confirmed")
    .gte("created_at", periodStart.toISOString())
    .lte("created_at", periodEnd.toISOString());

  if (bookErr) {
    console.error("Error fetching bookings:", bookErr);
    return new Response(JSON.stringify({ error: "Failed to fetch bookings" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!bookings || bookings.length === 0) {
    return new Response(JSON.stringify({ message: "No bookings to process", period: `${periodStartStr} to ${periodEndStr}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Aggregate by academy
  const academyTotals: Record<string, { gross: number; fee: number; net: number; currency: string; count: number }> = {};
  for (const b of bookings) {
    const aid = b.academy_id;
    if (!academyTotals[aid]) {
      academyTotals[aid] = { gross: 0, fee: 0, net: 0, currency: b.currency, count: 0 };
    }
    academyTotals[aid].gross += Number(b.amount_paid) || 0;
    academyTotals[aid].fee += Number(b.platform_fee) || 0;
    academyTotals[aid].net += Number(b.academy_payout) || 0;
    academyTotals[aid].count += 1;
  }

  // Get academy coaches for each academy
  const academyIds = Object.keys(academyTotals);
  const { data: coaches } = await sb
    .from("academy_coaches")
    .select("id, academy_id, name, bank_name, bank_iban, bank_account_name, trainer_id, trainers(name, email)")
    .in("academy_id", academyIds)
    .eq("is_active", true);

  const payoutRecords = [];
  const payoutSummary: string[] = [];

  for (const [academyId, totals] of Object.entries(academyTotals)) {
    const academyCoaches = (coaches || []).filter(c => c.academy_id === academyId);

    if (academyCoaches.length === 0) {
      // No coaches registered, payout goes to academy account directly
      payoutRecords.push({
        coach_id: null,
        academy_id: academyId,
        period_start: periodStartStr,
        period_end: periodEndStr,
        sessions_count: totals.count,
        gross_amount: totals.gross,
        platform_fee: totals.fee,
        net_amount: totals.net,
        currency: totals.currency,
        status: "pending",
      });
    } else {
      // Split net evenly among coaches (simplistic — can be customised per coach rate)
      const perCoachNet = totals.net / academyCoaches.length;
      const perCoachFee = totals.fee / academyCoaches.length;
      const perCoachGross = totals.gross / academyCoaches.length;

      for (const coach of academyCoaches) {
        payoutRecords.push({
          coach_id: coach.id,
          academy_id: academyId,
          period_start: periodStartStr,
          period_end: periodEndStr,
          sessions_count: Math.round(totals.count / academyCoaches.length),
          gross_amount: Math.round(perCoachGross * 100) / 100,
          platform_fee: Math.round(perCoachFee * 100) / 100,
          net_amount: Math.round(perCoachNet * 100) / 100,
          currency: totals.currency,
          status: "pending",
        });
        payoutSummary.push(`• ${coach.name || "Coach"}: ${totals.currency} ${(Math.round(perCoachNet * 100) / 100).toFixed(2)}`);
      }
    }
  }

  // Insert payout records
  const { error: insertErr } = await sb.from("coach_payouts").insert(payoutRecords);
  if (insertErr) {
    console.error("Error inserting payout records:", insertErr);
    return new Response(JSON.stringify({ error: "Failed to create payout records" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Calculate platform revenue
  const totalPlatformRevenue = Object.values(academyTotals).reduce((sum, t) => sum + t.fee, 0);
  const totalGross = Object.values(academyTotals).reduce((sum, t) => sum + t.gross, 0);

  // Notify founder via Telegram
  const telegramToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const founderChatId = Deno.env.get("TELEGRAM_FOUNDER_CHAT_ID");
  if (telegramToken && founderChatId) {
    const msg = [
      `💰 Weekly Academy Payout Report`,
      `📅 ${periodStartStr} → ${periodEndStr}`,
      ``,
      `📊 Summary:`,
      `• Total bookings: ${bookings.length}`,
      `• Gross revenue: AED ${totalGross.toFixed(2)}`,
      `• Platform fee (10%): AED ${totalPlatformRevenue.toFixed(2)}`,
      `• Payout records created: ${payoutRecords.length}`,
      ``,
      `Coach payouts pending:`,
      ...payoutSummary.slice(0, 10),
      payoutSummary.length > 10 ? `...and ${payoutSummary.length - 10} more` : "",
      ``,
      `⚡ Action: Review and approve payouts in admin dashboard`,
    ].filter(Boolean).join("\n");

    await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: founderChatId, text: msg }),
    }).catch(console.error);
  }

  return new Response(
    JSON.stringify({
      success: true,
      period: `${periodStartStr} to ${periodEndStr}`,
      bookings_processed: bookings.length,
      payout_records_created: payoutRecords.length,
      platform_revenue: totalPlatformRevenue,
      total_gross: totalGross,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
