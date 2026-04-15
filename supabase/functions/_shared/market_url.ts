/**
 * TrainedBy — Market-Aware URL Builder
 * ─────────────────────────────────────────────────────────────────────────────
 * Replaces all hardcoded trainedby.ae URLs in edge functions with
 * dynamic, market-aware equivalents.
 *
 * Usage:
 *   import { getMarketUrl, getProfileUrl, getDashboardUrl } from '../_shared/market_url.ts';
 *   const url = getProfileUrl('ae', 'john-smith');  // https://trainedby.ae/john-smith
 *   const url = getProfileUrl('fr', 'jean-dupont'); // https://coachepar.fr/jean-dupont
 */

export const MARKET_DOMAINS: Record<string, string> = {
  ae:  'https://trainedby.ae',
  com: 'https://trainedby.com',
  uk:  'https://trainedby.uk',
  in:  'https://trainedby.in',
  fr:  'https://coachepar.fr',
  it:  'https://allenaticon.it',
  es:  'https://entrenacon.com',
  mx:  'https://entrenacon.mx',
};

export const MARKET_BRANDS: Record<string, string> = {
  ae:  'TrainedBy',
  com: 'TrainedBy',
  uk:  'TrainedBy UK',
  in:  'TrainedBy India',
  fr:  'CoachéPar',
  it:  'AllenatoCon',
  es:  'EntrenaCon',
  mx:  'EntrenaCon MX',
};

export const MARKET_SUPPORT_EMAILS: Record<string, string> = {
  ae:  'hello@trainedby.ae',
  com: 'hello@trainedby.com',
  uk:  'hello@trainedby.uk',
  in:  'hello@trainedby.in',
  fr:  'bonjour@coachepar.fr',
  it:  'ciao@allenaticon.it',
  es:  'hola@entrenacon.com',
  mx:  'hola@entrenacon.mx',
};

/** Get the base domain URL for a market */
export function getMarketBaseUrl(market: string): string {
  return MARKET_DOMAINS[market] ?? MARKET_DOMAINS['ae'];
}

/** Get the brand name for a market */
export function getMarketBrand(market: string): string {
  return MARKET_BRANDS[market] ?? 'TrainedBy';
}

/** Get the support email for a market */
export function getMarketSupportEmail(market: string): string {
  return MARKET_SUPPORT_EMAILS[market] ?? 'hello@trainedby.ae';
}

/** Build a trainer profile URL for a given market */
export function getProfileUrl(market: string, slug: string): string {
  return `${getMarketBaseUrl(market)}/${slug}`;
}

/** Build the dashboard URL for a given market */
export function getDashboardUrl(market: string, params?: string): string {
  const base = `${getMarketBaseUrl(market)}/dashboard`;
  return params ? `${base}?${params}` : base;
}

/** Build the pricing URL for a given market */
export function getPricingUrl(market: string): string {
  return `${getMarketBaseUrl(market)}/pricing`;
}

/** Build the join URL for a given market, with optional referral */
export function getJoinUrl(market: string, refSlug?: string): string {
  const base = `${getMarketBaseUrl(market)}/join`;
  return refSlug ? `${base}?ref=${refSlug}` : base;
}

/** Detect market from a trainer row (falls back to 'ae') */
export function getTrainerMarket(trainer: { market?: string }): string {
  return trainer.market ?? 'ae';
}
