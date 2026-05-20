import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { AttendeeCount } from "./AttendeeCount";

interface Tier { price_cents: number; total_spots: number; claimed: number; }
interface Sess {
  id: string;
  title: string;
  status: string;
  mux_stream_key: string | null;
  mux_playback_id: string | null;
  is_season_drop: boolean;
  drop_tiers: Tier[] | null;
  trainer_id: string;
}

interface Props {
  liveSessionId: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function LiveControlPanel({ liveSessionId, supabaseUrl, supabaseAnonKey }: Props) {
  const sb = useMemo(() => createClient(supabaseUrl, supabaseAnonKey), [supabaseUrl, supabaseAnonKey]);
  const [sess, setSess] = useState<Sess | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { session: auth }, error: authErr } = await sb.auth.getSession();
      if (authErr || !auth?.user?.email) { setError("Not signed in"); return; }
      const { data: trainer } = await sb.from("trainers").select("id").eq("email", auth.user.email).maybeSingle();
      if (!trainer) { setError("Trainer profile not found"); return; }
      const { data: s, error: sessErr } = await sb.from("live_sessions")
        .select("id, title, status, mux_stream_key, mux_playback_id, is_season_drop, drop_tiers, trainer_id")
        .eq("id", liveSessionId)
        .maybeSingle();
      if (!alive) return;
      if (sessErr || !s) { setError("Session not found"); return; }
      if (s.trainer_id !== trainer.id) { setError("Not your session"); return; }
      setSess(s as Sess);
    })();

    const channel = sb.channel(`ctrl:${liveSessionId}`)
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "live_sessions", filter: `id=eq.${liveSessionId}` },
        (payload) => {
          if (!alive) return;
          setSess((s) => s ? { ...s, ...(payload.new as Sess) } : s);
        })
      .subscribe();

    return () => { alive = false; sb.removeChannel(channel); };
  }, [sb, liveSessionId]);

  const copyKey = () => {
    if (!sess?.mux_stream_key) return;
    navigator.clipboard.writeText(sess.mux_stream_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const endStream = async () => {
    if (!confirm("End this stream? Viewers will see the recording once Mux processes it.")) return;
    const { data: { session: auth } } = await sb.auth.getSession();
    if (!auth) return;
    setEnding(true);
    try {
      await fetch(`${supabaseUrl}/functions/v1/end-live-session`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${auth.access_token}`,
          "Content-Type": "application/json",
          "apikey": supabaseAnonKey,
        },
        body: JSON.stringify({ live_session_id: liveSessionId }),
      });
    } finally {
      setEnding(false);
    }
  };

  if (error) {
    return <div style={{ color: "#f87171", padding: 24, fontFamily: "Manrope, system-ui, sans-serif" }}>{error}</div>;
  }
  if (!sess) {
    return <div style={{ color: "#888", padding: 24, fontFamily: "Manrope, system-ui, sans-serif" }}>Loading…</div>;
  }

  const totalClaimed = sess.drop_tiers?.reduce((a, t) => a + t.claimed, 0) ?? 0;
  const totalSpots = sess.drop_tiers?.reduce((a, t) => a + t.total_spots, 0) ?? 0;
  const statusBg = sess.status === "live" ? "#ef4444" : sess.status === "ended" ? "#333" : "#1a1a1a";

  return (
    <div style={{ color: "#fff", padding: "24px 16px", maxWidth: 720, margin: "0 auto", fontFamily: "Manrope, system-ui, sans-serif", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>{sess.title}</h1>
        <span style={{ background: statusBg, color: "#fff", padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
          {sess.status.toUpperCase()}
        </span>
      </div>

      {/* Encoder settings */}
      <div style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 12, color: "#666", fontWeight: 600 }}>ENCODER SETTINGS (OBS / Streamlabs)</div>
        <div style={{ fontFamily: "monospace", fontSize: 13, display: "flex", flexDirection: "column", gap: 6 }}>
          <div>
            <span style={{ color: "#888" }}>RTMP URL: </span>
            <span style={{ color: "#fff" }}>rtmps://global-live.mux.com:443/app</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ color: "#888" }}>Stream Key: </span>
            <span style={{ background: "#0f0e0d", padding: "3px 8px", borderRadius: 4, color: "#fff" }}>
              {sess.mux_stream_key ? "••••••••" + sess.mux_stream_key.slice(-4) : "—"}
            </span>
            <button
              onClick={copyKey}
              style={{ background: copied ? "rgba(74,222,128,0.15)" : "#222", color: copied ? "#4ade80" : "#bbb", border: copied ? "1px solid rgba(74,222,128,0.3)" : "1px solid #333", borderRadius: 4, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}
            >
              {copied ? "Copied!" : "Copy key"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <AttendeeCount liveSessionId={liveSessionId} supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} />
        {sess.is_season_drop && (
          <div style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999, padding: "6px 14px", fontSize: 13, color: "#fff" }}>
            Drops: {totalClaimed} / {totalSpots} claimed
          </div>
        )}
      </div>

      {/* Links */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a href={`/live/${sess.id}`} target="_blank" rel="noreferrer" style={{ color: "#7c3aed", fontSize: 13, textDecoration: "none" }}>
          Open viewer page ↗
        </a>
      </div>

      {/* End stream */}
      <button
        onClick={endStream}
        disabled={ending || sess.status === "ended"}
        style={{
          background: sess.status === "ended" ? "#1a1a1a" : "#ef4444",
          color: "#fff", border: "none", borderRadius: 8,
          padding: "13px 28px", fontWeight: 700, fontSize: 14,
          cursor: ending || sess.status === "ended" ? "not-allowed" : "pointer",
          opacity: ending ? 0.6 : 1,
          fontFamily: "inherit", alignSelf: "flex-start",
        }}
      >
        {sess.status === "ended" ? "Stream ended" : ending ? "Ending…" : "End stream"}
      </button>
    </div>
  );
}
