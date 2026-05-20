// src/components/video/VideoCard.tsx

interface Video {
  id: string;
  title: string;
  description?: string | null;
  duration_seconds?: number | null;
  thumbnail_url?: string | null;
  is_free: boolean;
  status: string;
}

interface Props {
  video: Video;
  isLocked: boolean;
  onClick: (video: Video) => void;
}

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VideoCard({ video, isLocked, onClick }: Props) {
  const isProcessing = video.status === 'processing';

  return (
    <div
      onClick={() => !isLocked && !isProcessing && onClick(video)}
      style={{
        background: '#111',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        overflow: 'hidden',
        cursor: isLocked || isProcessing ? 'default' : 'pointer',
        transition: 'border-color 0.15s',
        position: 'relative',
      }}
      onMouseEnter={e => { if (!isLocked && !isProcessing) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.18)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
    >
      {/* Thumbnail */}
      <div style={{
        aspectRatio: '16/9',
        background: video.thumbnail_url ? `url(${video.thumbnail_url}) center/cover` : '#1a1a1a',
        position: 'relative',
      }}>
        {isLocked && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 6,
          }}>
            <div style={{ fontSize: 24 }}>🔒</div>
            <div style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>Subscribe to watch</div>
          </div>
        )}
        {isProcessing && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontSize: 11, color: '#555' }}>Processing…</div>
          </div>
        )}
        {video.duration_seconds && !isLocked && !isProcessing && (
          <div style={{
            position: 'absolute', bottom: 8, right: 8,
            background: 'rgba(0,0,0,0.75)',
            borderRadius: 4, padding: '2px 6px',
            fontSize: 11, color: '#fff', fontWeight: 600,
          }}>
            {formatDuration(video.duration_seconds)}
          </div>
        )}
        {video.is_free && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            background: 'rgba(74,222,128,0.15)',
            border: '1px solid rgba(74,222,128,0.3)',
            borderRadius: 4, padding: '2px 7px',
            fontSize: 10, color: '#4ade80', fontWeight: 700,
          }}>
            FREE
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4, lineHeight: 1.3 }}>
          {video.title}
        </div>
        {video.description && (
          <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {video.description}
          </div>
        )}
      </div>
    </div>
  );
}
