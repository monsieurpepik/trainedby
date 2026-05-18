import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../lib/config';

interface Club {
  id: string;
  slug: string;
  name: string;
  goal: string;
  duration_days: number;
  is_free: boolean;
  price_cents: number | null;
  max_members: number | null;
  starts_at: string | null;
  status: string;
}

interface Props {
  trainerId: string;
}

function priceLabel(club: Club): string {
  if (club.is_free) return 'Free';
  if (!club.price_cents) return '';
  return `$${(club.price_cents / 100).toFixed(0)}`;
}

export function ClubsSection({ trainerId }: Props) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    sb.from('clubs')
      .select('id, slug, name, goal, duration_days, is_free, price_cents, max_members, starts_at, status')
      .eq('trainer_id', trainerId)
      .in('status', ['active', 'draft'])
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setClubs(data ?? []);
        setLoading(false);
      });
  }, [trainerId]);

  if (loading || clubs.length === 0) return null;

  return (
    <div style={{ padding: '0 16px 24px' }}>
      <div style={{
        fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1,
        marginBottom: 12, fontFamily: 'Manrope, system-ui, sans-serif',
      }}>
        Active Clubs
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {clubs.map(club => (
          <div key={club.id} style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
            borderRadius: 12,
            padding: 16,
            border: '1px solid rgba(255,255,255,0.08)',
            fontFamily: 'Manrope, system-ui, sans-serif',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', flex: 1, lineHeight: 1.3 }}>{club.name}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: club.is_free ? '#4ade80' : '#fff', marginLeft: 12, flexShrink: 0 }}>
                {priceLabel(club)}
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#aaa', marginBottom: 12, lineHeight: 1.5 }}>
              {club.goal.slice(0, 120)}{club.goal.length > 120 ? '…' : ''}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, color: '#666' }}>
                {club.duration_days} days
                {club.starts_at ? ` · Starts ${new Date(club.starts_at).toLocaleDateString()}` : ''}
                {club.max_members ? ` · Max ${club.max_members}` : ''}
              </div>
              {club.status === 'active' && (
                <a
                  href={`/clubs/join/${club.slug}`}
                  style={{
                    background: '#7c3aed', borderRadius: 8, padding: '7px 14px',
                    fontSize: 12, fontWeight: 700, color: '#fff', textDecoration: 'none',
                  }}
                >
                  Join
                </a>
              )}
              {club.status === 'draft' && (
                <span style={{ fontSize: 11, color: '#666' }}>Coming soon</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
