// src/components/club/ClubPublicView.tsx
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { FollowButton } from './FollowButton';
import { SeasonBadge } from './SeasonBadge';

interface Club {
  id: string;
  name: string;
  slug: string;
  goal: string;
  status: string;
  season_number: number;
  public_leaderboard: boolean;
  price_cents: number;
  is_free: boolean;
  max_members: number;
  starts_at: string | null;
  trainer: { full_name: string; avatar_url: string | null } | null;
}

interface CheckinRow {
  user_id: string;
  streak_day: number;
  completed_at: string;
  user: { full_name: string | null; email: string } | null;
}

interface LeaderboardRow {
  user_id: string;
  display_name: string;
  streak: number;
}

interface Props {
  slug: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

function formatName(name: string | null, email: string, isPublic: boolean): string {
  if (!isPublic) {
    const parts = (name ?? email.split('@')[0]).split(' ');
    if (parts.length >= 2) return `${parts[0][0]}. ${parts[parts.length - 1]}`;
    return `${parts[0][0]}.`;
  }
  return name ?? email.split('@')[0];
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function ClubPublicView({ slug, supabaseUrl, supabaseAnonKey }: Props) {
  const [club, setClub] = useState<Club | null>(null);
  const [feed, setFeed] = useState<CheckinRow[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  const sb = createClient(supabaseUrl, supabaseAnonKey);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await sb.auth.getSession();
      const token = session?.access_token ?? null;
      setAccessToken(token);

      const { data: clubData, error: clubErr } = await sb
        .from('clubs')
        .select('id,name,slug,goal,status,season_number,public_leaderboard,price_cents,is_free,max_members,starts_at,trainer:trainer_id(full_name,avatar_url)')
        .eq('slug', slug)
        .maybeSingle();

      if (clubErr || !clubData) { setState('error'); return; }
      setClub(clubData as Club);

      const { count: mCount } = await sb
        .from('club_members')
        .select('id', { count: 'exact', head: true })
        .eq('club_id', clubData.id)
        .eq('status', 'active');
      setMemberCount(mCount ?? 0);

      const { count: fCount } = await sb
        .from('club_followers')
        .select('id', { count: 'exact', head: true })
        .eq('club_id', clubData.id);
      setFollowerCount(fCount ?? 0);

      if (token) {
        const { data: { user } } = await sb.auth.getUser();
        if (user) {
          const { data: followRow } = await sb
            .from('club_followers')
            .select('id')
            .eq('club_id', clubData.id)
            .eq('user_id', user.id)
            .maybeSingle();
          setIsFollowing(!!followRow);
        }
      }

      const { data: checkins } = await sb
        .from('checkins')
        .select('user_id,streak_day,completed_at,user:user_id(full_name,email)')
        .eq('club_id', clubData.id)
        .order('completed_at', { ascending: false })
        .limit(8);
      setFeed((checkins ?? []) as CheckinRow[]);

      const { data: members } = await sb
        .from('club_members')
        .select('user_id,user:user_id(full_name,email)')
        .eq('club_id', clubData.id)
        .eq('status', 'active');

      if (members && members.length > 0) {
        const userIds = members.map((m: { user_id: string }) => m.user_id);
        const { data: streaks } = await sb
          .from('checkins')
          .select('user_id,streak_day')
          .eq('club_id', clubData.id)
          .in('user_id', userIds)
          .order('streak_day', { ascending: false });

        const maxByUser: Record<string, number> = {};
        (streaks ?? []).forEach((c: { user_id: string; streak_day: number }) => {
          if (!maxByUser[c.user_id] || c.streak_day > maxByUser[c.user_id]) {
            maxByUser[c.user_id] = c.streak_day;
          }
        });

        const lb: LeaderboardRow[] = members
          .map((m: { user_id: string; user: { full_name: string | null; email: string } | null }) => ({
            user_id: m.user_id,
            display_name: formatName(
              m.user?.full_name ?? null,
              m.user?.email ?? '',
              clubData.public_leaderboard
            ),
            streak: maxByUser[m.user_id] ?? 0,
          }))
          .sort((a: LeaderboardRow, b: LeaderboardRow) => b.streak - a.streak)
          .slice(0, 10);

        setLeaderboard(lb);
      }

      setState('ready');
    }
    load();
  }, [slug]);

  function goToJoin() {
    window.location.href = `/clubs/join/${slug}`;
  }

  function goToAuth() {
    window.location.href = `/auth/callback?next=/clubs/${slug}`;
  }

  if (state === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontFamily: 'Manrope, system-ui, sans-serif' }}>
        Loading…
      </div>
    );
  }

  if (state === 'error' || !club) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontFamily: 'Manrope, system-ui, sans-serif' }}>
        Club not found.
      </div>
    );
  }

  const isActive = club.status === 'active';
  const spotsLeft = Math.max(0, club.max_members - memberCount);
  const priceDisplay = club.is_free ? 'Free' : `AED ${Math.round(club.price_cents / 100)}`;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px 80px', fontFamily: 'Manrope, system-ui, sans-serif', color: '#fff' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <SeasonBadge seasonNumber={club.season_number} isActive={isActive} />
          {isActive && spotsLeft <= 10 && spotsLeft > 0 && (
            <span style={{ fontSize: 11, color: '#f97316', fontWeight: 600 }}>{spotsLeft} spots left</span>
          )}
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 6 }}>{club.name}</h1>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>
          {club.trainer?.full_name ?? 'Coach'} · {memberCount} members · {followerCount} following
        </div>
        <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.6 }}>{club.goal}</p>
      </div>

      {feed.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 10 }}>HAPPENING NOW</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {feed.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: '#aaa' }}>
                  🔥 <span style={{ color: '#fff', fontWeight: 600 }}>
                    {formatName(c.user?.full_name ?? null, c.user?.email ?? '', club.public_leaderboard)}
                  </span> · Day {c.streak_day}
                </div>
                <div style={{ fontSize: 11, color: '#555' }}>{timeAgo(c.completed_at)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {leaderboard.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 10 }}>LEADERBOARD</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {leaderboard.map((row, i) => (
              <div key={row.user_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: i === 0 ? '#f97316' : '#555', fontWeight: 700, width: 18 }}>{i + 1}</div>
                <div style={{ fontSize: 13, color: '#fff', flex: 1 }}>{row.display_name}</div>
                <div style={{ fontSize: 12, color: '#4ade80', fontWeight: 600 }}>🔥 {row.streak}</div>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px dashed rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: 12, color: '#444', fontWeight: 700, width: 18 }}>—</div>
              <div style={{ fontSize: 13, color: '#444', fontStyle: 'italic', flex: 1 }}>You · join to appear here</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {isActive && (
          <button
            onClick={goToJoin}
            style={{ background: '#7c3aed', border: 'none', borderRadius: 12, padding: '15px 24px', fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {club.is_free ? 'Join free' : `Join Season ${club.season_number} — ${priceDisplay}`}
            {spotsLeft <= 10 && spotsLeft > 0 ? ` · ${spotsLeft} left` : ''}
          </button>
        )}
        <FollowButton
          clubId={club.id}
          initialFollowing={isFollowing}
          supabaseUrl={supabaseUrl}
          supabaseAnonKey={supabaseAnonKey}
          accessToken={accessToken}
          onAuthRequired={goToAuth}
        />
      </div>
    </div>
  );
}
