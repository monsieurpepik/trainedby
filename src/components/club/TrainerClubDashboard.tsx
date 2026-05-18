import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { StreakBadge } from './StreakBadge';

interface Roster {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  checked_in_today: boolean;
  streak_day: number;
}

interface Mission {
  id: string;
  day_number: number;
  title: string;
  description: string | null;
  type: string;
  ai_draft: boolean;
  edited_by_trainer: boolean;
}

interface DashboardData {
  club: {
    id: string;
    name: string;
    duration_days: number;
    status: string;
  };
  stats: {
    total_members: number;
    checked_in_today: number;
    avg_completion: number;
    at_risk: number;
  };
  roster: Roster[];
  upcoming_missions: Mission[];
  current_day: number;
}

interface Props {
  slug: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function TrainerClubDashboard({ slug, supabaseUrl, supabaseAnonKey }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [trainerEmail, setTrainerEmail] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [shoutoutSending, setShoutoutSending] = useState(false);

  useEffect(() => {
    const sb = createClient(supabaseUrl, supabaseAnonKey);
    sb.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setTrainerEmail(user.email);
    });
    loadData();
  }, [slug]);

  function loadData() {
    fetch(`${supabaseUrl}/functions/v1/get-club-dashboard?slug=${slug}`, {
      headers: { authorization: `Bearer ${supabaseAnonKey}` },
    }).then(r => r.json()).then(setData);
  }

  async function saveEdit(missionId: string) {
    setSaving(true);
    await fetch(`${supabaseUrl}/functions/v1/update-mission`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${supabaseAnonKey}` },
      body: JSON.stringify({ mission_id: missionId, trainer_email: trainerEmail, title: editTitle, description: editDesc }),
    });
    setSaving(false);
    setEditingId(null);
    loadData();
  }

  async function sendShoutout() {
    if (!data?.club) return;
    const text = window.prompt('Message to all members who checked in today:');
    if (!text?.trim()) return;
    setShoutoutSending(true);
    await fetch(`${supabaseUrl}/functions/v1/send-shoutout`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${supabaseAnonKey}` },
      body: JSON.stringify({ club_id: data.club.id, trainer_email: trainerEmail, text: text.trim() }),
    });
    setShoutoutSending(false);
  }

  if (!data) {
    return <p style={{ color: '#888', padding: 20, fontFamily: 'Manrope, system-ui, sans-serif' }}>Loading…</p>;
  }

  const { club, stats, roster, upcoming_missions, current_day } = data;
  const base: React.CSSProperties = { fontFamily: 'Manrope, system-ui, sans-serif', color: '#fff' };

  return (
    <div style={{ ...base, maxWidth: 560, margin: '0 auto', padding: '24px 16px 80px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{club.name}</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
            Day {current_day} of {club.duration_days} · {stats.total_members} members
          </div>
        </div>
        <span style={{
          background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)',
          borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#4ade80', fontWeight: 600,
        }}>
          ● {club.status}
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
        {[
          { value: `${stats.checked_in_today}/${stats.total_members}`, label: 'checked in today', color: '#16a34a' },
          { value: `${stats.avg_completion}%`, label: 'avg completion', color: '#a78bfa' },
          { value: String(stats.at_risk), label: 'at risk today', color: '#f59e0b' },
        ].map(({ value, label, color }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Roster */}
      <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Members</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 16 }}>
        {roster.slice(0, 6).map(m => (
          <div key={m.user_id} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: m.checked_in_today ? 'rgba(22,163,74,0.08)' : 'rgba(255,255,255,0.03)',
            borderRadius: 8, padding: '8px 10px',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: '#7c3aed', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff',
            }}>
              {m.display_name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, fontSize: 13, color: m.checked_in_today ? '#fff' : '#aaa' }}>
              {m.display_name}
            </div>
            {m.streak_day > 0 && <StreakBadge days={m.streak_day} />}
            <span style={{ fontSize: 12, color: m.checked_in_today ? '#16a34a' : '#f59e0b', fontWeight: 600 }}>
              {m.checked_in_today ? '✓' : 'pending'}
            </span>
          </div>
        ))}
        {roster.length > 6 && (
          <div style={{ textAlign: 'center', fontSize: 12, color: '#555', padding: 6 }}>
            + {roster.length - 6} more members
          </div>
        )}
      </div>

      {/* Shoutout */}
      <button
        onClick={sendShoutout}
        disabled={shoutoutSending}
        style={{
          width: '100%', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: 8, padding: 10, fontSize: 13, color: '#a78bfa', cursor: 'pointer',
          marginBottom: 24, fontFamily: 'inherit', opacity: shoutoutSending ? 0.6 : 1,
        }}
      >
        📣 Send shoutout to today's {stats.checked_in_today} check-ins
      </button>

      {/* Mission Queue */}
      <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Mission Queue</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {upcoming_missions.map((m, i) => (
          <div key={m.id} style={{
            background: i === 0 ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.04)',
            border: i === 0 ? '1px solid rgba(124,58,237,0.2)' : 'none',
            borderRadius: 8, padding: '9px 12px',
          }}>
            {editingId === m.id ? (
              <div>
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 4, padding: '4px 8px', color: '#fff', fontSize: 13, marginBottom: 6, fontFamily: 'inherit' }}
                />
                <input
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  placeholder="Description (optional)"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 4, padding: '4px 8px', color: '#fff', fontSize: 12, fontFamily: 'inherit' }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => saveEdit(m.id)}
                    disabled={saving}
                    style={{ background: '#7c3aed', border: 'none', borderRadius: 4, padding: '4px 12px', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    style={{ background: 'none', border: 'none', color: '#888', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 11, color: i === 0 ? '#a78bfa' : '#666', minWidth: 50 }}>
                  Day {m.day_number}
                </div>
                <div style={{ flex: 1, fontSize: 13, color: i === 0 ? '#fff' : '#ccc' }}>{m.title}</div>
                <button
                  onClick={() => { setEditingId(m.id); setEditTitle(m.title); setEditDesc(m.description ?? ''); }}
                  style={{ background: 'none', border: 'none', color: i === 0 ? '#a78bfa' : '#555', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  ✏ edit
                </button>
              </div>
            )}
          </div>
        ))}
        {upcoming_missions.length === 0 && (
          <p style={{ color: '#555', fontSize: 13 }}>Missions are being generated… refresh in 30 seconds.</p>
        )}
      </div>
    </div>
  );
}
