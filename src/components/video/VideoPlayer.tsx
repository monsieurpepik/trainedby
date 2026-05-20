// src/components/video/VideoPlayer.tsx
import MuxPlayer from "@mux/mux-player-react";

interface Props {
  playbackId: string;
  token?: string | null;
  title?: string;
  autoPlay?: boolean;
}

export function VideoPlayer({ playbackId, token, title, autoPlay }: Props) {
  const src = token
    ? `https://stream.mux.com/${playbackId}.m3u8?token=${token}`
    : undefined;

  return (
    <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
      <MuxPlayer
        playbackId={token ? undefined : playbackId}
        src={src}
        metadata={{ video_title: title }}
        autoPlay={autoPlay}
        style={{ width: '100%', aspectRatio: '16/9' }}
        accentColor="#7c3aed"
      />
    </div>
  );
}
