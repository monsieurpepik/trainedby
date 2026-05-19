// src/components/club/ClubAlumniView.tsx
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SeasonBadge } from './SeasonBadge';

interface Props {
  slug: string;
  clubId: string;
  seasonNumber: number;
  completedSeasonNumber: number;
  successorSlug: string | null;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function ClubAlumniView({ slug, clubId, seasonNumber, completedSeasonNumber, successorSlug, supabaseUrl, supabaseAnonKey }: Props) {
  const [stats, setStats] = useState<{ days_completed: number; max_streak: number } | null>(null);

  const sb = createClient(supabaseUrl, supabaseAnonKey);

  useEffect(() => {
    async function loadStats() {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;

      const { data } = await sb
        .from('checkins')
        .select('streak_day')
        .eq('club_id', clubId)
        .eq('user_id', user.id)
        .order('streak_day', { ascending: false });

      if (data && data.length > 0) {
        setStats({
          days_completed: data.length,
          max_streak: data[0].streak_day,
        });
      }
    }
    loadStats();
  }, [clubId]);

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 16px 80px', fontFamily: 'Manrope, system-ui, sans-serif', color: '#fff', textAlign: 'center' }}>
      <div style={{ marginBottom: 24 }}>
        <SeasonBadge seasonNumber={completedSeasonNumber} isCompleted size="md" />
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>You finished Season {completedSeasonNumber}</h2>
      {stats && (
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', margin: '24px 0' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '16px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#4ade80' }}>{stats.days_completed}</div>
            <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>days completed</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '16px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#f97316' }}>🔥 {stats.max_streak}</div>
            <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>longest streak</div>
          </div>
        </div>
      )}
      {successorSlug ? (
        <div>
          <p style={{ fontSize: 14, color: '#aaa', marginBottom: 20 }}>Season {seasonNumber} is open. Join as an alumni.</p>
          <a
            href={`/clubs/join/${successorSlug}`}
            style={{ display: 'block', background: '#7c3aed', borderRadius: 12, padding: '15px 24px', fontSize: 15, fontWeight: 700, color: '#fff', textDecoration: 'none' }}
          >
            Join Season {seasonNumber} →
          </a>
        </div>
      ) : (
        <p style={{ fontSize: 14, color: '#555', marginTop: 16 }}>Season {seasonNumber} hasn't launched yet. You'll be notified when it does.</p>
      )}
    </div>
  );
}
