// src/components/video/UploadZone.tsx
import { useState, useRef } from 'react';

interface Props {
  supabaseUrl: string;
  supabaseAnonKey: string;
  accessToken: string;
  onUploaded: (videoId: string) => void;
}

export function UploadZone({ supabaseUrl, supabaseAnonKey, accessToken, onUploaded }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file || !title.trim()) {
      setErrorMsg('Title and video file are required.');
      return;
    }
    setStatus('uploading');
    setProgress(0);
    setErrorMsg('');

    try {
      // 1. Get upload URL from our edge function
      const urlRes = await fetch(`${supabaseUrl}/functions/v1/get-mux-upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || null, is_free: isFree }),
      });
      const urlData = await urlRes.json();
      if (!urlData.ok) throw new Error(urlData.error ?? 'Failed to get upload URL');

      const { upload_url, video_id } = urlData;

      // 2. Upload file directly to Mux via PUT
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', e => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        });
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        });
        xhr.addEventListener('error', () => reject(new Error('Upload network error')));
        xhr.open('PUT', upload_url);
        xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
        xhr.send(file);
      });

      setStatus('done');
      onUploaded(video_id);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed');
    }
  }

  if (status === 'done') {
    return (
      <div style={{ padding: '24px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 12, textAlign: 'center' }}>
        <div style={{ fontSize: 22, marginBottom: 8 }}>✓</div>
        <div style={{ fontSize: 14, color: '#4ade80', fontWeight: 700 }}>Upload complete</div>
        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Mux is processing your video. It will appear as "ready" in a few minutes.</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Manrope, system-ui, sans-serif' }}>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, color: '#888', fontWeight: 600, display: 'block', marginBottom: 6 }}>Title *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Full Body HIIT — 30 minutes"
          style={{ width: '100%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, color: '#888', fontWeight: 600, display: 'block', marginBottom: 6 }}>Description (optional)</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          placeholder="What's in this workout?"
          style={{ width: '100%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <input type="checkbox" id="is-free" checked={isFree} onChange={e => setIsFree(e.target.checked)} />
        <label htmlFor="is-free" style={{ fontSize: 13, color: '#aaa', cursor: 'pointer' }}>
          Free teaser — visible to everyone (non-subscribers)
        </label>
      </div>

      <div
        onClick={() => fileRef.current?.click()}
        style={{
          border: '2px dashed rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: '32px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: 16,
          transition: 'border-color 0.15s',
        }}
        onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLDivElement).style.borderColor = '#7c3aed'; }}
        onDragLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
        onDrop={e => {
          e.preventDefault();
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)';
          const dt = e.dataTransfer;
          if (dt.files[0] && fileRef.current) {
            const transfer = new DataTransfer();
            transfer.items.add(dt.files[0]);
            fileRef.current.files = transfer.files;
          }
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }}>📹</div>
        <div style={{ fontSize: 14, color: '#aaa' }}>Drop a video file or click to browse</div>
        <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>MP4, MOV, MKV · up to 2GB</div>
        <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={() => setStatus('idle')} />
      </div>

      {progress !== null && status === 'uploading' && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#888' }}>Uploading…</span>
            <span style={{ fontSize: 12, color: '#888' }}>{progress}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 100, height: 4 }}>
            <div style={{ background: '#7c3aed', borderRadius: 100, height: '100%', width: `${progress}%`, transition: 'width 0.2s' }} />
          </div>
        </div>
      )}

      {errorMsg && <div style={{ fontSize: 13, color: '#f87171', marginBottom: 12 }}>{errorMsg}</div>}

      <button
        onClick={handleUpload}
        disabled={status === 'uploading'}
        style={{ background: '#7c3aed', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 700, color: '#fff', cursor: status === 'uploading' ? 'not-allowed' : 'pointer', opacity: status === 'uploading' ? 0.6 : 1, fontFamily: 'inherit', width: '100%' }}
      >
        {status === 'uploading' ? `Uploading ${progress}%…` : 'Upload video'}
      </button>
    </div>
  );
}
