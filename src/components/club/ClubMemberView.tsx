import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { MissionCard } from './MissionCard';
import { ActivityFeed } from './ActivityFeed';

interface Club {
  id: string;
  slug: string;
  name: string;
  goal: string;
  duration_days: number;
  starts_at: string | null;
  member_count: number;
  status: string;
}

interface Mission {
  id: string;
  day_number: number;
  title: string;
  description: string | null;
  type: string;
}

interface Props {
  slug: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

function getDayNumber(startsAt: string | null, durationDays: number): number {
  if (!startsAt) return 1;
  const start = new Date(startsAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - start.getTime()) / 86400000);
  return Math.min(Math.max(1, diffDays + 1), durationDays);
}

export function ClubMemberView({ slug, supabaseUrl, supabaseAnonKey }: Props) {
  const [state, setState] = useState<'loading' | 'not-signed-in' | 'not-member' | 'ready'>('loading');
  const [club, setClub] = useState<Club | null>(null);
  const [mission, setMission] = useState<Mission | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [streakDay, setStreakDay] = useState(0);
  const [dayNumber, setDayNumber] = useState(1);

  useEffect(() => {
    const sb = createClient(supabaseUrl, supabaseAnonKey);

    async function load() {
      // Check auth
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { setState('not-signed-in'); return; }
      setUserId(user.id);

      // Fetch club
      const res = await fetch(`${supabaseUrl}/functions/v1/get-club?slug=${slug}`, {
        headers: { authorization: `Bearer ${supabaseAnonKey}` },
      });
      const clubData = await res.json();
      if (!clubData || clubData.error) { setState('not-member'); return; }
      setClub(clubData);

      // Check membership
      const { data: membership } = await sb
        .from('club_members')
        .select('id')
        .eq('club_id', clubData.id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (!membership) { setState('not-member'); return; }

      // Today's day number
      const day = getDayNumber(clubData.starts_at, clubData.duration_days);
      setDayNumber(day);

      // Fetch today's mission
      const { data: missionData } = await sb
        .from('missions')
        .select('id, day_number, title, description, type')
        .eq('club_id', clubData.id)
        .eq('day_number', day)
        .maybeSingle();

      setMission(missionData ?? null);

      // Check if already checked in today
      if (missionData) {
        const { data: checkin } = await sb
          .from('checkins')
          .select('id, streak_day')
          .eq('mission_id', missionData.id)
          .eq('user_id', user.id)
          .maybeSingle();
        setAlreadyDone(!!checkin);
        setStreakDay(checkin?.streak_day ?? 0);
      }

      setState('ready');
    }

    load();
  }, [slug]);

  const s: React.CSSProperties = {
    fontFamily: 'Manrope, system-ui, sans-serif',
    color: '#fff',
    maxWidth: 560,
    margin: '0 auto',
    padding: '24px 16px 80px',
  };

  if (state === 'loading') {
    return <div style={s}><p style={{ color: '#888', fontSize: 14 }}>Loading…</p></div>;
  }

  if (state === 'not-signed-in') {
    return (
      <div style={{ ...s, textAlign: 'center', paddingTop: 60 }}>
        <p style={{ color: '#888', marginBottom: 16 }}>Sign in to access this club.</p>
        <a href={`/clubs/join/${slug}`} style={{
          background: '#7c3aed', color: '#fff', padding: '10px 20px',
          borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none',
        }}>Join Club</a>
      </div>
    );
  }

  if (state === 'not-member') {
    return (
      <div style={{ ...s, textAlign: 'center', paddingTop: 60 }}>
        <p style={{ color: '#888', marginBottom: 16 }}>You're not a member of this club.</p>
        <a href={`/clubs/join/${slug}`} style={{
          background: '#7c3aed', color: '#fff', padding: '10px 20px',
          borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none',
        }}>Join Club</a>
      </div>
    );
  }

  return (
    <div style={s}>
      {/* Club header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{club?.name}</div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
          Day {dayNumber} of {club?.duration_days} · {club?.member_count} members
        </div>
      </div>

      {/* Mission */}
      {mission ? (
        <MissionCard
          mission={mission}
          clubId={club!.id}
          userId={userId}
          alreadyDone={alreadyDone}
          streakDay={streakDay}
          supabaseUrl={supabaseUrl}
          supabaseAnonKey={supabaseAnonKey}
          onCheckin={(s) => setStreakDay(s)}
        />
      ) : (
        <p style={{ color: '#555', fontSize: 13, marginBottom: 24 }}>
          No mission for today yet — check back soon.
        </p>
      )}

      {/* Feed */}
      <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
        Club Activity Today
      </div>
      <ActivityFeed
        clubId={club!.id}
        supabaseUrl={supabaseUrl}
        supabaseAnonKey={supabaseAnonKey}
      />
    </div>
  );
}
