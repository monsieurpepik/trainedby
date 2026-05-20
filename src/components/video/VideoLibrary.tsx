// src/components/video/VideoLibrary.tsx
import { useState } from 'react';
import { VideoCard } from './VideoCard';
import { VideoPlayer } from './VideoPlayer';

interface Video {
  id: string;
  title: string;
  description?: string | null;
  duration_seconds?: number | null;
  thumbnail_url?: string | null;
  is_free: boolean;
  status: string;
  mux_playback_id?: string | null;
}

interface Props {
  videos: Video[];
  isSubscriber: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
  accessToken: string | null;
  onSubscribeCta: () => void;
}

export function VideoLibrary({ videos, isSubscriber, supabaseUrl, supabaseAnonKey, accessToken, onSubscribeCta }: Props) {
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [playbackToken, setPlaybackToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);

  async function playVideo(video: Video) {
    if (video.is_free) {
      setPlayingVideo(video);
      setPlaybackToken(null);
      return;
    }
    if (!accessToken) { onSubscribeCta(); return; }

    setTokenLoading(true);
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/get-video-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ video_id: video.id }),
      });
      const data = await res.json();
      if (data.ok) {
        setPlayingVideo(video);
        setPlaybackToken(data.token);
      } else if (res.status === 403) {
        onSubscribeCta();
      }
    } finally {
      setTokenLoading(false);
    }
  }

  const readyVideos = videos.filter(v => v.status === 'ready');
  const processingVideos = videos.filter(v => v.status === 'processing');

  if (playingVideo && playingVideo.mux_playback_id) {
    return (
      <div>
        <button
          onClick={() => { setPlayingVideo(null); setPlaybackToken(null); }}
          style={{ background: 'transparent', border: 'none', color: '#888', fontSize: 13, cursor: 'pointer', marginBottom: 16, fontFamily: 'inherit', padding: 0 }}
        >
          ← Back to library
        </button>
        <VideoPlayer
          playbackId={playingVideo.mux_playback_id}
          token={playbackToken}
          title={playingVideo.title}
          autoPlay
        />
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{playingVideo.title}</div>
          {playingVideo.description && <div style={{ fontSize: 14, color: '#888', lineHeight: 1.6 }}>{playingVideo.description}</div>}
        </div>
      </div>
    );
  }

  return (
    <div>
      {tokenLoading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#555', fontSize: 14 }}>Loading…</div>
      )}

      {!tokenLoading && readyVideos.length === 0 && processingVideos.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#555', fontSize: 14 }}>No videos yet.</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {readyVideos.map(video => (
          <VideoCard
            key={video.id}
            video={video}
            isLocked={!video.is_free && !isSubscriber}
            onClick={playVideo}
          />
        ))}
        {processingVideos.map(video => (
          <VideoCard
            key={video.id}
            video={video}
            isLocked={false}
            onClick={() => {}}
          />
        ))}
      </div>
    </div>
  );
}
