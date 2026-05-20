// src/components/video/VideoManagementDashboard.tsx
import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Video {
  id: string;
  title: string;
  duration_seconds?: number | null;
  thumbnail_url?: string | null;
  is_free: boolean;
  status: string;
  created_at: string;
}

interface Props {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VideoManagementDashboard({ supabaseUrl, supabaseAnonKey }: Props) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'noauth'>('loading');

  const sb = useMemo(() => createClient(supabaseUrl, supabaseAnonKey), [supabaseUrl, supabaseAnonKey]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { setState('noauth'); return; }

      const { data: trainer } = await sb
        .from('trainers')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();

      if (!trainer) { setState('noauth'); return; }

      const { data } = await sb
        .from('videos')
        .select('id,title,duration_seconds,thumbnail_url,is_free,status,created_at')
        .eq('trainer_id', trainer.id)
        .order('created_at', { ascending: false });

      setVideos((data ?? []) as Video[]);
      setState('ready');
    }
    load();
  }, [sb]);

  if (state === 'loading') return <div style={{ padding: '40px 16px', color: '#555', fontFamily: 'Manrope, system-ui, sans-serif', textAlign: 'center' }}>Loading…</div>;
  if (state === 'noauth') {
    if (typeof window !== 'undefined') window.location.href = '/join';
    return null;
  }

  const statusColor = (s: string) => s === 'ready' ? '#4ade80' : s === 'errored' ? '#f87171' : '#888';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px 80px', fontFamily: 'Manrope, system-ui, sans-serif', color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900 }}>My videos</h1>
        <a href="/dashboard/videos/new" style={{ background: '#7c3aed', borderRadius: 8, padding: '11px 22px', fontSize: 14, fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
          + Upload video
        </a>
      </div>

      {videos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📹</div>
          <div style={{ fontSize: 15, color: '#555', marginBottom: 20 }}>No videos yet.</div>
          <a href="/dashboard/videos/new" style={{ background: '#7c3aed', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
            Upload your first workout
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {videos.map(v => (
            <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: '#111', borderRadius: 10 }}>
              <div style={{ width: 64, height: 36, borderRadius: 6, background: v.thumbnail_url ? `url(${v.thumbnail_url}) center/cover` : '#1a1a1a', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.title}</div>
                <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#666' }}>
                  <span style={{ color: statusColor(v.status) }}>● {v.status}</span>
                  <span>{formatDuration(v.duration_seconds)}</span>
                  {v.is_free && <span style={{ color: '#4ade80' }}>Free</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
