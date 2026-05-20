import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

interface Tier {
  price_cents: number;
  total_spots: number;
  claimed: number;
}

interface Props {
  liveSessionId: string;
  initialTiers: Tier[];
  supabaseUrl: string;
  supabaseAnonKey: string;
  onClaim: () => void;
}

export function LiveDropBar({ liveSessionId, initialTiers, supabaseUrl, supabaseAnonKey, onClaim }: Props) {
  const sb = useMemo(() => createClient(supabaseUrl, supabaseAnonKey), [supabaseUrl, supabaseAnonKey]);
  const [tiers, setTiers] = useState<Tier[]>(initialTiers);

  useEffect(() => {
    const channel = sb.channel("drops")
      .on("broadcast", { event: "tier_update" }, ({ payload }) => {
        if (payload?.live_session_id === liveSessionId && Array.isArray(payload.drop_tiers)) {
          setTiers(payload.drop_tiers as Tier[]);
        }
      })
      .subscribe();
    return () => { sb.removeChannel(channel); };
  }, [sb, liveSessionId]);

  const activeIdx = tiers.findIndex((t) => t.total_spots === 0 || t.claimed < t.total_spots);
  const soldOut = activeIdx === -1;
  const active = soldOut ? tiers[tiers.length - 1] : tiers[activeIdx];
  const pct = active && active.total_spots > 0
    ? Math.min(100, Math.round((active.claimed / active.total_spots) * 100))
    : 0;

  if (!active) return null;

  return (
    <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>
          AED {(active.price_cents / 100).toFixed(0)}
          <span style={{ color: "#888", fontSize: 13, marginLeft: 8, fontWeight: 500 }}>
            tier {activeIdx >= 0 ? activeIdx + 1 : tiers.length} of {tiers.length}
          </span>
        </div>
        <div style={{ color: "#bbb", fontSize: 13 }}>
          {active.claimed} / {active.total_spots || "∞"} claimed
        </div>
      </div>
      <div style={{ height: 6, background: "#222", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #7c3aed, #f97316)", transition: "width 0.3s" }} />
      </div>
      <button
        onClick={onClaim}
        disabled={soldOut}
        style={{
          background: soldOut ? "#333" : "linear-gradient(90deg, #7c3aed, #f97316)",
          color: "#fff", border: "none", borderRadius: 8, padding: "12px 16px",
          fontWeight: 700, fontSize: 15, cursor: soldOut ? "not-allowed" : "pointer",
          fontFamily: "inherit",
        }}
      >
        {soldOut ? "SOLD OUT" : "Claim spot →"}
      </button>
    </div>
  );
}
