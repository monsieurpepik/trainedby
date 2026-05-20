import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

interface Club { id: string; name: string; }
interface Tier { price_cents: number; total_spots: number; }

interface Props {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

const inputStyle: React.CSSProperties = {
  background: "#0f0e0d", border: "1px solid rgba(255,255,255,0.1)", color: "#fff",
  borderRadius: 6, padding: "10px 12px", fontSize: 14, fontFamily: "inherit", outline: "none",
  width: "100%", boxSizing: "border-box",
};

export function LiveScheduleForm({ supabaseUrl, supabaseAnonKey }: Props) {
  const sb = useMemo(() => createClient(supabaseUrl, supabaseAnonKey), [supabaseUrl, supabaseAnonKey]);
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [clubId, setClubId] = useState("");
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isDrop, setIsDrop] = useState(false);
  const [tiers, setTiers] = useState<Tier[]>([{ price_cents: 9900, total_spots: 10 }]);
  const [result, setResult] = useState<{ session_id: string; rtmp_url: string; stream_key: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await sb.auth.getSession();
      if (!session?.user?.email) return;
      const { data: trainer } = await sb.from("trainers").select("id").eq("email", session.user.email).maybeSingle();
      if (!trainer) return;
      const { data: cs } = await sb.from("clubs").select("id, name").eq("trainer_id", trainer.id).neq("status", "draft");
      setClubs((cs ?? []) as Club[]);
    })();
  }, [sb]);

  const addTier = () => {
    if (tiers.length < 4) setTiers([...tiers, { price_cents: 14900, total_spots: 5 }]);
  };
  const updateTier = (i: number, field: keyof Tier, val: number) => {
    setTiers(tiers.map((t, idx) => idx === i ? { ...t, [field]: val } : t));
  };
  const removeTier = (i: number) => {
    if (tiers.length > 1) setTiers(tiers.filter((_, idx) => idx !== i));
  };

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const { data: { session }, error: sessErr } = await sb.auth.getSession();
      if (sessErr || !session) { setError("Not signed in"); return; }
      const body: Record<string, unknown> = {
        title,
        is_season_drop: isDrop,
        starts_at: startsAt || null,
        club_id: clubId || null,
      };
      if (isDrop) body.drop_tiers = tiers.map((t) => ({ ...t, claimed: 0 }));
      const resp = await fetch(`${supabaseUrl}/functions/v1/start-live-session`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
          "apikey": supabaseAnonKey,
        },
        body: JSON.stringify(body),
      });
      const json = await resp.json();
      if (!resp.ok) { setError(json?.error ?? "Failed to create stream"); return; }
      setResult({ session_id: json.session_id, rtmp_url: json.rtmp_url, stream_key: json.stream_key });
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div style={{ color: "#fff", padding: "32px 16px", maxWidth: 720, margin: "0 auto" }}>
        <div style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ color: "#4ade80", fontWeight: 700, marginBottom: 12 }}>Stream created</div>
          <div style={{ fontFamily: "monospace", fontSize: 13, display: "flex", flexDirection: "column", gap: 8 }}>
            <div><strong style={{ color: "#bbb" }}>RTMP URL:</strong> <span style={{ color: "#fff" }}>{result.rtmp_url}</span></div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <strong style={{ color: "#bbb" }}>Stream Key:</strong>
              <span style={{ background: "#111", padding: "3px 8px", borderRadius: 4, color: "#fff" }}>{result.stream_key}</span>
              <button
                onClick={() => navigator.clipboard.writeText(result.stream_key)}
                style={{ background: "#222", color: "#bbb", border: "none", borderRadius: 4, padding: "4px 8px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
        <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>Point OBS or your encoder at the RTMP URL with the stream key above.</p>
        <a href={`/dashboard/live/${result.session_id}`} style={{ background: "#7c3aed", color: "#fff", padding: "12px 24px", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 14 }}>
          Open control panel →
        </a>
      </div>
    );
  }

  return (
    <div style={{ color: "#fff", padding: "32px 16px", maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20, fontFamily: "Manrope, system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Schedule a live stream</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>Title *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Morning HIIT Drop — Season 4" style={inputStyle} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>Starts at (optional)</label>
        <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} style={inputStyle} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>Link to a club (optional)</label>
        <select value={clubId} onChange={(e) => setClubId(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
          <option value="">— none —</option>
          {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <input type="checkbox" checked={isDrop} onChange={(e) => setIsDrop(e.target.checked)} />
        <span style={{ fontSize: 14, color: "#ddd" }}>Season drop — sell spots with tiered pricing during the live</span>
      </label>

      {isDrop && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>Price tiers (1–4)</div>
          {tiers.map((t, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "end" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11, color: "#666" }}>Price (AED)</label>
                <input
                  type="number" min="1" value={t.price_cents / 100}
                  onChange={(e) => updateTier(i, "price_cents", Math.round(Number(e.target.value) * 100))}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11, color: "#666" }}>Total spots</label>
                <input
                  type="number" min="1" value={t.total_spots}
                  onChange={(e) => updateTier(i, "total_spots", Math.max(1, Number(e.target.value)))}
                  style={inputStyle}
                />
              </div>
              <button
                onClick={() => removeTier(i)}
                disabled={tiers.length === 1}
                style={{ background: "#1a1a1a", color: "#888", border: "1px solid #333", borderRadius: 6, padding: "10px", cursor: tiers.length === 1 ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: tiers.length === 1 ? 0.5 : 1 }}
              >
                ×
              </button>
            </div>
          ))}
          {tiers.length < 4 && (
            <button onClick={addTier} style={{ background: "#1a1a1a", color: "#aaa", border: "1px solid #333", borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontSize: 13, alignSelf: "flex-start", fontFamily: "inherit" }}>
              + Add tier
            </button>
          )}
        </div>
      )}

      {error && <div style={{ color: "#f87171", fontSize: 13 }}>{error}</div>}

      <button
        onClick={submit}
        disabled={submitting || !title.trim()}
        style={{ background: "linear-gradient(90deg, #7c3aed, #f97316)", color: "#fff", border: "none", borderRadius: 8, padding: "13px 28px", fontWeight: 700, fontSize: 14, cursor: submitting || !title.trim() ? "not-allowed" : "pointer", opacity: submitting || !title.trim() ? 0.6 : 1, fontFamily: "inherit", alignSelf: "flex-start" }}
      >
        {submitting ? "Creating…" : "Create stream"}
      </button>
    </div>
  );
}
