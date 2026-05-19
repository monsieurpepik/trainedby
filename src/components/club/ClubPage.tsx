// src/components/club/ClubPage.tsx
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ClubMemberView } from './ClubMemberView';
import { ClubPublicView } from './ClubPublicView';
import { ClubAlumniView } from './ClubAlumniView';

type ViewState = 'loading' | 'public' | 'member' | 'alumni';

interface ClubInfo {
  id: string;
  season_number: number;
  parent_club_id: string | null;
  successor?: { slug: string; season_number: number } | null;
}

interface Props {
  slug: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function ClubPage({ slug, supabaseUrl, supabaseAnonKey }: Props) {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null);
  const [alumniSeasonNumber, setAlumniSeasonNumber] = useState(0);

  const sb = createClient(supabaseUrl, supabaseAnonKey);

  useEffect(() => {
    async function detect() {
      // Fetch club basics
      const { data: club } = await sb
        .from('clubs')
        .select('id,season_number,parent_club_id')
        .eq('slug', slug)
        .maybeSingle();

      if (!club) { setViewState('public'); return; }

      // Fetch successor season if any (club where parent_club_id = this club's id)
      const { data: successor } = await sb
        .from('clubs')
        .select('slug,season_number')
        .eq('parent_club_id', club.id)
        .order('season_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      setClubInfo({ ...club, successor: successor ?? null });

      // Check auth
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { setViewState('public'); return; }

      // Check active membership in THIS club
      const { data: membership } = await sb
        .from('club_members')
        .select('id')
        .eq('club_id', club.id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (membership) { setViewState('member'); return; }

      // Check if alumni: any completed season in this club's family
      const rootId = club.parent_club_id ?? club.id;
      const { data: familyClubs } = await sb
        .from('clubs')
        .select('id,season_number')
        .or(`id.eq.${rootId},parent_club_id.eq.${rootId}`);

      if (familyClubs && familyClubs.length > 0) {
        const familyIds = familyClubs.map((c: { id: string }) => c.id);
        const { data: pastMembership } = await sb
          .from('club_members')
          .select('club_id,season_number')
          .in('club_id', familyIds)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (pastMembership) {
          const completedSeason = familyClubs.find((c: { id: string }) => c.id === pastMembership.club_id);
          setAlumniSeasonNumber(completedSeason?.season_number ?? 1);
          setViewState('alumni');
          return;
        }
      }

      setViewState('public');
    }
    detect();
  }, [slug]);

  if (viewState === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontFamily: 'Manrope, system-ui, sans-serif' }}>
        Loading…
      </div>
    );
  }

  if (viewState === 'member') {
    return <ClubMemberView slug={slug} supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} />;
  }

  if (viewState === 'alumni' && clubInfo) {
    return (
      <ClubAlumniView
        slug={slug}
        clubId={clubInfo.id}
        seasonNumber={clubInfo.season_number}
        completedSeasonNumber={alumniSeasonNumber}
        successorSlug={clubInfo.successor?.slug ?? null}
        supabaseUrl={supabaseUrl}
        supabaseAnonKey={supabaseAnonKey}
      />
    );
  }

  return <ClubPublicView slug={slug} supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} />;
}
