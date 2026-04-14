/**
 * TrainedBy — Market Detection & Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * Detects the current market from the request hostname and returns the
 * appropriate market configuration. Used by all Astro pages to adapt
 * copy, pricing, certification body, and trust badges per market.
 *
 * Markets:
 *   trainedby.ae  → UAE (AED, REPs UAE, Dubai/Abu Dhabi focus)
 *   trainedby.uk  → UK  (GBP, REPs UK, CIMSPA focus)
 *   trainedby.in  → India (INR, TrainedBy Verified, ₹499 early access)
 *   trainedby.com → Global (USD, NASM/ACE/NSCA)
 *
 * In development / Netlify preview, defaults to .ae
 */

export interface MarketConfig {
  market: 'ae' | 'uk' | 'in' | 'com';
  domain: string;
  currency: string;
  currencySymbol: string;
  proPrice: number;
  proPriceLabel: string;
  proAltPrice?: number;           // A/B test alternate price
  proAltPriceLabel?: string;
  certificationBody: string;
  heroHeadline: string;
  heroSubline: string;
  ctaText: string;
  trustBadges: string[];
  locale: string;
  flag: string;
  phonePrefix: string;            // Default phone country code prefix
  paymentProvider: 'stripe' | 'razorpay';
  // SEO
  siteTitle: string;
  metaDescription: string;
  // Certification verification
  certVerifyLabel: string;
  certVerifyPlaceholder: string;
}

const MARKETS: Record<string, MarketConfig> = {
  ae: {
    market: 'ae',
    domain: 'trainedby.ae',
    currency: 'AED',
    currencySymbol: 'AED',
    proPrice: 149,
    proPriceLabel: '149 AED/month',
    certificationBody: 'REPs UAE',
    heroHeadline: 'The Verified Trainer Platform for the UAE',
    heroSubline: 'REPs UAE certified. Client-ready in 60 seconds. Free forever.',
    ctaText: 'Create Your Free Profile',
    trustBadges: ['REPs UAE Verified', 'Dubai Fitness Challenge Partner', 'ADNOC Wellness Network'],
    locale: 'en-AE',
    flag: '🇦🇪',
    phonePrefix: '+971',
    paymentProvider: 'stripe',
    siteTitle: 'TrainedBy.ae — Verified Personal Trainers in the UAE',
    metaDescription: 'Find REPs UAE verified personal trainers in Dubai, Abu Dhabi, and across the UAE. Build your verified trainer profile for free.',
    certVerifyLabel: 'REPs UAE Number',
    certVerifyPlaceholder: 'e.g. REP-12345',
  },
  uk: {
    market: 'uk',
    domain: 'trainedby.uk',
    currency: 'GBP',
    currencySymbol: '£',
    proPrice: 9.99,
    proPriceLabel: '£9.99/month',
    certificationBody: 'REPs UK',
    heroHeadline: 'The Verified Personal Trainer Platform for the UK',
    heroSubline: 'REPs UK registered. Get found by local clients. Free forever.',
    ctaText: 'Create Your Free Profile',
    trustBadges: ['REPs UK Registered', 'CIMSPA Endorsed', 'UK Active Partner'],
    locale: 'en-GB',
    flag: '🇬🇧',
    phonePrefix: '+44',
    paymentProvider: 'stripe',
    siteTitle: 'TrainedBy.uk — Verified Personal Trainers in the UK',
    metaDescription: 'Find REPs UK registered personal trainers near you. Build your verified trainer profile for free.',
    certVerifyLabel: 'REPs UK Number',
    certVerifyPlaceholder: 'e.g. R0012345',
  },
  in: {
    market: 'in',
    domain: 'trainedby.in',
    currency: 'INR',
    currencySymbol: '₹',
    proPrice: 499,
    proPriceLabel: '₹499/month',
    proAltPrice: 999,
    proAltPriceLabel: '₹999/month',
    certificationBody: 'UK-Standard Verified',
    heroHeadline: 'UK-Standard Fitness Verification. Now in India.',
    heroSubline: 'The same standard that certifies trainers in London — now available to India\'s best. Free forever.',
    ctaText: 'Get Your Free Verified Profile',
    trustBadges: ['UK-Standard Verified', 'CIMSPA-Aligned', 'Trusted by Trainers in 3 Countries'],
    locale: 'en-IN',
    flag: '🇮🇳',
    phonePrefix: '+91',
    paymentProvider: 'razorpay',
    siteTitle: 'TrainedBy.in — UK-Standard Verified Fitness Professionals in India',
    metaDescription: 'The UK-origin platform for verified personal trainers and fitness coaches in India. Get your UK-Standard Verified badge and grow your client base for free.',
    certVerifyLabel: 'Certification Number (NSCA, ACSM, ACE, CIMSPA or equivalent)',
    certVerifyPlaceholder: 'e.g. NSCA-CPT-12345 or CIMSPA-12345',
    // UK-origin positioning extras (used in landing page)
    originBadge: 'From the UK',
    originSubtext: 'Built in Britain. Expanding to India.',
    socialProofLine: 'Used by verified trainers in Dubai, London, and now India.',
  } as MarketConfig & { originBadge: string; originSubtext: string; socialProofLine: string },
  com: {
    market: 'com',
    domain: 'trainedby.com',
    currency: 'USD',
    currencySymbol: '$',
    proPrice: 19,
    proPriceLabel: '$19/month',
    certificationBody: 'NASM / ACE / NSCA',
    heroHeadline: 'The Verified Personal Trainer Platform',
    heroSubline: 'Internationally certified. Client-ready in 60 seconds. Free forever.',
    ctaText: 'Create Your Free Profile',
    trustBadges: ['NASM Certified', 'ACE Accredited', 'NSCA Member'],
    locale: 'en-US',
    flag: '🌍',
    phonePrefix: '+1',
    paymentProvider: 'stripe',
    siteTitle: 'TrainedBy — Verified Personal Trainers Worldwide',
    metaDescription: 'The global platform for NASM, ACE, and NSCA certified personal trainers. Build your verified profile for free.',
    certVerifyLabel: 'Certification Number',
    certVerifyPlaceholder: 'e.g. NASM-12345',
  },
};

/**
 * Detect market from a hostname string.
 * Falls back to 'ae' for local dev, Netlify previews, and unknown hosts.
 */
export function detectMarket(hostname: string): MarketConfig {
  if (hostname.includes('trainedby.uk')) return MARKETS.uk;
  if (hostname.includes('trainedby.in')) return MARKETS.in;
  if (hostname.includes('trainedby.com') && !hostname.includes('trainedby.ae')) return MARKETS.com;
  // Default: UAE (.ae, netlify.app, localhost, etc.)
  return MARKETS.ae;
}

/**
 * Get market config for use in Astro pages.
 * Pass Astro.url.hostname as the argument.
 */
export function getMarket(hostname: string): MarketConfig {
  return detectMarket(hostname);
}

export { MARKETS };
