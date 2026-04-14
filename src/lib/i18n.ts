// ─── TrainedBy i18n — domain-aware localisation ───────────────────────────
// Supports: en (default), fr (coachepar.*), it (allenaticon.*), es (entrenacon.*)
//
// Usage (in any .astro page):
//   import { getLocale, t } from '../lib/i18n';
//   const locale = getLocale(Astro.request);
//   // or client-side: const locale = getLocaleClient();

export type Locale = 'en' | 'fr' | 'it' | 'es';

// ─── Domain → locale map ──────────────────────────────────────────────────
const DOMAIN_LOCALE_MAP: Record<string, Locale> = {
  'coachepar.fr':      'fr',
  'coachepar.com':     'fr',
  'www.coachepar.fr':  'fr',
  'www.coachepar.com': 'fr',
  'allenaticon.it':    'it',
  'allenaticon.com':   'it',
  'www.allenaticon.it':  'it',
  'www.allenaticon.com': 'it',
  'entrenacon.com':    'es',
  'entrenacon.mx':     'es',
  'www.entrenacon.com': 'es',
  'www.entrenacon.mx':  'es',
};

/** Detect locale from Astro request (server-side / build-time) */
export function getLocale(request: Request): Locale {
  try {
    const host = new URL(request.url).hostname.replace(/^www\./, '');
    return DOMAIN_LOCALE_MAP[host] ?? 'en';
  } catch {
    return 'en';
  }
}

/** Detect locale client-side (browser) */
export function getLocaleClient(): Locale {
  if (typeof window === 'undefined') return 'en';
  const host = window.location.hostname.replace(/^www\./, '');
  return DOMAIN_LOCALE_MAP[host] ?? 'en';
}

// ─── Brand names per locale ───────────────────────────────────────────────
export const BRAND: Record<Locale, { name: string; tagline: string; domain: string }> = {
  en: { name: 'TrainedBy',    tagline: 'The OS for Personal Trainers',         domain: 'trainedby.ae' },
  fr: { name: 'CoachéPar',    tagline: "L'OS pour les Coachs Sportifs",         domain: 'coachepar.fr' },
  it: { name: 'AllenatoCon',  tagline: "Il sistema operativo per i Personal Trainer", domain: 'allenaticon.it' },
  es: { name: 'EntrenaCon',   tagline: 'El sistema para Entrenadores Personales', domain: 'entrenacon.com' },
};

// ─── Full translation strings ─────────────────────────────────────────────
export const TRANSLATIONS: Record<Locale, Record<string, string>> = {
  en: {
    // Nav
    'nav.how_it_works':   'How it works',
    'nav.income':         'Income calculator',
    'nav.pricing':        'Pricing',
    'nav.see_profile':    'See a Profile',
    'nav.get_os':         'Get Your OS →',
    'nav.find_trainer':   'Find a Trainer',
    'nav.login':          'Log in',

    // Landing hero
    'landing.eyebrow':    'The PT Operating System',
    'landing.headline_1': 'Your entire PT business.',
    'landing.headline_2': 'One link.',
    'landing.sub':        'Verified profile. AI training plans. Client management. Booking. All in one place — built for serious trainers.',
    'landing.guarantee':  'No commission. Cancel anytime.',
    'landing.cta_primary':   'Start for free →',
    'landing.cta_secondary': 'See how it works',

    // Landing sections
    'landing.how_title':     'Everything you need to run your PT business',
    'landing.social_proof':  'Trusted by verified trainers across UAE & UK',
    'landing.income_title':  'How much could you earn?',
    'landing.income_sub':    'See your potential monthly income based on your sessions and rate.',
    'landing.pricing_title': 'Simple, transparent pricing',
    'landing.pricing_sub':   'No hidden fees. No commission on bookings.',

    // Find page
    'find.title':         'Find a Verified Personal Trainer',
    'find.sub':           'Browse REPs-verified trainers. Filter by speciality, location and training mode.',
    'find.search_placeholder': 'Search by name, speciality or location…',
    'find.filter_all':    'All',
    'find.filter_online': 'Online',
    'find.filter_outdoor':'Outdoor',
    'find.filter_gym':    'Gym',
    'find.filter_home':   'Home',
    'find.verified_badge':'Verified',
    'find.per_session':   'per session',
    'find.view_profile':  'View Profile',
    'find.no_results':    'No trainers found. Try a different search.',
    'find.loading':       'Loading trainers…',

    // Join page
    'join.title':         'Join TrainedBy',
    'join.sub':           'Create your verified trainer profile in minutes.',
    'join.name_label':    'Full name',
    'join.email_label':   'Email address',
    'join.phone_label':   'Phone number',
    'join.city_label':    'City',
    'join.speciality_label': 'Primary speciality',
    'join.reps_label':    'REPs / CIMSPA number',
    'join.submit':        'Create my profile →',
    'join.already':       'Already have an account?',
    'join.login':         'Log in',

    // Profile page
    'profile.book':       'Book a Session',
    'profile.contact':    'Contact',
    'profile.verified':   'Verified Trainer',
    'profile.per_session':'per session',
    'profile.specialities': 'Specialities',
    'profile.about':      'About',
    'profile.reviews':    'Reviews',
    'profile.location':   'Location',
    'profile.training_modes': 'Training modes',

    // Pricing
    'pricing.title':      'Pricing',
    'pricing.sub':        'One plan. Everything included.',
    'pricing.monthly':    'month',
    'pricing.yearly':     'year',
    'pricing.save':       'Save 20%',
    'pricing.cta':        'Start free trial →',
    'pricing.no_cc':      'No credit card required',

    // Footer
    'footer.trainers':    'For Trainers',
    'footer.clients':     'For Clients',
    'footer.company':     'Company',
    'footer.rights':      'All rights reserved.',
    'footer.privacy':     'Privacy Policy',
    'footer.terms':       'Terms of Service',

    // Academy
    'academy.enrol':      'Enrol Now',
    'academy.spots_left': 'spots left',
    'academy.full':       'Full',
    'academy.per_term':   'per term',
    'academy.coaches':    'Coaching Staff',
    'academy.programmes': 'Programmes',
    'academy.book_trial': 'Book a Trial',
  },

  fr: {
    // Nav
    'nav.how_it_works':   'Comment ça marche',
    'nav.income':         'Calculateur de revenus',
    'nav.pricing':        'Tarifs',
    'nav.see_profile':    'Voir un profil',
    'nav.get_os':         'Démarrer →',
    'nav.find_trainer':   'Trouver un coach',
    'nav.login':          'Connexion',

    // Landing hero
    'landing.eyebrow':    'Le système pour les coachs sportifs',
    'landing.headline_1': 'Tout votre activité de coach.',
    'landing.headline_2': 'Un seul lien.',
    'landing.sub':        'Profil certifié. Plans d\'entraînement IA. Gestion clients. Réservation. Tout en un — conçu pour les coachs sérieux.',
    'landing.guarantee':  'Sans commission. Résiliable à tout moment.',
    'landing.cta_primary':   'Commencer gratuitement →',
    'landing.cta_secondary': 'Voir comment ça marche',

    // Landing sections
    'landing.how_title':     'Tout ce qu\'il faut pour gérer votre activité de coach',
    'landing.social_proof':  'Approuvé par des coachs certifiés en France et en Europe',
    'landing.income_title':  'Combien pourriez-vous gagner ?',
    'landing.income_sub':    'Estimez vos revenus mensuels selon vos séances et votre tarif.',
    'landing.pricing_title': 'Tarification simple et transparente',
    'landing.pricing_sub':   'Aucuns frais cachés. Aucune commission sur les réservations.',

    // Find page
    'find.title':         'Trouver un Coach Sportif Certifié',
    'find.sub':           'Parcourez les coachs certifiés. Filtrez par spécialité, lieu et mode d\'entraînement.',
    'find.search_placeholder': 'Rechercher par nom, spécialité ou ville…',
    'find.filter_all':    'Tous',
    'find.filter_online': 'En ligne',
    'find.filter_outdoor':'Extérieur',
    'find.filter_gym':    'Salle',
    'find.filter_home':   'Domicile',
    'find.verified_badge':'Certifié',
    'find.per_session':   'par séance',
    'find.view_profile':  'Voir le profil',
    'find.no_results':    'Aucun coach trouvé. Essayez une autre recherche.',
    'find.loading':       'Chargement des coachs…',

    // Join page
    'join.title':         'Rejoindre CoachéPar',
    'join.sub':           'Créez votre profil de coach certifié en quelques minutes.',
    'join.name_label':    'Nom complet',
    'join.email_label':   'Adresse e-mail',
    'join.phone_label':   'Numéro de téléphone',
    'join.city_label':    'Ville',
    'join.speciality_label': 'Spécialité principale',
    'join.reps_label':    'Numéro de certification (BPJEPS / STAPS)',
    'join.submit':        'Créer mon profil →',
    'join.already':       'Vous avez déjà un compte ?',
    'join.login':         'Se connecter',

    // Profile page
    'profile.book':       'Réserver une séance',
    'profile.contact':    'Contacter',
    'profile.verified':   'Coach Certifié',
    'profile.per_session':'par séance',
    'profile.specialities': 'Spécialités',
    'profile.about':      'À propos',
    'profile.reviews':    'Avis',
    'profile.location':   'Lieu',
    'profile.training_modes': 'Modes d\'entraînement',

    // Pricing
    'pricing.title':      'Tarifs',
    'pricing.sub':        'Un seul abonnement. Tout inclus.',
    'pricing.monthly':    'mois',
    'pricing.yearly':     'an',
    'pricing.save':       'Économisez 20 %',
    'pricing.cta':        'Essai gratuit →',
    'pricing.no_cc':      'Sans carte bancaire',

    // Footer
    'footer.trainers':    'Pour les coachs',
    'footer.clients':     'Pour les clients',
    'footer.company':     'Entreprise',
    'footer.rights':      'Tous droits réservés.',
    'footer.privacy':     'Politique de confidentialité',
    'footer.terms':       'Conditions d\'utilisation',

    // Academy
    'academy.enrol':      'S\'inscrire',
    'academy.spots_left': 'places restantes',
    'academy.full':       'Complet',
    'academy.per_term':   'par trimestre',
    'academy.coaches':    'Équipe d\'entraîneurs',
    'academy.programmes': 'Programmes',
    'academy.book_trial': 'Réserver un essai',
  },

  it: {
    // Nav
    'nav.how_it_works':   'Come funziona',
    'nav.income':         'Calcolatore guadagni',
    'nav.pricing':        'Prezzi',
    'nav.see_profile':    'Vedi un profilo',
    'nav.get_os':         'Inizia →',
    'nav.find_trainer':   'Trova un trainer',
    'nav.login':          'Accedi',

    // Landing hero
    'landing.eyebrow':    'Il sistema per i Personal Trainer',
    'landing.headline_1': 'Tutta la tua attività da PT.',
    'landing.headline_2': 'Un solo link.',
    'landing.sub':        'Profilo certificato. Piani di allenamento con IA. Gestione clienti. Prenotazioni. Tutto in un posto — pensato per i trainer seri.',
    'landing.guarantee':  'Nessuna commissione. Disdici quando vuoi.',
    'landing.cta_primary':   'Inizia gratis →',
    'landing.cta_secondary': 'Scopri come funziona',

    // Landing sections
    'landing.how_title':     'Tutto ciò che ti serve per gestire la tua attività',
    'landing.social_proof':  'Scelto da trainer certificati in Italia e in Europa',
    'landing.income_title':  'Quanto potresti guadagnare?',
    'landing.income_sub':    'Calcola il tuo reddito mensile in base alle sessioni e alla tariffa.',
    'landing.pricing_title': 'Prezzi semplici e trasparenti',
    'landing.pricing_sub':   'Nessun costo nascosto. Nessuna commissione sulle prenotazioni.',

    // Find page
    'find.title':         'Trova un Personal Trainer Certificato',
    'find.sub':           'Sfoglia i trainer certificati. Filtra per specialità, luogo e modalità di allenamento.',
    'find.search_placeholder': 'Cerca per nome, specialità o città…',
    'find.filter_all':    'Tutti',
    'find.filter_online': 'Online',
    'find.filter_outdoor':'All\'aperto',
    'find.filter_gym':    'Palestra',
    'find.filter_home':   'A domicilio',
    'find.verified_badge':'Certificato',
    'find.per_session':   'a sessione',
    'find.view_profile':  'Vedi il profilo',
    'find.no_results':    'Nessun trainer trovato. Prova una ricerca diversa.',
    'find.loading':       'Caricamento trainer…',

    // Join page
    'join.title':         'Unisciti ad AllenatoCon',
    'join.sub':           'Crea il tuo profilo da trainer certificato in pochi minuti.',
    'join.name_label':    'Nome completo',
    'join.email_label':   'Indirizzo email',
    'join.phone_label':   'Numero di telefono',
    'join.city_label':    'Città',
    'join.speciality_label': 'Specialità principale',
    'join.reps_label':    'Numero certificazione (EQF / CONI)',
    'join.submit':        'Crea il mio profilo →',
    'join.already':       'Hai già un account?',
    'join.login':         'Accedi',

    // Profile page
    'profile.book':       'Prenota una sessione',
    'profile.contact':    'Contatta',
    'profile.verified':   'Trainer Certificato',
    'profile.per_session':'a sessione',
    'profile.specialities': 'Specialità',
    'profile.about':      'Chi sono',
    'profile.reviews':    'Recensioni',
    'profile.location':   'Luogo',
    'profile.training_modes': 'Modalità di allenamento',

    // Pricing
    'pricing.title':      'Prezzi',
    'pricing.sub':        'Un solo piano. Tutto incluso.',
    'pricing.monthly':    'mese',
    'pricing.yearly':     'anno',
    'pricing.save':       'Risparmia il 20%',
    'pricing.cta':        'Prova gratuita →',
    'pricing.no_cc':      'Senza carta di credito',

    // Footer
    'footer.trainers':    'Per i trainer',
    'footer.clients':     'Per i clienti',
    'footer.company':     'Azienda',
    'footer.rights':      'Tutti i diritti riservati.',
    'footer.privacy':     'Informativa sulla privacy',
    'footer.terms':       'Termini di servizio',

    // Academy
    'academy.enrol':      'Iscriviti ora',
    'academy.spots_left': 'posti disponibili',
    'academy.full':       'Completo',
    'academy.per_term':   'a trimestre',
    'academy.coaches':    'Staff tecnico',
    'academy.programmes': 'Programmi',
    'academy.book_trial': 'Prenota una prova',
  },

  es: {
    // Nav
    'nav.how_it_works':   'Cómo funciona',
    'nav.income':         'Calculadora de ingresos',
    'nav.pricing':        'Precios',
    'nav.see_profile':    'Ver un perfil',
    'nav.get_os':         'Empezar →',
    'nav.find_trainer':   'Encontrar un entrenador',
    'nav.login':          'Iniciar sesión',

    // Landing hero
    'landing.eyebrow':    'El sistema para Entrenadores Personales',
    'landing.headline_1': 'Todo tu negocio como entrenador.',
    'landing.headline_2': 'Un solo enlace.',
    'landing.sub':        'Perfil verificado. Planes de entrenamiento con IA. Gestión de clientes. Reservas. Todo en un lugar — diseñado para entrenadores serios.',
    'landing.guarantee':  'Sin comisiones. Cancela cuando quieras.',
    'landing.cta_primary':   'Empieza gratis →',
    'landing.cta_secondary': 'Ver cómo funciona',

    // Landing sections
    'landing.how_title':     'Todo lo que necesitas para gestionar tu negocio',
    'landing.social_proof':  'Elegido por entrenadores certificados en España y Latinoamérica',
    'landing.income_title':  '¿Cuánto podrías ganar?',
    'landing.income_sub':    'Calcula tus ingresos mensuales según tus sesiones y tarifa.',
    'landing.pricing_title': 'Precios simples y transparentes',
    'landing.pricing_sub':   'Sin cargos ocultos. Sin comisiones en reservas.',

    // Find page
    'find.title':         'Encontrar un Entrenador Personal Certificado',
    'find.sub':           'Explora entrenadores certificados. Filtra por especialidad, ubicación y modalidad.',
    'find.search_placeholder': 'Buscar por nombre, especialidad o ciudad…',
    'find.filter_all':    'Todos',
    'find.filter_online': 'Online',
    'find.filter_outdoor':'Al aire libre',
    'find.filter_gym':    'Gimnasio',
    'find.filter_home':   'A domicilio',
    'find.verified_badge':'Verificado',
    'find.per_session':   'por sesión',
    'find.view_profile':  'Ver perfil',
    'find.no_results':    'No se encontraron entrenadores. Prueba otra búsqueda.',
    'find.loading':       'Cargando entrenadores…',

    // Join page
    'join.title':         'Únete a EntrenaCon',
    'join.sub':           'Crea tu perfil de entrenador certificado en minutos.',
    'join.name_label':    'Nombre completo',
    'join.email_label':   'Correo electrónico',
    'join.phone_label':   'Número de teléfono',
    'join.city_label':    'Ciudad',
    'join.speciality_label': 'Especialidad principal',
    'join.reps_label':    'Número de certificación (NSCA / ISSA / CFES)',
    'join.submit':        'Crear mi perfil →',
    'join.already':       '¿Ya tienes una cuenta?',
    'join.login':         'Iniciar sesión',

    // Profile page
    'profile.book':       'Reservar una sesión',
    'profile.contact':    'Contactar',
    'profile.verified':   'Entrenador Verificado',
    'profile.per_session':'por sesión',
    'profile.specialities': 'Especialidades',
    'profile.about':      'Sobre mí',
    'profile.reviews':    'Reseñas',
    'profile.location':   'Ubicación',
    'profile.training_modes': 'Modalidades de entrenamiento',

    // Pricing
    'pricing.title':      'Precios',
    'pricing.sub':        'Un solo plan. Todo incluido.',
    'pricing.monthly':    'mes',
    'pricing.yearly':     'año',
    'pricing.save':       'Ahorra un 20%',
    'pricing.cta':        'Prueba gratuita →',
    'pricing.no_cc':      'Sin tarjeta de crédito',

    // Footer
    'footer.trainers':    'Para entrenadores',
    'footer.clients':     'Para clientes',
    'footer.company':     'Empresa',
    'footer.rights':      'Todos los derechos reservados.',
    'footer.privacy':     'Política de privacidad',
    'footer.terms':       'Términos de servicio',

    // Academy
    'academy.enrol':      'Inscribirse ahora',
    'academy.spots_left': 'plazas disponibles',
    'academy.full':       'Completo',
    'academy.per_term':   'por trimestre',
    'academy.coaches':    'Cuerpo técnico',
    'academy.programmes': 'Programas',
    'academy.book_trial': 'Reservar una prueba',
  },
};

/** Translate a key for a given locale, falling back to English */
export function t(locale: Locale, key: string): string {
  return TRANSLATIONS[locale]?.[key] ?? TRANSLATIONS['en'][key] ?? key;
}

/** Get the HTML lang attribute value for a locale */
export function getLangAttr(locale: Locale): string {
  const map: Record<Locale, string> = { en: 'en', fr: 'fr', it: 'it', es: 'es' };
  return map[locale];
}

/** Get the brand name for a locale */
export function getBrand(locale: Locale) {
  return BRAND[locale];
}

/** Inline script string to inject locale into window for client-side JS */
export function getLocaleScript(locale: Locale): string {
  return `window.__LOCALE__ = '${locale}'; window.__BRAND__ = ${JSON.stringify(BRAND[locale])};`;
}
