import { useState, useEffect, useCallback } from 'react';
import type { Trainer, Package, TrainerProfileProps } from './trainer/types';
import { SUPABASE_ANON_KEY as SUPABASE_KEY, EDGE_BASE } from '../lib/config';
import {
  buildStats, buildTags, dedupePackages,
  normaliseSpecialties, getDisplayName,
  getLocation, getContactNumber, isVerifiedTrainer,
} from './trainer/utils';

import Hero from './trainer/Hero';
import IdentityStrip from './trainer/IdentityStrip';
import StatsRow from './trainer/StatsRow';
import CTABlock from './trainer/CTABlock';
import PackagesCarousel from './trainer/PackagesCarousel';
import About from './trainer/About';
import Reviews from './trainer/Reviews';
import CompactHeader from './trainer/CompactHeader';
import BottomNav from './trainer/BottomNav';

type LoadState = 'loading' | 'loaded' | 'error';

function LoadingSpinner() {
  return (
    <div className="tb-loading">
      <div className="tb-spinner" />
    </div>
  );
}

function ErrorState() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '80vh', gap: '24px',
      padding: '32px', textAlign: 'center',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <div style={{ fontSize: '64px', fontWeight: 200, letterSpacing: '-0.02em', color: '#111111', lineHeight: 1 }}>404</div>
      <h1 style={{ fontSize: '22px', fontWeight: 300, color: '#111111' }}>Trainer not found</h1>
      <p style={{ color: '#6B6460', maxWidth: '360px', lineHeight: 1.6, fontSize: '13.5px', fontWeight: 300 }}>
        This trainer profile doesn't exist or may have been removed.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="/find" style={{ background: '#1A1411', color: '#fff', padding: '12px 28px', borderRadius: '13px', textDecoration: 'none', fontWeight: 500, fontSize: '14px', letterSpacing: '0.04em' }}>
          Find a Trainer
        </a>
        <a href="/" style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.10)', color: '#7A7068', padding: '12px 28px', borderRadius: '13px', textDecoration: 'none', fontWeight: 300, fontSize: '14px' }}>
          Go Home
        </a>
      </div>
    </div>
  );
}

export default function TrainerProfile({ slug, paymentEnabled, currencySymbol }: TrainerProfileProps) {
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    if (!slug) { setLoadState('error'); return; }
    const controller = new AbortController();

    async function fetchTrainer() {
      try {
        const r = await fetch(
          `${EDGE_BASE}/get-trainer?slug=${encodeURIComponent(slug)}`,
          {
            headers: { Authorization: `Bearer ${SUPABASE_KEY}`, apikey: SUPABASE_KEY },
            signal: controller.signal,
          }
        );
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const resp = await r.json() as { trainer?: Trainer; packages?: Package[]; error?: string };
        if (!resp || resp.error) throw new Error('Trainer not found');
        const trainerData: Trainer = resp.trainer || resp;
        const pkgData: Package[] = resp.packages || [];
        setTrainer(trainerData);
        setPackages(dedupePackages(pkgData));
        setLoadState('loaded');
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        setLoadState('error');
      }
    }

    fetchTrainer();
    return () => controller.abort();
  }, [slug]);

  const displayName = trainer ? getDisplayName(trainer) : '';

  const handleBack = useCallback(() => {
    if (window.history.length > 1) window.history.back();
    else window.location.href = '/find';
  }, []);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: `${displayName} - Verified Personal Trainer`,
        text: `Check out ${displayName}'s verified trainer profile`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  }, [displayName]);

  const specialties = trainer ? normaliseSpecialties(trainer.specialties) : [];
  const tags = trainer
    ? buildTags(
        specialties,
        isVerifiedTrainer(trainer),
        Array.isArray(trainer.certifications) ? trainer.certifications : [],
      )
    : [];
  const stats = trainer ? buildStats(trainer) : [];
  const trainerLocation = trainer ? getLocation(trainer) : '';
  const whatsappNumber = trainer ? getContactNumber(trainer) : '';
  const bio = trainer?.bio ?? '';
  const averageRating = trainer?.avg_rating != null ? parseFloat(String(trainer.avg_rating)) : null;
  const reviewCount = trainer?.review_count ?? 0;

  return (
    <div id="tb-page">
      <CompactHeader
        trainerName={displayName}
        onBack={handleBack}
        onShare={handleShare}
      />

      <div id="tb-root">
        {loadState === 'loading' && <LoadingSpinner />}
        {loadState === 'error' && <ErrorState />}
        {loadState === 'loaded' && trainer && (
          <div id="profile-mount">
            <Hero trainer={trainer} onBack={handleBack} onShare={handleShare} />
            <IdentityStrip tags={tags} location={trainerLocation} />
            <StatsRow stats={stats} />
            <CTABlock
              paymentEnabled={paymentEnabled}
              whatsappNumber={whatsappNumber}
              displayName={displayName}
            />
            <PackagesCarousel
              packages={packages}
              currencySymbol={currencySymbol}
              displayName={displayName}
              whatsappNumber={whatsappNumber}
            />
            <About bio={bio} />
            <Reviews
              trainerId={trainer.id}
              averageRating={averageRating}
              reviewCount={reviewCount}
            />
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
