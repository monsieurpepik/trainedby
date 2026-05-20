import { useEffect, useMemo, useRef, useState } from "react";
import { createClient, type RealtimeChannel } from "@supabase/supabase-js";

interface Msg {
  id: string;
  userName: string;
  text: string;
  ts: number;
}

interface Props {
  liveSessionId: string;
  userName: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function LiveChat({ liveSessionId, userName, supabaseUrl, supabaseAnonKey }: Props) {
  const sb = useMemo(() => createClient(supabaseUrl, supabaseAnonKey), [supabaseUrl, supabaseAnonKey]);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const channelRef = useRef<RealtimeChannel | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ch = sb.channel(`chat:${liveSessionId}`)
      .on("broadcast", { event: "msg" }, ({ payload }) => {
        setMsgs((prev) => [...prev, payload as Msg].slice(-50));
      })
      .subscribe();
    channelRef.current = ch;
    return () => { sb.removeChannel(ch); };
  }, [sb, liveSessionId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const send = () => {
    const t = text.trim();
    if (!t || !channelRef.current) return;
    const m: Msg = { id: crypto.randomUUID(), userName, text: t, ts: Date.now() };
    channelRef.current.send({ type: "broadcast", event: "msg", payload: m });
    setMsgs((prev) => [...prev, m].slice(-50));
    setText("");
  };

  return (
    <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, display: "flex", flexDirection: "column", height: 360 }}>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid #222", fontSize: 12, color: "#666", fontWeight: 600 }}>
        LIVE CHAT
      </div>
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 6 }}
      >
        {msgs.length === 0 && (
          <div style={{ color: "#555", fontSize: 12, textAlign: "center", marginTop: 16 }}>No messages yet</div>
        )}
        {msgs.map((m) => (
          <div key={m.id} style={{ color: "#ddd", fontSize: 13, lineHeight: 1.4 }}>
            <span style={{ color: "#7c3aed", fontWeight: 600 }}>{m.userName}</span>{" "}{m.text}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, padding: 8, borderTop: "1px solid #222" }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Say something…"
          style={{
            flex: 1, background: "#0f0e0d", border: "1px solid #222", color: "#fff",
            borderRadius: 6, padding: "8px 10px", fontSize: 13, fontFamily: "inherit", outline: "none",
          }}
        />
        <button
          onClick={send}
          style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 6, padding: "8px 14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
