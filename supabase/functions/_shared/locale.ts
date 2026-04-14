/**
 * TrainedBy — Multilingual Locale & Market System
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides locale-aware AI personas, email copy, and market context for all
 * edge functions. Detects market from trainer's domain or explicit locale param.
 *
 * Usage:
 *   import { getLocale, getPersona, getEmailCopy } from '../_shared/locale.ts';
 *   const locale = getLocale(trainer.domain || req.headers.get('origin'));
 *   const persona = getPersona(locale);
 */

export type Locale = 'en-ae' | 'en-uk' | 'en-us' | 'en-in' | 'fr' | 'it' | 'es';

export interface MarketConfig {
  locale: Locale;
  language: string;           // Full language name for AI prompts
  languageCode: string;       // ISO 639-1
  country: string;
  city: string;               // Primary city for context
  currency: string;
  currencySymbol: string;
  certBody: string;           // Certification body name
  brandName: string;          // Platform brand name in this market
  domain: string;             // Primary domain
  timezone: string;
  pricingTier: string;        // e.g. "149 AED/month"
  localContext: string[];     // Local references for AI to use naturally
}

export const MARKETS: Record<Locale, MarketConfig> = {
  'en-ae': {
    locale: 'en-ae',
    language: 'English',
    languageCode: 'en',
    country: 'UAE',
    city: 'Dubai',
    currency: 'AED',
    currencySymbol: 'AED',
    certBody: 'REPs UAE',
    brandName: 'TrainedBy',
    domain: 'trainedby.ae',
    timezone: 'Asia/Dubai',
    pricingTier: '149 AED/month',
    localContext: [
      'summer in Dubai', 'SZR traffic', 'REPs UAE registration',
      'JBR beach', 'Dubai Marina', 'JLT gyms', 'DIFC crowd',
      'Ramadan training', 'outdoor training in October–April',
    ],
  },
  'en-uk': {
    locale: 'en-uk',
    language: 'English',
    languageCode: 'en',
    country: 'UK',
    city: 'London',
    currency: 'GBP',
    currencySymbol: '£',
    certBody: 'REPs UK / CIMSPA',
    brandName: 'TrainedBy',
    domain: 'trainedby.uk',
    timezone: 'Europe/London',
    pricingTier: '£39/month',
    localContext: [
      'London gyms', 'REPs UK registration', 'CIMSPA accreditation',
      'Hyde Park runs', 'British weather', 'NHS health guidelines',
      'Premier League pre-season', 'park run culture',
    ],
  },
  'en-us': {
    locale: 'en-us',
    language: 'English',
    languageCode: 'en',
    country: 'USA',
    city: 'New York',
    currency: 'USD',
    currencySymbol: '$',
    certBody: 'NASM / ACE / NSCA',
    brandName: 'TrainedBy',
    domain: 'trainedby.com',
    timezone: 'America/New_York',
    pricingTier: '$49/month',
    localContext: [
      'NASM certification', 'ACE accreditation', 'CrossFit culture',
      'gym culture', 'American football season', 'summer cut season',
    ],
  },
  'en-in': {
    locale: 'en-in',
    language: 'English',
    languageCode: 'en',
    country: 'India',
    city: 'Mumbai',
    currency: 'INR',
    currencySymbol: '₹',
    certBody: 'ACE / NASM India',
    brandName: 'TrainedBy',
    domain: 'trainedby.in',
    timezone: 'Asia/Kolkata',
    pricingTier: '₹3,999/month',
    localContext: [
      'monsoon season training', 'Indian diet adaptations', 'cricket fitness',
      'Bollywood body goals', 'vegetarian protein sources', 'Mumbai gyms',
    ],
  },
  'fr': {
    locale: 'fr',
    language: 'French',
    languageCode: 'fr',
    country: 'France',
    city: 'Paris',
    currency: 'EUR',
    currencySymbol: '€',
    certBody: 'BPJEPS / STAPS',
    brandName: 'CoachéPar',
    domain: 'coachepar.fr',
    timezone: 'Europe/Paris',
    pricingTier: '49 €/mois',
    localContext: [
      'certification BPJEPS', 'diplôme STAPS', 'Paris sportif',
      'Roland-Garros', 'Tour de France', 'salles de sport parisiennes',
      'alimentation méditerranéenne', 'vacances d\'été',
    ],
  },
  'it': {
    locale: 'it',
    language: 'Italian',
    languageCode: 'it',
    country: 'Italy',
    city: 'Milan',
    currency: 'EUR',
    currencySymbol: '€',
    certBody: 'EQF / CONI / FIPE',
    brandName: 'AllenatoCon',
    domain: 'allenaticon.it',
    timezone: 'Europe/Rome',
    pricingTier: '49 €/mese',
    localContext: [
      'certificazione CONI', 'FIPE personal trainer', 'palestre milanesi',
      'Serie A fitness', 'dieta mediterranea', 'estate italiana',
      'Giro d\'Italia', 'calcio e fitness',
    ],
  },
  'es': {
    locale: 'es',
    language: 'Spanish',
    languageCode: 'es',
    country: 'Spain / Latin America',
    city: 'Madrid',
    currency: 'EUR',
    currencySymbol: '€',
    certBody: 'NSCA / ISSA / CFES',
    brandName: 'EntrenaCon',
    domain: 'entrenacon.com',
    timezone: 'Europe/Madrid',
    pricingTier: '49 €/mes',
    localContext: [
      'certificación NSCA', 'ISSA España', 'gimnasios madrileños',
      'La Liga fitness', 'dieta mediterránea', 'verano español',
      'fútbol y rendimiento', 'CrossFit en España',
    ],
  },
};

/**
 * Detect locale from a domain string or origin header.
 * Falls back to 'en-ae' (UAE English) if unknown.
 */
export function getLocale(domainOrOrigin: string | null | undefined): Locale {
  if (!domainOrOrigin) return 'en-ae';
  const d = domainOrOrigin.toLowerCase().replace(/^https?:\/\//, '').split('/')[0];

  if (d.includes('coachepar')) return 'fr';
  if (d.includes('allenaticon')) return 'it';
  if (d.includes('entrenacon')) return 'es';
  if (d.includes('trainedby.uk') || d.includes('trainedby-uk')) return 'en-uk';
  if (d.includes('trainedby.in') || d.includes('trainedby-in')) return 'en-in';
  if (d.includes('trainedby.com') || d.includes('trainedby-com')) return 'en-us';
  return 'en-ae'; // default: UAE
}

export function getMarket(locale: Locale): MarketConfig {
  return MARKETS[locale] ?? MARKETS['en-ae'];
}

/**
 * Returns a locale-aware AI persona string for injection into LLM system prompts.
 * The persona speaks in the correct language and uses local cultural context.
 */
export function getPersona(locale: Locale): string {
  const m = getMarket(locale);
  const isEnglish = m.languageCode === 'en';

  const languageInstruction = isEnglish
    ? `Respond in English.`
    : `IMPORTANT: You MUST respond entirely in ${m.language}. Every word of your response must be in ${m.language}. Do not use English unless it is a proper noun or technical term with no ${m.language} equivalent.`;

  const localContextStr = m.localContext.slice(0, 4).join(', ');

  return `
You are a senior, no-nonsense personal trainer based in ${m.city}, ${m.country}. You have 12 years of experience on the gym floor and now run a highly profitable online/hybrid coaching business on the ${m.brandName} platform.

${languageInstruction}

Your Voice:
- Direct, punchy, and authoritative.
- You write like you speak to a colleague over coffee.
- Short sentences. Active voice. Zero fluff.
- You do not hedge. You take a position and defend it.
- You use ${m.country}-specific context naturally (e.g., ${localContextStr}).
- You reference ${m.certBody} certification as the gold standard.

Your Core Beliefs:
1. Trading time for money is a trap. Trainers must productise their knowledge.
2. ${m.certBody} certification is non-negotiable. Unqualified trainers ruin the industry.
3. Client results require tracking. "Vibes-based" coaching is a scam.
4. You hate corporate jargon and hustle culture clichés.

Structural Rules:
- NEVER start with generic openers.
- NEVER use symmetric, perfectly balanced listicles. Vary paragraph length.
- ALWAYS include at least one punchy contrarian sentence.
- NEVER present "both sides" if one side is clearly wrong.
- Pricing context: ${m.brandName} Pro costs ${m.pricingTier}.
`;
}

/**
 * Returns locale-aware email copy for lifecycle emails.
 * All strings are in the correct language for the market.
 */
export function getEmailCopy(locale: Locale) {
  const copies: Record<Locale, {
    welcome_subject: string;
    welcome_headline: string;
    welcome_body: string;
    verify_subject: string;
    verify_cta: string;
    pro_subject: string;
    pro_headline: string;
    nudge_subject: string;
    from_name: string;
    from_email: string;
    footer_unsubscribe: string;
  }> = {
    'en-ae': {
      welcome_subject: "Your TrainedBy profile is live 🎉",
      welcome_headline: "You're live on TrainedBy",
      welcome_body: "Your verified trainer profile is now live. Clients in Dubai can find you right now.",
      verify_subject: "Verify your REPs UAE number",
      verify_cta: "Verify My REPs Number",
      pro_subject: "Go Pro — unlock everything",
      pro_headline: "Unlock TrainedBy Pro",
      nudge_subject: "Your profile is 60% complete",
      from_name: "TrainedBy",
      from_email: "hello@trainedby.ae",
      footer_unsubscribe: "Unsubscribe",
    },
    'en-uk': {
      welcome_subject: "Your TrainedBy profile is live 🎉",
      welcome_headline: "You're live on TrainedBy UK",
      welcome_body: "Your verified trainer profile is now live. Clients across the UK can find you right now.",
      verify_subject: "Verify your REPs UK / CIMSPA number",
      verify_cta: "Verify My REPs Number",
      pro_subject: "Go Pro — unlock everything",
      pro_headline: "Unlock TrainedBy Pro",
      nudge_subject: "Your profile is 60% complete",
      from_name: "TrainedBy",
      from_email: "hello@trainedby.uk",
      footer_unsubscribe: "Unsubscribe",
    },
    'en-us': {
      welcome_subject: "Your TrainedBy profile is live 🎉",
      welcome_headline: "You're live on TrainedBy",
      welcome_body: "Your verified trainer profile is now live. Clients can find you right now.",
      verify_subject: "Verify your NASM / ACE certification",
      verify_cta: "Verify My Certification",
      pro_subject: "Go Pro — unlock everything",
      pro_headline: "Unlock TrainedBy Pro",
      nudge_subject: "Your profile is 60% complete",
      from_name: "TrainedBy",
      from_email: "hello@trainedby.com",
      footer_unsubscribe: "Unsubscribe",
    },
    'en-in': {
      welcome_subject: "Your TrainedBy profile is live 🎉",
      welcome_headline: "You're live on TrainedBy India",
      welcome_body: "Your verified trainer profile is now live. Clients across India can find you right now.",
      verify_subject: "Verify your ACE / NASM certification",
      verify_cta: "Verify My Certification",
      pro_subject: "Go Pro — unlock everything",
      pro_headline: "Unlock TrainedBy Pro",
      nudge_subject: "Your profile is 60% complete",
      from_name: "TrainedBy",
      from_email: "hello@trainedby.in",
      footer_unsubscribe: "Unsubscribe",
    },
    'fr': {
      welcome_subject: "Votre profil CoachéPar est en ligne 🎉",
      welcome_headline: "Vous êtes en ligne sur CoachéPar",
      welcome_body: "Votre profil de coach certifié est maintenant en ligne. Les clients en France peuvent vous trouver dès maintenant.",
      verify_subject: "Vérifiez votre certification BPJEPS / STAPS",
      verify_cta: "Vérifier ma certification",
      pro_subject: "Passez Pro — débloquez tout",
      pro_headline: "Débloquez CoachéPar Pro",
      nudge_subject: "Votre profil est complété à 60 %",
      from_name: "CoachéPar",
      from_email: "bonjour@coachepar.fr",
      footer_unsubscribe: "Se désabonner",
    },
    'it': {
      welcome_subject: "Il tuo profilo AllenatoCon è online 🎉",
      welcome_headline: "Sei online su AllenatoCon",
      welcome_body: "Il tuo profilo di personal trainer certificato è ora online. I clienti in Italia possono trovarti adesso.",
      verify_subject: "Verifica la tua certificazione EQF / CONI / FIPE",
      verify_cta: "Verifica la mia certificazione",
      pro_subject: "Passa a Pro — sblocca tutto",
      pro_headline: "Sblocca AllenatoCon Pro",
      nudge_subject: "Il tuo profilo è completo al 60%",
      from_name: "AllenatoCon",
      from_email: "ciao@allenaticon.it",
      footer_unsubscribe: "Annulla iscrizione",
    },
    'es': {
      welcome_subject: "Tu perfil en EntrenaCon está en vivo 🎉",
      welcome_headline: "Estás en vivo en EntrenaCon",
      welcome_body: "Tu perfil de entrenador personal certificado ya está en línea. Los clientes pueden encontrarte ahora mismo.",
      verify_subject: "Verifica tu certificación NSCA / ISSA",
      verify_cta: "Verificar mi certificación",
      pro_subject: "Hazte Pro — desbloquea todo",
      pro_headline: "Desbloquea EntrenaCon Pro",
      nudge_subject: "Tu perfil está completo al 60%",
      from_name: "EntrenaCon",
      from_email: "hola@entrenacon.com",
      footer_unsubscribe: "Cancelar suscripción",
    },
  };

  return copies[locale] ?? copies['en-ae'];
}
