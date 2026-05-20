import MuxPlayer from "@mux/mux-player-react";

interface Props {
  playbackId: string;
  token: string;
  title?: string;
}

export function LivePlayer({ playbackId, token, title }: Props) {
  return (
    <div style={{ background: "#000", border: "1px solid #222", borderRadius: 12, overflow: "hidden", position: "relative", aspectRatio: "16 / 9" }}>
      <MuxPlayer
        streamType="live"
        playbackId={playbackId}
        tokens={{ playback: token }}
        accentColor="#7c3aed"
        metadata={{ video_title: title ?? "TrainedBy Live" }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
