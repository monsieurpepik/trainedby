/**
 * TrainedBy - Market Detection & Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * Detects the current market from the request hostname and returns the
 * appropriate market configuration. Used by all Astro pages to adapt
 * copy, pricing, certification body, and trust badges per market.
 *
 * Markets:
 *   trainedby.ae       → UAE (AED, REPs UAE, Dubai/Abu Dhabi focus)
 *   trainedby.uk       → UK  (GBP, REPs UK, CIMSPA focus)
 *   trainedby.in       → India (INR, TrainedBy Verified, ₹499 early access)
 *   trainedby.com      → Global (USD, NASM/ACE/NSCA)
 *   coachepar.fr/.com  → France (EUR, BPJEPS/STAPS, French UI)
 *   allenaticon.it/.com→ Italy (EUR, EQF/CONI/FIPE, Italian UI)
 *   entrenacon.com     → Spain/LatAm (EUR, NSCA/ISSA/CFES, Spanish UI)
 *   entrenacon.mx      → Mexico (MXN, CONADE/NSCA, Spanish UI)
 *
 * In development / Netlify preview, defaults to .ae
 */

export interface MarketConfig {
  market: 'ae' | 'uk' | 'in' | 'com' | 'fr' | 'it' | 'es' | 'mx';
  domain: string;
  currency: string;
  currencySymbol: string;
  proPrice: number;
  proPriceLabel: string;
  proAltPrice?: number;
  proAltPriceLabel?: string;
  certificationBody: string;
  heroHeadline: string;
  heroSubline: string;
  ctaText: string;
  trustBadges: string[];
  locale: string;
  flag: string;
  phonePrefix: string;
  paymentProvider: 'stripe' | 'razorpay';
  // SEO
  siteTitle: string;
  metaDescription: string;
  // Certification verification
  certVerifyLabel: string;
  certVerifyPlaceholder: string;
  // i18n
  i18nLocale?: 'en' | 'fr' | 'it' | 'es';
  brandName?: string;
  // Payment & waitlist
  paymentEnabled: boolean;
  waitlistEnabled: boolean;
  paymentNote?: string;
  // Market income numbers for landing page calculator
  incomeSession: string;
  incomePro: string;
  incomePassive: string;
  incomeSessionLabel: string;
  incomeProLabel: string;
  incomePassiveLabel: string;
  /**
   * Transaction monetization layer.
   * takeRatePercent: platform fee applied to bookings processed through TrainedBy Payments.
   * takeRateEnabled: false = SaaS-only mode (current default); true = payments flow through platform.
   * takeRateNote: optional UI note shown on the pricing page.
   */
  takeRatePercent: number;
  takeRateEnabled: boolean;
  takeRateNote?: string;
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
    paymentEnabled: true,
    waitlistEnabled: false,
    incomeSession: '8,400', incomePro: '24,600', incomePassive: '6,200',
    incomeSessionLabel: 'AED/month from 6 clients × 1,400 AED packages',
    incomeProLabel: 'Sessions + digital products + affiliate commissions',
    incomePassiveLabel: 'AED while you sleep - digital products & affiliate deals',
    takeRatePercent: 8,
    takeRateEnabled: false,
    takeRateNote: 'When TrainedBy Payments launches, a platform fee of 8% applies to sessions booked through the platform. Trainers on Pro pay 5%.',
    paymentProvider: 'stripe',
    siteTitle: 'TrainedBy – Link-in-Bio & Booking Hub for Fitness Trainers',
    metaDescription: 'Your link-in-bio and booking hub as a personal trainer in Dubai and the UAE. Get discovered, capture leads, and manage clients — free to start.',
    certVerifyLabel: 'REPs UAE Number',
    certVerifyPlaceholder: 'e.g. REP-12345',
    i18nLocale: 'en',
    brandName: 'TrainedBy',
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
    paymentEnabled: true,
    waitlistEnabled: false,
    incomeSession: '3,200', incomePro: '9,400', incomePassive: '2,300',
    incomeSessionLabel: '£/month from 6 clients × £530 packages',
    incomeProLabel: 'Sessions + digital products + affiliate commissions',
    incomePassiveLabel: '£ while you sleep - digital products & affiliate deals',
    takeRatePercent: 8,
    takeRateEnabled: false,
    takeRateNote: 'When TrainedBy Payments launches, a platform fee of 8% applies to sessions booked through the platform. Trainers on Pro pay 5%.',
    paymentProvider: 'stripe',
    siteTitle: 'TrainedBy.uk - Verified Personal Trainers in the UK',
    metaDescription: 'Find REPs UK registered personal trainers near you. Build your verified trainer profile for free.',
    certVerifyLabel: 'REPs UK Number',
    certVerifyPlaceholder: 'e.g. R0012345',
    i18nLocale: 'en',
    brandName: 'TrainedBy',
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
    certificationBody: 'NSCA / ACSM / CIMSPA',
    heroHeadline: 'India\'s Verified Fitness Professional Platform.',
    heroSubline: 'NSCA, ACSM, ACE and CIMSPA-aligned verification. Get found by clients across India. Free forever.',
    ctaText: 'Get Your Free Verified Profile',
    trustBadges: ['NSCA Certified', 'ACSM Accredited', 'CIMSPA-Aligned'],
    locale: 'en-IN',
    flag: '🇮🇳',
    phonePrefix: '+91',
    paymentEnabled: false,
    waitlistEnabled: true,
    paymentNote: 'Payments launching soon in India. Join the waitlist for early access and lock in the launch price.',
    incomeSession: '52,000', incomePro: '1,52,000', incomePassive: '38,000',
    incomeSessionLabel: '₹/month from 6 clients × ₹8,500 packages',
    incomeProLabel: 'Sessions + digital products + affiliate commissions',
    incomePassiveLabel: '₹ while you sleep - digital products & affiliate deals',
    takeRatePercent: 8,
    takeRateEnabled: false,
    takeRateNote: 'When TrainedBy Payments launches in India, a platform fee of 8% applies to sessions booked through the platform. Trainers on Pro pay 5%.',
    paymentProvider: 'razorpay',
    siteTitle: 'TrainedBy.in - Verified Personal Trainers in India',
    metaDescription: 'Find NSCA, ACSM and CIMSPA-aligned verified personal trainers across India. Build your verified trainer profile for free.',
    certVerifyLabel: 'Certification Number (NSCA, ACSM, ACE, CIMSPA or equivalent)',
    certVerifyPlaceholder: 'e.g. NSCA-CPT-12345 or CIMSPA-12345',
    i18nLocale: 'en',
    brandName: 'TrainedBy',
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
    paymentEnabled: true,
    waitlistEnabled: false,
    incomeSession: '2,400', incomePro: '7,200', incomePassive: '1,800',
    incomeSessionLabel: '$/month from 6 clients × $400 packages',
    incomeProLabel: 'Sessions + digital products + affiliate commissions',
    incomePassiveLabel: '$ while you sleep - digital products & affiliate deals',
    takeRatePercent: 8,
    takeRateEnabled: false,
    takeRateNote: 'When TrainedBy Payments launches, a platform fee of 8% applies to sessions booked through the platform. Trainers on Pro pay 5%.',
    paymentProvider: 'stripe',
    siteTitle: 'TrainedBy – Link-in-Bio & Booking Hub for Fitness Trainers',
    metaDescription: 'Your link-in-bio and booking hub as a personal trainer. Get discovered, capture leads, and manage clients — free to start.',
    certVerifyLabel: 'Certification Number',
    certVerifyPlaceholder: 'e.g. NASM-12345',
    i18nLocale: 'en',
    brandName: 'TrainedBy',
  },

  // ── French market (coachepar.fr / coachepar.com) ──────────────────────────
  fr: {
    market: 'fr',
    domain: 'coachepar.fr',
    currency: 'EUR',
    currencySymbol: '€',
    proPrice: 19,
    proPriceLabel: '19 €/mois',
    certificationBody: 'BPJEPS / STAPS',
    heroHeadline: 'La plateforme des coachs sportifs certifiés',
    heroSubline: 'Certifié BPJEPS ou STAPS. Visible par vos clients en 60 secondes. Gratuit.',
    ctaText: 'Créer mon profil gratuit',
    trustBadges: ['Certifié BPJEPS', 'Diplômé STAPS', 'Coach vérifié'],
    locale: 'fr-FR',
    flag: '🇫🇷',
    phonePrefix: '+33',
    paymentEnabled: false,
    waitlistEnabled: true,
    paymentNote: 'Les paiements arrivent bientôt en France. Rejoignez la liste d\'attente pour un accès anticipé et bloquez le prix de lancement.',
    incomeSession: '2,400', incomePro: '7,200', incomePassive: '1,800',
    incomeSessionLabel: '€/mois de 6 clients × 400€ forfaits',
    incomeProLabel: 'Séances + produits digitaux + commissions d\'affiliation',
    incomePassiveLabel: '€ pendant que vous dormez - produits digitaux & affiliation',
    takeRatePercent: 8,
    takeRateEnabled: false,
    takeRateNote: 'Lorsque CoachéPar Paiements sera lancé, des frais de plateforme de 8% s\'appliqueront aux séances réservées via la plateforme. Les coachs Pro paient 5%.',
    paymentProvider: 'stripe',
    siteTitle: 'CoachéPar - Coachs Sportifs Certifiés en France',
    metaDescription: 'Trouvez un coach sportif certifié BPJEPS ou STAPS près de chez vous. Créez votre profil de coach vérifié gratuitement.',
    certVerifyLabel: 'Numéro de certification (BPJEPS / STAPS)',
    certVerifyPlaceholder: 'ex. BPJEPS-12345',
    i18nLocale: 'fr',
    brandName: 'CoachéPar',
  },

  // ── Italian market (allenaticon.it / allenaticon.com) ─────────────────────
  it: {
    market: 'it',
    domain: 'allenaticon.it',
    currency: 'EUR',
    currencySymbol: '€',
    proPrice: 19,
    proPriceLabel: '19 €/mese',
    certificationBody: 'EQF / CONI / FIPE',
    heroHeadline: 'La piattaforma per i Personal Trainer certificati',
    heroSubline: 'Certificato EQF o CONI. Trovato dai tuoi clienti in 60 secondi. Gratis.',
    ctaText: 'Crea il mio profilo gratis',
    trustBadges: ['Certificato EQF', 'CONI Riconosciuto', 'FIPE Affiliato'],
    locale: 'it-IT',
    flag: '🇮🇹',
    phonePrefix: '+39',
    paymentEnabled: false,
    waitlistEnabled: true,
    paymentNote: 'I pagamenti arriveranno presto in Italia. Unisciti alla lista d\'attesa per l\'accesso anticipato e blocca il prezzo di lancio.',
    incomeSession: '2,400', incomePro: '7,200', incomePassive: '1,800',
    incomeSessionLabel: '€/mese da 6 clienti × 400€ pacchetti',
    incomeProLabel: 'Sessioni + prodotti digitali + commissioni di affiliazione',
    incomePassiveLabel: '€ mentre dormi - prodotti digitali & affiliazione',
    takeRatePercent: 8,
    takeRateEnabled: false,
    takeRateNote: 'Quando AllenatoCon Pagamenti sarà lanciato, si applicherà una commissione di piattaforma dell\'8% alle sessioni prenotate tramite la piattaforma. I trainer Pro pagano il 5%.',
    paymentProvider: 'stripe',
    siteTitle: 'AllenatoCon - Personal Trainer Certificati in Italia',
    metaDescription: 'Trova un personal trainer certificato EQF o CONI vicino a te. Crea il tuo profilo verificato gratuitamente.',
    certVerifyLabel: 'Numero certificazione (EQF / CONI / FIPE)',
    certVerifyPlaceholder: 'es. EQF-12345',
    i18nLocale: 'it',
    brandName: 'AllenatoCon',
  },

  // ── Spanish market (entrenacon.com) ──────────────────────────────────────
  es: {
    market: 'es',
    domain: 'entrenacon.com',
    currency: 'EUR',
    currencySymbol: '€',
    proPrice: 19,
    proPriceLabel: '19 €/mes',
    certificationBody: 'NSCA / ISSA / CFES',
    heroHeadline: 'La plataforma para Entrenadores Personales certificados',
    heroSubline: 'Certificado NSCA, ISSA o CFES. Visible para tus clientes en 60 segundos. Gratis.',
    ctaText: 'Crear mi perfil gratis',
    trustBadges: ['Certificado NSCA', 'ISSA Acreditado', 'Entrenador Verificado'],
    locale: 'es-ES',
    flag: '🇪🇸',
    phonePrefix: '+34',
    paymentEnabled: false,
    waitlistEnabled: true,
    paymentNote: 'Los pagos llegarán pronto en España. Únete a la lista de espera para acceso anticipado y bloquea el precio de lanzamiento.',
    incomeSession: '2,400', incomePro: '7,200', incomePassive: '1,800',
    incomeSessionLabel: '€/mes de 6 clientes × 400€ paquetes',
    incomeProLabel: 'Sesiones + productos digitales + comisiones de afiliados',    incomePassiveLabel: '€ mientras duermes - productos digitales & afiliación',
    takeRatePercent: 8,
    takeRateEnabled: false,
    takeRateNote: 'Cuando EntrenaCon Pagos se lance en España, se aplicará una tarifa de plataforma del 8% a las sesiones reservadas a través de la plataforma. Los entrenadores Pro pagan el 5%.',
    paymentProvider: 'stripe',
    siteTitle: 'EntrenaCon - Entrenadores Personales Certificados en México',
    description: 'Encuentra un entrenador personal certificado NSCA, ISSA o CFES cerca de ti. Crea tu perfil verificado gratis.',
    certVerifyLabel: 'Número de certificación (NSCA / ISSA / CFES)',
    certVerifyPlaceholder: 'ej. NSCA-CPT-12345',
    i18nLocale: 'es',
    brandName: 'EntrenaCon',
  },

  // ── Mexico market (entrenacon.mx) - Spanish UI, MXN pricing ──────────────
  mx: {
    market: 'mx',
    domain: 'entrenacon.mx',
    currency: 'MXN',
    currencySymbol: 'MX$',
    proPrice: 399,
    proPriceLabel: 'MX$399/mes',
    certificationBody: 'CONADE / NSCA / ISSA',
    heroHeadline: 'La plataforma para Entrenadores Personales certificados en México',
    heroSubline: 'Certificado CONADE, NSCA o ISSA. Visible para tus clientes en 60 segundos. Gratis.',
    ctaText: 'Crear mi perfil gratis',
    trustBadges: ['Certificado CONADE', 'NSCA Acreditado', 'Entrenador Verificado'],
    locale: 'es-MX',
    flag: '🇲🇽',
    phonePrefix: '+52',
    paymentEnabled: false,
    waitlistEnabled: true,
    paymentNote: 'Los pagos llegarán pronto en México. Únete a la lista de espera para acceso anticipado y bloquea el precio de lanzamiento.',
    incomeSession: '48,000', incomePro: '1,44,000', incomePassive: '36,000',
    incomeSessionLabel: 'MX$/mes de 6 clientes × MX$8,000 paquetes',
    incomeProLabel: 'Sesiones + productos digitales + comisiones de afiliados',    incomePassiveLabel: 'MX$ mientras duermes - productos digitales & afiliación',
    takeRatePercent: 8,
    takeRateEnabled: false,
    takeRateNote: 'Cuando EntrenaCon Pagos se lance en México, se aplicará una tarifa de plataforma del 8% a las sesiones reservadas a través de la plataforma. Los entrenadores Pro pagan el 5%.',
    paymentProvider: 'stripe',
    siteTitle: 'EntrenaCon - Entrenadores Personales Certificados en Españaico',
    metaDescription: 'Encuentra un entrenador personal certificado CONADE, NSCA o ISSA cerca de ti. Crea tu perfil verificado gratis.',
    certVerifyLabel: 'Número de certificación (CONADE / NSCA / ISSA)',
    certVerifyPlaceholder: 'ej. CONADE-12345',
    i18nLocale: 'es',
    brandName: 'EntrenaCon',
  },
};

/**
 * Detect market from a hostname string.
 * Falls back to 'ae' for local dev, Netlify previews, and unknown hosts.
 */
export function detectMarket(hostname: string): MarketConfig {
  const h = hostname.toLowerCase().replace(/^www\./, '');

  // French domains
  if (h === 'coachepar.fr' || h === 'coachepar.com') return MARKETS.fr;

  // Italian domains
  if (h === 'allenaticon.it' || h === 'allenaticon.com') return MARKETS.it;

  // Spanish / Mexico domains
  if (h === 'entrenacon.mx') return MARKETS.mx;
  if (h === 'entrenacon.com') return MARKETS.es;

  // English domains
  if (h.includes('trainedby.uk')) return MARKETS.uk;
  if (h.includes('trainedby.in')) return MARKETS.in;
  if (h.includes('trainedby.com') && !h.includes('trainedby.ae')) return MARKETS.com;

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
