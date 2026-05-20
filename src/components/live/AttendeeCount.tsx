import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

interface Props {
  liveSessionId: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function AttendeeCount({ liveSessionId, supabaseUrl, supabaseAnonKey }: Props) {
  const sb = useMemo(() => createClient(supabaseUrl, supabaseAnonKey), [supabaseUrl, supabaseAnonKey]);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { count: c } = await sb.from("live_attendees")
        .select("id", { count: "exact", head: true })
        .eq("live_session_id", liveSessionId);
      if (alive) setCount(c ?? 0);
    })();

    const channel = sb.channel(`attendees:${liveSessionId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "live_attendees", filter: `live_session_id=eq.${liveSessionId}` },
        () => setCount((n) => n + 1))
      .subscribe();
    return () => { alive = false; sb.removeChannel(channel); };
  }, [sb, liveSessionId]);

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#111", border: "1px solid #222", borderRadius: 999, padding: "6px 12px", color: "#fff", fontSize: 13, fontWeight: 600 }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: "#ef4444", boxShadow: "0 0 6px #ef4444" }} />
      {count} watching
    </div>
  );
}
