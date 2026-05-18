import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { StreakBadge } from './StreakBadge';

interface FeedEntry {
  id: string;
  user_id: string;
  completed_at: string;
  streak_day: number;
  display_name?: string;
  avatar_url?: string | null;
}

interface Props {
  clubId: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

function initials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function ActivityFeed({ clubId, supabaseUrl, supabaseAnonKey }: Props) {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = createClient(supabaseUrl, supabaseAnonKey);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    sb.from('checkins')
      .select('id, user_id, completed_at, streak_day, users(display_name, avatar_url)')
      .eq('club_id', clubId)
      .gte('completed_at', todayStart.toISOString())
      .order('completed_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setEntries((data ?? []).map((r: any) => ({
          id: r.id,
          user_id: r.user_id,
          completed_at: r.completed_at,
          streak_day: r.streak_day,
          display_name: r.users?.display_name,
          avatar_url: r.users?.avatar_url,
        })));
        setLoading(false);
      });

    const channel = sb
      .channel(`club-checkins-${clubId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'checkins',
        filter: `club_id=eq.${clubId}`,
      }, async (payload: any) => {
        const { data: user } = await sb
          .from('users')
          .select('display_name, avatar_url')
          .eq('id', payload.new.user_id)
          .single();

        setEntries(prev => [{
          id: payload.new.id,
          user_id: payload.new.user_id,
          completed_at: payload.new.completed_at,
          streak_day: payload.new.streak_day,
          display_name: user?.display_name,
          avatar_url: user?.avatar_url,
        }, ...prev]);
      })
      .subscribe();

    return () => { sb.removeChannel(channel); };
  }, [clubId]);

  if (loading) {
    return <p style={{ color: '#555', fontSize: 13 }}>Loading activity…</p>;
  }

  if (entries.length === 0) {
    return <p style={{ color: '#555', fontSize: 13 }}>No check-ins yet today. Be the first.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {entries.map(entry => (
        <div key={entry.id} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 8,
          padding: '8px 12px',
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            flexShrink: 0,
            background: entry.avatar_url ? 'transparent' : '#7c3aed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: '#fff',
            overflow: 'hidden',
          }}>
            {entry.avatar_url
              ? <img src={entry.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials(entry.display_name ?? '?')}
          </div>
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <span style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>
              {entry.display_name ?? 'Someone'}
            </span>
            <span style={{ fontSize: 12, color: '#888' }}> checked in</span>
          </div>
          <StreakBadge days={entry.streak_day} />
          <span style={{ fontSize: 11, color: '#555', flexShrink: 0 }}>
            {timeAgo(entry.completed_at)}
          </span>
        </div>
      ))}
    </div>
  );
}
