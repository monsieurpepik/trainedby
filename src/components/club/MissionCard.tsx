import { useState } from 'react';

interface Mission {
  id: string;
  day_number: number;
  title: string;
  description: string | null;
  type: string;
}

interface Props {
  mission: Mission;
  clubId: string;
  userId: string;
  alreadyDone: boolean;
  streakDay: number;
  supabaseUrl: string;
  supabaseAnonKey: string;
  onCheckin: (streakDay: number) => void;
}

export function MissionCard({ mission, clubId, userId, alreadyDone, streakDay, supabaseUrl, supabaseAnonKey, onCheckin }: Props) {
  const [done, setDone] = useState(alreadyDone);
  const [loading, setLoading] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(streakDay);

  async function handleCheckin() {
    if (done || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/submit-checkin`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ club_id: clubId, mission_id: mission.id, user_id: userId }),
      });
      const data = await res.json();
      if (data.ok) {
        setDone(true);
        const newStreak = data.streak_day ?? currentStreak + 1;
        setCurrentStreak(newStreak);
        onCheckin(newStreak);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: 'rgba(124,58,237,0.1)',
      border: '1px solid rgba(124,58,237,0.25)',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    }}>
      <div style={{ fontSize: 11, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
        Day {mission.day_number} Mission
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: mission.description ? 6 : 14 }}>
        {mission.title}
      </div>
      {mission.description && (
        <div style={{ fontSize: 13, color: '#aaa', marginBottom: 14, lineHeight: 1.5 }}>
          {mission.description}
        </div>
      )}
      {done ? (
        <div style={{
          background: 'rgba(22,163,74,0.15)',
          border: '1px solid rgba(22,163,74,0.3)',
          borderRadius: 8,
          padding: '10px 16px',
          textAlign: 'center' as const,
          fontSize: 14,
          fontWeight: 600,
          color: '#4ade80',
        }}>
          ✓ Done · {currentStreak} day streak 🔥
        </div>
      ) : (
        <button
          onClick={handleCheckin}
          disabled={loading}
          style={{
            width: '100%',
            background: '#7c3aed',
            border: 'none',
            borderRadius: 8,
            padding: '12px 16px',
            fontSize: 14,
            fontWeight: 700,
            color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            fontFamily: 'inherit',
          }}
        >
          {loading ? 'Saving…' : '✓ I Did It'}
        </button>
      )}
    </div>
  );
}
