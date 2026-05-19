import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (_req) => {
  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
  const siteUrl = Deno.env.get("PUBLIC_SITE_URL") ?? "https://trainedby.com";

  const { data: clubs } = await sb
    .from("clubs")
    .select("id, name, slug, duration_days, starts_at, trainer_id, trainers(email, name)")
    .eq("status", "active");

  let sent = 0;

  for (const club of clubs ?? []) {
    const trainerEmail = (club.trainers as any)?.email;
    const trainerName = (club.trainers as any)?.name;
    if (!trainerEmail) continue;

    // Tomorrow's day number
    const dayNumber = club.starts_at
      ? Math.min(
          Math.max(1, Math.floor((Date.now() - new Date(club.starts_at).getTime()) / 86400000) + 2),
          club.duration_days
        )
      : 1;

    const { data: mission } = await sb
      .from("missions")
      .select("title, description, type")
      .eq("club_id", club.id)
      .eq("day_number", dayNumber)
      .maybeSingle();

    if (!mission) continue;

    // Today's check-in count
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [{ count: checkinCount }, { count: memberCount }] = await Promise.all([
      sb.from("checkins")
        .select("id", { count: "exact", head: true })
        .eq("club_id", club.id)
        .gte("completed_at", todayStart.toISOString()),
      sb.from("club_members")
        .select("id", { count: "exact", head: true })
        .eq("club_id", club.id)
        .eq("status", "active"),
    ]);

    const dashUrl = `${siteUrl}/dashboard/clubs/${club.slug}`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TrainedBy <noreply@trainedby.com>",
        to: trainerEmail,
        subject: `Day ${dayNumber} mission ready — ${club.name}`,
        html: `
<p style="font-family:sans-serif;font-size:15px;">Hi ${trainerName ?? "Coach"},</p>
<p style="font-family:sans-serif;font-size:15px;">Tomorrow is <strong>Day ${dayNumber}</strong> in <strong>${club.name}</strong>.</p>
<table style="background:#f5f5f5;border-radius:8px;padding:16px;margin:16px 0;width:100%;">
  <tr><td style="font-family:sans-serif;font-size:13px;color:#666;">AI draft</td></tr>
  <tr><td style="font-family:sans-serif;font-size:16px;font-weight:600;padding-top:4px;">${mission.title}</td></tr>
  ${mission.description ? `<tr><td style="font-family:sans-serif;font-size:13px;color:#555;padding-top:4px;">${mission.description}</td></tr>` : ''}
</table>
<p style="font-family:sans-serif;font-size:14px;color:#555;">Today: <strong>${checkinCount ?? 0}/${memberCount ?? 0}</strong> members checked in.</p>
<p style="margin-top:20px;">
  <a href="${dashUrl}" style="background:#7c3aed;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-family:sans-serif;font-size:14px;font-weight:600;">
    Review &amp; edit Day ${dayNumber} →
  </a>
</p>
`,
      }),
    }).catch(err => console.error("Resend error:", err));

    sent++;
  }

  return new Response(JSON.stringify({ ok: true, sent }), {
    headers: { "content-type": "application/json" },
  });
});
