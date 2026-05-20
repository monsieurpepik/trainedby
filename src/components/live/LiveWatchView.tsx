import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { LivePlayer } from "./LivePlayer";
import { AttendeeCount } from "./AttendeeCount";
import { LiveDropBar } from "./LiveDropBar";
import { LiveChat } from "./LiveChat";

interface Tier {
  price_cents: number;
  total_spots: number;
  claimed: number;
}

interface Session {
  id: string;
  title: string;
  status: string;
  is_season_drop: boolean;
  drop_tiers: Tier[] | null;
  trainer_id: string;
}

interface Props {
  liveSessionId: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function LiveWatchView({ liveSessionId, supabaseUrl, supabaseAnonKey }: Props) {
  const sb = useMemo(() => createClient(supabaseUrl, supabaseAnonKey), [supabaseUrl, supabaseAnonKey]);
  const [session, setSession] = useState<Session | null>(null);
  const [playback, setPlayback] = useState<{ playbackId: string; token: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState<{ trainerSlug: string } | null>(null);
  const [userName, setUserName] = useState<string>("Guest");
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    let alive = true;

    async function join() {
      // Fetch session metadata
      const { data: sess, error: sessErr } = await sb.from("live_sessions")
        .select("id, title, status, is_season_drop, drop_tiers, trainer_id")
        .eq("id", liveSessionId)
        .maybeSingle();
      if (!alive) return;
      if (sessErr || !sess) { setError("Session not found"); return; }
      setSession(sess as Session);

      if (sess.status !== "live") return; // scheduled or ended — no need to join

      const { data: { session: authSess } } = await sb.auth.getSession();
      if (!authSess) {
        setError("Please sign in to watch");
        return;
      }
      setUserName(authSess.user?.email?.split("@")[0] ?? "Viewer");

      const resp = await fetch(`${supabaseUrl}/functions/v1/join-live-session`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authSess.access_token}`,
          "Content-Type": "application/json",
          "apikey": supabaseAnonKey,
        },
        body: JSON.stringify({ live_session_id: liveSessionId }),
      });
      if (!alive) return;
      const json = await resp.json();
      if (resp.status === 403 && json?.error === "paywall") {
        const { data: trainer } = await sb.from("trainers")
          .select("slug")
          .eq("id", sess.trainer_id)
          .maybeSingle();
        setPaywall({ trainerSlug: trainer?.slug ?? "" });
        return;
      }
      if (!resp.ok) { setError(json?.error ?? "Could not join session"); return; }
      setPlayback({ playbackId: json.playback_id, token: json.token });
    }

    join();

    // Realtime: detect status changes (scheduled → live → ended)
    const channel = sb.channel(`live:${liveSessionId}`)
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "live_sessions", filter: `id=eq.${liveSessionId}` },
        (payload) => {
          if (!alive) return;
          setSession((s) => s ? { ...s, ...(payload.new as Session) } : s);
          // If session just went live and we don't have playback yet, re-join
          if ((payload.new as Session).status === "live" && !playback) {
            join();
          }
        })
      .subscribe();

    return () => { alive = false; sb.removeChannel(channel); };
  }, [sb, liveSessionId, supabaseUrl, supabaseAnonKey]);

  const handleClaim = async () => {
    const { data: { session: authSess } } = await sb.auth.getSession();
    if (!authSess) { window.location.href = "/join"; return; }
    setClaiming(true);
    try {
      const resp = await fetch(`${supabaseUrl}/functions/v1/claim-live-drop-spot`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authSess.access_token}`,
          "Content-Type": "application/json",
          "apikey": supabaseAnonKey,
        },
        body: JSON.stringify({ live_session_id: liveSessionId }),
      });
      const json = await resp.json();
      if (resp.ok && json.checkout_url) {
        window.location.href = json.checkout_url;
        return;
      }
      alert(json?.error ?? "Could not claim spot");
    } finally {
      setClaiming(false);
    }
  };

  // Loading
  if (!session) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontFamily: "Manrope, system-ui, sans-serif" }}>
        Loading…
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, fontFamily: "Manrope, system-ui, sans-serif" }}>
        <div style={{ color: "#f87171", fontSize: 15 }}>{error}</div>
        <a href="/find" style={{ color: "#7c3aed", fontSize: 13 }}>← Find a club</a>
      </div>
    );
  }

  // Paywall
  if (paywall) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "Manrope, system-ui, sans-serif" }}>
        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: 0 }}>Subscribers only</h2>
        <p style={{ color: "#888", fontSize: 14, margin: 0 }}>Subscribe to watch this coach live.</p>
        <a href={`/${paywall.trainerSlug}/videos`} style={{ background: "#7c3aed", color: "#fff", padding: "12px 24px", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 14 }}>
          Subscribe →
        </a>
      </div>
    );
  }

  // Ended
  if (session.status === "ended") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, fontFamily: "Manrope, system-ui, sans-serif" }}>
        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: 0 }}>Stream ended</h2>
        <p style={{ color: "#888", fontSize: 14, margin: 0 }}>Recording will be available in the video library shortly.</p>
      </div>
    );
  }

  // Scheduled (not yet live)
  if (session.status === "scheduled") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, fontFamily: "Manrope, system-ui, sans-serif" }}>
        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: 0 }}>{session.title}</h2>
        <p style={{ color: "#888", fontSize: 14, margin: 0 }}>Stream hasn't started yet. This page will update automatically.</p>
      </div>
    );
  }

  // Live
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "16px", fontFamily: "Manrope, system-ui, sans-serif" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, alignItems: "start" }}>
        {/* Left: player + drop bar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 900, margin: 0 }}>{session.title}</h1>
            <AttendeeCount liveSessionId={liveSessionId} supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} />
          </div>
          {playback ? (
            <LivePlayer playbackId={playback.playbackId} token={playback.token} title={session.title} />
          ) : (
            <div style={{ background: "#000", border: "1px solid #222", borderRadius: 12, aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: 14 }}>
              Connecting to stream…
            </div>
          )}
          {session.is_season_drop && session.drop_tiers && session.drop_tiers.length > 0 && (
            <LiveDropBar
              liveSessionId={liveSessionId}
              initialTiers={session.drop_tiers}
              supabaseUrl={supabaseUrl}
              supabaseAnonKey={supabaseAnonKey}
              onClaim={handleClaim}
            />
          )}
          {claiming && (
            <div style={{ color: "#888", fontSize: 13, textAlign: "center" }}>Redirecting to checkout…</div>
          )}
        </div>
        {/* Right: chat */}
        <LiveChat
          liveSessionId={liveSessionId}
          userName={userName}
          supabaseUrl={supabaseUrl}
          supabaseAnonKey={supabaseAnonKey}
        />
      </div>
    </div>
  );
}
