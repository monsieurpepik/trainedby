// src/components/video/VideoUploadDashboard.tsx
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { UploadZone } from './UploadZone';

interface Props {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function VideoUploadDashboard({ supabaseUrl, supabaseAnonKey }: Props) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [uploadedId, setUploadedId] = useState<string | null>(null);

  const sb = createClient(supabaseUrl, supabaseAnonKey);

  if (!loaded) {
    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session) { window.location.href = '/join'; return; }
      setAccessToken(session.access_token);
      setLoaded(true);
    });
    return <div style={{ padding: '40px 16px', color: '#555', fontFamily: 'Manrope, system-ui, sans-serif', textAlign: 'center' }}>Loading…</div>;
  }

  if (!accessToken) {
    return <div style={{ padding: '40px 16px', color: '#555', fontFamily: 'Manrope, system-ui, sans-serif', textAlign: 'center' }}>Not signed in.</div>;
  }

  if (uploadedId) {
    return (
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '40px 16px', fontFamily: 'Manrope, system-ui, sans-serif', color: '#fff', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>✓</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Video uploaded</h2>
        <p style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>Mux is processing your video — it'll be ready in 1–3 minutes.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/dashboard/videos" style={{ background: '#7c3aed', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
            Back to library
          </a>
          <button
            onClick={() => setUploadedId(null)}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 600, color: '#aaa', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Upload another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '32px 16px', fontFamily: 'Manrope, system-ui, sans-serif', color: '#fff' }}>
      <div style={{ marginBottom: 28 }}>
        <a href="/dashboard/videos" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>← My videos</a>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginTop: 12, marginBottom: 4 }}>Upload a workout</h1>
        <p style={{ fontSize: 13, color: '#666' }}>Video goes directly to Mux — never through our servers. Processing takes 1–3 minutes.</p>
      </div>
      <UploadZone
        supabaseUrl={supabaseUrl}
        supabaseAnonKey={supabaseAnonKey}
        accessToken={accessToken}
        onUploaded={(id) => setUploadedId(id)}
      />
    </div>
  );
}
