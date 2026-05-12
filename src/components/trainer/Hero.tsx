import type { Trainer } from './types';
import { getDisplayName, getPhotoUrl, normaliseSpecialties, getLocation } from './utils';

interface HeroProps {
  trainer: Trainer;
  onBack: () => void;
  onShare: () => void;
}

export default function Hero({ trainer, onBack, onShare }: HeroProps) {
  const displayName = getDisplayName(trainer);
  const photoUrl = getPhotoUrl(trainer);
  const specialties = normaliseSpecialties(trainer.specialties as string[] | string | undefined);
  const location = getLocation(trainer);

  return (
    <div className="tb-hero">
      {photoUrl && (
        <img
          className="tb-hero-img"
          src={photoUrl}
          alt={displayName}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      )}
      <div className="tb-hero-fade" />
      <div className="tb-hero-controls">
        <button className="tb-hero-btn" onClick={onBack} aria-label="Back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        {'share' in navigator ? (
          <button className="tb-hero-btn" onClick={onShare} aria-label="Share">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        ) : <span />}
      </div>
      {photoUrl && (
        <div className="tb-hero-name-block">
          <div className="tb-hero-name">{displayName}</div>
          {specialties[0] && (
            <div className="tb-hero-tagline">
              {specialties[0]}{location ? ` · ${location}` : ''}
            </div>
          )}
        </div>
      )}
      {/* Sentinel element — CompactHeader's IntersectionObserver watches this */}
      <div id="hero-sentinel" />
    </div>
  );
}
