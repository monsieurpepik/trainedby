import type { Trainer, Package, StatItem } from './types';

export function esc(s: unknown): string {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatPrice(pkg: Package, currencySymbol: string): string {
  if (!pkg.price) return '';
  const sym = currencySymbol || pkg.currency || '';
  return sym ? `${sym} ${pkg.price}` : String(pkg.price);
}

export function buildStats(t: Partial<Trainer>): StatItem[] {
  const items: StatItem[] = [];
  const rating = t.avg_rating != null ? parseFloat(String(t.avg_rating)) : null;
  const reviewCount = t.review_count ?? 0;

  if (rating !== null && reviewCount > 0) {
    items.push({ num: rating.toFixed(1), label: 'Rating' });
    items.push({ num: String(reviewCount), label: reviewCount === 1 ? 'Review' : 'Reviews' });
  }

  const experience = t.experience_years || t.years_experience || null;
  if (experience) items.push({ num: `${experience}y`, label: 'Experience' });

  const goalRate = t.goal_achievement_rate ?? null;
  if (goalRate) items.push({ num: `${goalRate}%`, label: 'Goal Rate' });

  const clients = t.total_clients || t.client_count || null;
  if (clients) items.push({ num: `${clients}+`, label: 'Clients' });

  return items;
}

export function buildTags(
  specialties: string[],
  isVerified: boolean,
  certifications: string[],
): string[] {
  const maxSpecialties = isVerified ? 3 : 4;
  const raw = [...specialties.slice(0, maxSpecialties)];
  if (isVerified) raw.unshift('Verified');
  if (certifications.length > 0 && raw.length < 4) raw.push(certifications[0]);
  return [...new Set(raw)].slice(0, 4);
}

export function normaliseSpecialties(raw: string[] | string | undefined): string[] {
  if (!raw) return ['Personal Trainer'];
  if (Array.isArray(raw)) return raw.length > 0 ? raw : ['Personal Trainer'];
  return [raw];
}

export function getDisplayName(t: Trainer): string {
  return t.name || t.full_name || '';
}

export function getPhotoUrl(t: Trainer): string {
  return t.avatar_url || t.profile_photo_url || '';
}

export function getLocation(t: Trainer): string {
  return [t.city, t.country].filter(Boolean).join(', ');
}

export function getContactNumber(t: Trainer): string {
  return (t.whatsapp || t.phone || '').replace(/\D/g, '');
}

export function isVerifiedTrainer(t: Trainer): boolean {
  return !!(t.reps_verified || t.is_verified || t.verification_status === 'verified');
}

export function dedupePackages(packages: Package[]): Package[] {
  const seen = new Set<string>();
  return packages.filter(p => {
    const key = p.name || p.title || '';
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
