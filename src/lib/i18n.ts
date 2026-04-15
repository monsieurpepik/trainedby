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

// ─── Underscore-style keys used by data-i18n attributes in HTML ──────────────
// The landing page and nav use data-i18n="hero_headline" style keys.
// These must exist in TRANSLATIONS for the runtime translator to work.
// We merge them directly into each locale's record below.
const UNDERSCORE_KEYS: Record<Locale, Record<string, string>> = {
  en: {
    // Nav
    brand:              'TrainedBy',
    nav_find:           'Find a Trainer',
    nav_blog:           'Stories',
    nav_community:      'Community',
    nav_for_trainers:   'For Trainers',
    nav_cta_find:       'Find Your Trainer \u2192',
    nav_login:          'Log in',
    // Hero
    hero_headline:      'Find a trainer who actually gets results.',
    hero_sub:           'Every trainer is certified and verified. Browse real profiles, read real stories, and book the right person for you.',
    search_btn:         'Search',
    search_placeholder: 'Search by name, specialty or city\u2026',
    // Filters
    filter_all:         'All',
    filter_weight_loss: 'Weight Loss',
    filter_strength:    'Strength',
    filter_nutrition:   'Nutrition',
    filter_running:     'Running',
    filter_hiit:        'HIIT',
    filter_yoga:        'Yoga',
    filter_boxing:      'Boxing',
    // Trust strip
    trust_verified:     'Verified Trainers',
    trust_profiles:     'Real Trainer Profiles',
    trust_reviews:      'No Fake Reviews',
    trust_free:         'Free to Browse',
    trust_verified_sub: 'Every trainer is certified and verified.',
    trust_profiles_sub: 'Real photos. Real credentials. No stock images.',
    trust_reviews_sub:  'Only clients who booked can leave a review.',
    trust_free_sub:     'Browse and contact trainers for free.',
    // Featured trainers section
    featured_eyebrow:   'Top trainers near you.',
    featured_title:     'Find someone who\nworks as hard as you do.',
    featured_cta:       'See all trainers \u2192',
    trainer_verified:   '\u2713 Verified',
    trainer_from:       'From',
    trainer_per_session: '/ session',
    trainer_contact:    'Contact for pricing',
    // Transformations section
    transform_eyebrow:  'Real Results',
    transform_title:    'Stories that speak\nfor themselves.',
    transform_stat_weeks: 'Weeks',
    transform_stat_lost:  'Lost',
    transform_stat_race:  'First Race',
    transform_stat_pain:  'Pain Days',
    transform_stat_deadlift: 'Deadlift',
    transform_story1_title:  'From sedentary to running her first 10k in 14 weeks',
    transform_story1_body:   'My client came to me post-pregnancy, hadn\u2019t exercised in 3 years. We started with 20-minute walks and built from there. The key was making every session feel achievable \u2014 never overwhelming.',
    transform_story2_title:  'Corporate burnout to competing in his first obstacle race',
    transform_story2_body:   'He was working 70-hour weeks and using food as stress relief. We didn\u2019t talk about diet for the first month \u2014 just built the habit of showing up. Everything else followed naturally.',
    transform_story3_title:  'Rebuilding strength after a back injury \u2014 without surgery',
    transform_story3_body:   'Her physio cleared her for light exercise but she was terrified to move. We worked with her physiotherapist from day one. Six months later she\u2019s deadlifting bodyweight and pain-free.',
    // Blog section
    blog_eyebrow:       'From the Community',
    blog_title:         'Advice from trainers\nwho actually train.',
    blog_cta:           'Read all articles \u2192',
    blog_sub:           'No sponsored content. No generic listicles. Written by verified trainers from their own practice.',
    blog_cat_science:   'Training Science',
    blog_cat_nutrition: 'Nutrition',
    blog_cat_mindset:   'Mindset',
    blog_post1_title:   'Why most people plateau after 3 months \u2014 and what actually breaks it',
    blog_post1_excerpt: 'The first three months of training are almost always productive. Then something stops working. Here\u2019s the physiology behind the plateau and the four interventions that consistently restart progress.',
    blog_post1_author:  'Level 4 Trainer \u00b7 6 min read',
    blog_post2_title:   'The only meal timing advice that actually matters',
    blog_post2_excerpt: 'Forget the 6-meal-a-day myth. Here\u2019s what the research says about when to eat \u2014 and why most of it is irrelevant if you\u2019re not getting the basics right first.',
    blog_post2_author:  'Nutrition Coach \u00b7 4 min read',
    blog_post3_title:   'What I tell every new client in the first session',
    blog_post3_excerpt: 'After hundreds of first sessions, I\u2019ve learned that the conversation that happens before the first rep is the one that determines everything. Here\u2019s what I say \u2014 and why.',
    blog_post3_author:  'Strength Coach \u00b7 5 min read',
    // Trainer banner
    banner_eyebrow:     'For Trainers',
    banner_title:       'Build your practice on a platform that works as hard as you do.',
    banner_sub:         'Verified profile, digital products, lead management, and an AI assistant \u2014 all in one place. Free to start.',
    banner_cta_primary: 'See how it works \u2192',
    banner_cta_ghost:   'Create your profile',
    // Footer (landing page inline footer)
    footer_find:        'Find a Trainer',
    footer_stories:     'Stories',
    footer_community:   'Community',
    footer_for_trainers:'For Trainers',
    footer_join:        'Join as Trainer',
    // Profile / find page dynamic strings
    profile_verified_badge: '\u2713 Verified',
    profile_from:       'From',
    profile_per_session: '/ session',
    profile_contact_pricing: 'Contact for pricing',
    // For-trainers page
    for_trainers_eyebrow: 'For Personal Trainers',
    for_trainers_title: 'Everything you need to run your practice.',
    for_trainers_sub:   'One link. Your verified profile, digital products, booking, and client management.',
    for_trainers_cta:   'Get started free \u2192',
    for_trainers_login: 'Already have an account? Log in',
    // Community page
    community_eyebrow:  'Community',
    community_title:    'Connect with trainers and clients.',
    community_sub:      'Share knowledge, ask questions, and grow your network.',
    community_cta:      'Join the community \u2192',
  },
  fr: {
    // Nav
    brand:              'Coach\u00e9Par',
    nav_find:           'Trouver un Coach',
    nav_blog:           'Histoires',
    nav_community:      'Communaut\u00e9',
    nav_for_trainers:   'Pour les Coachs',
    nav_cta_find:       'Trouver votre Coach \u2192',
    nav_login:          'Se connecter',
    // Hero
    hero_headline:      'Trouvez un coach qui obtient vraiment des r\u00e9sultats.',
    hero_sub:           'Chaque coach est certifi\u00e9 et v\u00e9rifi\u00e9. Parcourez de vrais profils, lisez de vraies histoires et r\u00e9servez la bonne personne pour vous.',
    search_btn:         'Rechercher',
    search_placeholder: 'Rechercher par nom, sp\u00e9cialit\u00e9 ou ville\u2026',
    // Filters
    filter_all:         'Tous',
    filter_weight_loss: 'Perte de poids',
    filter_strength:    'Force',
    filter_nutrition:   'Nutrition',
    filter_running:     'Course',
    filter_hiit:        'HIIT',
    filter_yoga:        'Yoga',
    filter_boxing:      'Boxe',
    // Trust strip
    trust_verified:     'Coachs v\u00e9rifi\u00e9s',
    trust_profiles:     'Vrais profils de coachs',
    trust_reviews:      'Aucun faux avis',
    trust_free:         'Gratuit \u00e0 consulter',
    trust_verified_sub: 'Chaque coach est certifi\u00e9 et v\u00e9rifi\u00e9.',
    trust_profiles_sub: 'Vraies photos. Vraies certifications. Pas de photos de stock.',
    trust_reviews_sub:  'Seuls les clients ayant r\u00e9serv\u00e9 peuvent laisser un avis.',
    trust_free_sub:     'Consultez et contactez les coachs gratuitement.',
    // Featured trainers section
    featured_eyebrow:   'Les meilleurs coachs pr\u00e8s de chez vous.',
    featured_title:     'Trouvez quelqu\u2019un qui\ntravaille aussi dur que vous.',
    featured_cta:       'Voir tous les coachs \u2192',
    trainer_verified:   '\u2713 V\u00e9rifi\u00e9',
    trainer_from:       '\u00c0 partir de',
    trainer_per_session: '/ s\u00e9ance',
    trainer_contact:    'Contacter pour le tarif',
    // Transformations section
    transform_eyebrow:  'R\u00e9sultats r\u00e9els',
    transform_title:    'Des histoires qui parlent\nd\u2019elles-m\u00eames.',
    transform_stat_weeks: 'Semaines',
    transform_stat_lost:  'Perdus',
    transform_stat_race:  '1\u00e8re course',
    transform_stat_pain:  'Jours de douleur',
    transform_stat_deadlift: 'Soulevement',
    transform_story1_title:  'De s\u00e9dentaire \u00e0 son premier 10 km en 14 semaines',
    transform_story1_body:   'Ma cliente est venue me voir apr\u00e8s sa grossesse, sans avoir fait de sport depuis 3 ans. Nous avons commenc\u00e9 par des marches de 20 minutes. La cl\u00e9 \u00e9tait de rendre chaque s\u00e9ance atteignable \u2014 jamais \u00e9crasante.',
    transform_story2_title:  'Du burn-out professionnel \u00e0 sa premi\u00e8re course d\u2019obstacles',
    transform_story2_body:   'Il travaillait 70 heures par semaine et utilisait la nourriture comme exutoire. Nous n\u2019avons pas parl\u00e9 de r\u00e9gime le premier mois \u2014 juste construit l\u2019habitude de venir. Tout le reste a suivi naturellement.',
    transform_story3_title:  'Retrouver la force apr\u00e8s une blessure au dos \u2014 sans chirurgie',
    transform_story3_body:   'Son kin\u00e9 l\u2019avait autoris\u00e9e \u00e0 faire de l\u2019exercice l\u00e9ger mais elle avait peur de bouger. Six mois plus tard, elle soul\u00e8ve son poids de corps en soulevement et n\u2019a plus de douleur.',
    // Blog section
    blog_eyebrow:       'De la communaut\u00e9',
    blog_title:         'Conseils de coachs\nqui s\u2019entra\u00eenent vraiment.',
    blog_cta:           'Lire tous les articles \u2192',
    blog_sub:           'Pas de contenu sponsoris\u00e9. Pas de listes g\u00e9n\u00e9riques. R\u00e9dig\u00e9 par des coachs certifi\u00e9s issus de leur pratique.',
    blog_cat_science:   'Science de l\u2019entra\u00eenement',
    blog_cat_nutrition: 'Nutrition',
    blog_cat_mindset:   'Mental',
    blog_post1_title:   'Pourquoi la plupart des gens plafonnent apr\u00e8s 3 mois \u2014 et ce qui brise vraiment ce plafond',
    blog_post1_excerpt: 'Les trois premiers mois d\u2019entra\u00eenement sont presque toujours productifs. Puis quelque chose s\u2019arr\u00eate. Voici la physiologie derri\u00e8re le plateau et les quatre interventions qui red\u00e9marrent constamment les progr\u00e8s.',
    blog_post1_author:  'Coach Niveau 4 \u00b7 6 min de lecture',
    blog_post2_title:   'Les seuls conseils sur le timing des repas qui comptent vraiment',
    blog_post2_excerpt: 'Oubliez le mythe des 6 repas par jour. Voici ce que la recherche dit sur le moment de manger \u2014 et pourquoi la plupart est hors sujet si vous ne ma\u00eetrisez pas les bases.',
    blog_post2_author:  'Coach en nutrition \u00b7 4 min de lecture',
    blog_post3_title:   'Ce que je dis \u00e0 chaque nouveau client lors de la premi\u00e8re s\u00e9ance',
    blog_post3_excerpt: 'Apr\u00e8s des centaines de premi\u00e8res s\u00e9ances, j\u2019ai appris que la conversation avant la premi\u00e8re r\u00e9p est celle qui d\u00e9termine tout. Voici ce que je dis \u2014 et pourquoi.',
    blog_post3_author:  'Coach Force \u00b7 5 min de lecture',
    // Trainer banner
    banner_eyebrow:     'Pour les Coachs',
    banner_title:       'D\u00e9veloppez votre activit\u00e9 sur une plateforme qui travaille aussi dur que vous.',
    banner_sub:         'Profil v\u00e9rifi\u00e9, produits num\u00e9riques, gestion des leads et assistant IA \u2014 tout en un. Gratuit pour commencer.',
    banner_cta_primary: 'Voir comment \u00e7a marche \u2192',
    banner_cta_ghost:   'Cr\u00e9er mon profil',
    // Footer
    footer_find:        'Trouver un Coach',
    footer_stories:     'Histoires',
    footer_community:   'Communaut\u00e9',
    footer_for_trainers:'Pour les Coachs',
    footer_join:        'Rejoindre en tant que Coach',
    // Profile / find page dynamic strings
    profile_verified_badge: '\u2713 V\u00e9rifi\u00e9',
    profile_from:       '\u00c0 partir de',
    profile_per_session: '/ s\u00e9ance',
    profile_contact_pricing: 'Contacter pour le tarif',
    // For-trainers page
    for_trainers_eyebrow: 'Pour les Coachs Personnels',
    for_trainers_title: 'Tout ce dont vous avez besoin pour g\u00e9rer votre activit\u00e9.',
    for_trainers_sub:   'Un seul lien. Votre profil v\u00e9rifi\u00e9, produits num\u00e9riques, r\u00e9servation et gestion des clients.',
    for_trainers_cta:   'Commencer gratuitement \u2192',
    for_trainers_login: 'D\u00e9j\u00e0 un compte\u00a0? Se connecter',
    // Community page
    community_eyebrow:  'Communaut\u00e9',
    community_title:    'Connectez-vous avec des coachs et des clients.',
    community_sub:      'Partagez des connaissances, posez des questions et d\u00e9veloppez votre r\u00e9seau.',
    community_cta:      'Rejoindre la communaut\u00e9 \u2192',
  },
  it: {
    brand:              'AllenatoCon',
    nav_find:           'Trova un Allenatore',
    nav_blog:           'Storie',
    nav_community:      'Comunit\u00e0',
    nav_for_trainers:   'Per gli Allenatori',
    nav_cta_find:       'Trova il tuo Allenatore \u2192',
    nav_login:          'Accedi',
    // Hero
    hero_headline:      'Trova un allenatore che ottiene davvero risultati.',
    hero_sub:           'Ogni allenatore \u00e8 certificato e verificato. Sfoglia profili reali, leggi storie vere e prenota la persona giusta per te.',
    search_btn:         'Cerca',
    search_placeholder: 'Cerca per nome, specialit\u00e0 o citt\u00e0\u2026',
    // Filters
    filter_all:         'Tutti',
    filter_weight_loss: 'Perdita di peso',
    filter_strength:    'Forza',
    filter_nutrition:   'Nutrizione',
    filter_running:     'Corsa',
    filter_hiit:        'HIIT',
    filter_yoga:        'Yoga',
    filter_boxing:      'Boxe',
    // Trust strip
    trust_verified:     'Allenatori verificati',
    trust_profiles:     'Profili reali di allenatori',
    trust_reviews:      'Nessuna recensione falsa',
    trust_free:         'Gratuito da sfogliare',
    trust_verified_sub: 'Ogni allenatore \u00e8 certificato e verificato.',
    trust_profiles_sub: 'Foto reali. Credenziali reali. Niente immagini stock.',
    trust_reviews_sub:  'Solo i clienti che hanno prenotato possono lasciare una recensione.',
    trust_free_sub:     'Sfoglia e contatta gli allenatori gratuitamente.',
    // Featured trainers section
    featured_eyebrow:   'I migliori allenatori vicino a te.',
    featured_title:     'Trova qualcuno che\nlavora duro quanto te.',
    featured_cta:       'Vedi tutti gli allenatori \u2192',
    trainer_verified:   '\u2713 Verificato',
    trainer_from:       'Da',
    trainer_per_session: '/ sessione',
    trainer_contact:    'Contatta per il prezzo',
    // Transformations section
    transform_eyebrow:  'Risultati reali',
    transform_title:    'Storie che parlano\nda sole.',
    transform_stat_weeks: 'Settimane',
    transform_stat_lost:  'Persi',
    transform_stat_race:  '1\u00aa Gara',
    transform_stat_pain:  'Giorni di dolore',
    transform_stat_deadlift: 'Stacco',
    transform_story1_title:  'Da sedentaria a correre il suo primo 10 km in 14 settimane',
    transform_story1_body:   'La mia cliente \u00e8 venuta da me dopo la gravidanza, senza aver fatto sport per 3 anni. Abbiamo iniziato con camminate di 20 minuti. La chiave era rendere ogni sessione raggiungibile \u2014 mai schiacciante.',
    transform_story2_title:  'Dal burnout lavorativo alla prima gara ad ostacoli',
    transform_story2_body:   'Lavorava 70 ore a settimana e usava il cibo come sfogo. Il primo mese non abbiamo parlato di dieta \u2014 abbiamo solo costruito l\u2019abitudine di presentarsi. Tutto il resto \u00e8 venuto naturalmente.',
    transform_story3_title:  'Recuperare la forza dopo un infortunio alla schiena \u2014 senza chirurgia',
    transform_story3_body:   'Il suo fisioterapista l\u2019aveva autorizzata a fare esercizio leggero ma aveva paura di muoversi. Sei mesi dopo solleva il suo peso corporeo in stacco ed \u00e8 senza dolore.',
    // Blog section
    blog_eyebrow:       'Dalla comunit\u00e0',
    blog_title:         'Consigli da allenatori\nche si allenano davvero.',
    blog_cta:           'Leggi tutti gli articoli \u2192',
    blog_sub:           'Nessun contenuto sponsorizzato. Nessuna lista generica. Scritto da allenatori certificati dalla loro pratica.',
    blog_cat_science:   'Scienza dell\u2019allenamento',
    blog_cat_nutrition: 'Nutrizione',
    blog_cat_mindset:   'Mentalit\u00e0',
    blog_post1_title:   'Perch\u00e9 la maggior parte delle persone si blocca dopo 3 mesi \u2014 e cosa lo sblocca davvero',
    blog_post1_excerpt: 'I primi tre mesi di allenamento sono quasi sempre produttivi. Poi qualcosa smette di funzionare. Ecco la fisiologia dietro il plateau e i quattro interventi che riavviano costantemente i progressi.',
    blog_post1_author:  'Allenatore Livello 4 \u00b7 6 min di lettura',
    blog_post2_title:   'Gli unici consigli sul timing dei pasti che contano davvero',
    blog_post2_excerpt: 'Dimentica il mito dei 6 pasti al giorno. Ecco cosa dice la ricerca su quando mangiare \u2014 e perch\u00e9 la maggior parte \u00e8 irrilevante se non stai facendo bene le basi.',
    blog_post2_author:  'Coach Nutrizionale \u00b7 4 min di lettura',
    blog_post3_title:   'Cosa dico ad ogni nuovo cliente nella prima sessione',
    blog_post3_excerpt: 'Dopo centinaia di prime sessioni, ho imparato che la conversazione prima del primo esercizio \u00e8 quella che determina tutto. Ecco cosa dico \u2014 e perch\u00e9.',
    blog_post3_author:  'Coach di Forza \u00b7 5 min di lettura',
    // Trainer banner
    banner_eyebrow:     'Per gli Allenatori',
    banner_title:       'Costruisci la tua attivit\u00e0 su una piattaforma che lavora duro quanto te.',
    banner_sub:         'Profilo verificato, prodotti digitali, gestione dei lead e assistente IA \u2014 tutto in un posto. Gratuito per iniziare.',
    banner_cta_primary: 'Scopri come funziona \u2192',
    banner_cta_ghost:   'Crea il tuo profilo',
    // Footer
    footer_find:        'Trova un Allenatore',
    footer_stories:     'Storie',
    footer_community:   'Comunit\u00e0',
    footer_for_trainers:'Per gli Allenatori',
    footer_join:        'Unisciti come Allenatore',
    // Profile / find page dynamic strings
    profile_verified_badge: '\u2713 Verificato',
    profile_from:       'Da',
    profile_per_session: '/ sessione',
    profile_contact_pricing: 'Contatta per il prezzo',
    // For-trainers page
    for_trainers_eyebrow: 'Per i Personal Trainer',
    for_trainers_title: 'Tutto ci\u00f2 di cui hai bisogno per gestire la tua attivit\u00e0.',
    for_trainers_sub:   'Un solo link. Il tuo profilo verificato, prodotti digitali, prenotazione e gestione clienti.',
    for_trainers_cta:   'Inizia gratuitamente \u2192',
    for_trainers_login: 'Hai gi\u00e0 un account? Accedi',
    // Community page
    community_eyebrow:  'Comunit\u00e0',
    community_title:    'Connettiti con allenatori e clienti.',
    community_sub:      'Condividi conoscenze, fai domande e amplia la tua rete.',
    community_cta:      'Unisciti alla comunit\u00e0 \u2192',
  },
  es: {
    brand:              'EntrenaCon',
    nav_find:           'Encontrar un Entrenador',
    nav_blog:           'Historias',
    nav_community:      'Comunidad',
    nav_for_trainers:   'Para Entrenadores',
    nav_cta_find:       'Encuentra tu Entrenador \u2192',
    nav_login:          'Iniciar sesi\u00f3n',
    // Hero
    hero_headline:      'Encuentra un entrenador que realmente obtiene resultados.',
    hero_sub:           'Cada entrenador est\u00e1 certificado y verificado. Explora perfiles reales, lee historias reales y reserva a la persona adecuada para ti.',
    search_btn:         'Buscar',
    search_placeholder: 'Buscar por nombre, especialidad o ciudad\u2026',
    // Filters
    filter_all:         'Todos',
    filter_weight_loss: 'P\u00e9rdida de peso',
    filter_strength:    'Fuerza',
    filter_nutrition:   'Nutrici\u00f3n',
    filter_running:     'Running',
    filter_hiit:        'HIIT',
    filter_yoga:        'Yoga',
    filter_boxing:      'Boxeo',
    // Trust strip
    trust_verified:     'Entrenadores verificados',
    trust_profiles:     'Perfiles reales de entrenadores',
    trust_reviews:      'Sin rese\u00f1as falsas',
    trust_free:         'Gratis para explorar',
    trust_verified_sub: 'Cada entrenador est\u00e1 certificado y verificado.',
    trust_profiles_sub: 'Fotos reales. Credenciales reales. Sin im\u00e1genes de stock.',
    trust_reviews_sub:  'Solo los clientes que reservaron pueden dejar una rese\u00f1a.',
    trust_free_sub:     'Explora y contacta entrenadores de forma gratuita.',
    // Featured trainers section
    featured_eyebrow:   'Los mejores entrenadores cerca de ti.',
    featured_title:     'Encuentra a alguien que\ntrabaje tan duro como t\u00fa.',
    featured_cta:       'Ver todos los entrenadores \u2192',
    trainer_verified:   '\u2713 Verificado',
    trainer_from:       'Desde',
    trainer_per_session: '/ sesi\u00f3n',
    trainer_contact:    'Contactar para precio',
    // Transformations section
    transform_eyebrow:  'Resultados reales',
    transform_title:    'Historias que hablan\npor s\u00ed solas.',
    transform_stat_weeks: 'Semanas',
    transform_stat_lost:  'Perdidos',
    transform_stat_race:  '1\u00aa Carrera',
    transform_stat_pain:  'D\u00edas de dolor',
    transform_stat_deadlift: 'Peso muerto',
    transform_story1_title:  'De sedentaria a correr su primer 10 km en 14 semanas',
    transform_story1_body:   'Mi clienta vino a m\u00ed tras su embarazo, sin haber hecho ejercicio en 3 a\u00f1os. Empezamos con caminatas de 20 minutos. La clave era hacer que cada sesi\u00f3n se sintiera alcanzable \u2014 nunca abrumadora.',
    transform_story2_title:  'Del agotamiento laboral a competir en su primera carrera de obst\u00e1culos',
    transform_story2_body:   'Trabajaba 70 horas a la semana y usaba la comida como alivio del estr\u00e9s. El primer mes no hablamos de dieta \u2014 solo construimos el h\u00e1bito de presentarse. Todo lo dem\u00e1s sigui\u00f3 naturalmente.',
    transform_story3_title:  'Recuperar la fuerza tras una lesi\u00f3n de espalda \u2014 sin cirug\u00eda',
    transform_story3_body:   'Su fisioterapeuta le autoriz\u00f3 ejercicio ligero pero ten\u00eda miedo de moverse. Seis meses despu\u00e9s levanta su peso corporal en peso muerto y est\u00e1 sin dolor.',
    // Blog section
    blog_eyebrow:       'De la comunidad',
    blog_title:         'Consejos de entrenadores\nque realmente entrenan.',
    blog_cta:           'Leer todos los art\u00edculos \u2192',
    blog_sub:           'Sin contenido patrocinado. Sin listas gen\u00e9ricas. Escrito por entrenadores certificados desde su propia pr\u00e1ctica.',
    blog_cat_science:   'Ciencia del entrenamiento',
    blog_cat_nutrition: 'Nutrici\u00f3n',
    blog_cat_mindset:   'Mentalidad',
    blog_post1_title:   'Por qu\u00e9 la mayor\u00eda de las personas se estanca despu\u00e9s de 3 meses \u2014 y qu\u00e9 lo rompe de verdad',
    blog_post1_excerpt: 'Los primeros tres meses de entrenamiento son casi siempre productivos. Luego algo deja de funcionar. Aqu\u00ed est\u00e1 la fisiolog\u00eda detr\u00e1s del estancamiento y las cuatro intervenciones que reinician el progreso.',
    blog_post1_author:  'Entrenador Nivel 4 \u00b7 6 min de lectura',
    blog_post2_title:   'El \u00fanico consejo sobre el timing de las comidas que realmente importa',
    blog_post2_excerpt: 'Olvida el mito de las 6 comidas al d\u00eda. Aqu\u00ed est\u00e1 lo que dice la investigaci\u00f3n sobre cu\u00e1ndo comer \u2014 y por qu\u00e9 la mayor\u00eda es irrelevante si no tienes los b\u00e1sicos bien.',
    blog_post2_author:  'Coach de Nutrici\u00f3n \u00b7 4 min de lectura',
    blog_post3_title:   'Lo que le digo a cada nuevo cliente en la primera sesi\u00f3n',
    blog_post3_excerpt: 'Tras cientos de primeras sesiones, he aprendido que la conversaci\u00f3n antes de la primera repetici\u00f3n es la que determina todo. Aqu\u00ed est\u00e1 lo que digo \u2014 y por qu\u00e9.',
    blog_post3_author:  'Coach de Fuerza \u00b7 5 min de lectura',
    // Trainer banner
    banner_eyebrow:     'Para Entrenadores',
    banner_title:       'Construye tu pr\u00e1ctica en una plataforma que trabaja tan duro como t\u00fa.',
    banner_sub:         'Perfil verificado, productos digitales, gesti\u00f3n de leads y asistente de IA \u2014 todo en un lugar. Gratis para empezar.',
    banner_cta_primary: 'Ver c\u00f3mo funciona \u2192',
    banner_cta_ghost:   'Crear mi perfil',
    // Footer
    footer_find:        'Encontrar un Entrenador',
    footer_stories:     'Historias',
    footer_community:   'Comunidad',
    footer_for_trainers:'Para Entrenadores',
    footer_join:        'Unirse como Entrenador',
    // Profile / find page dynamic strings
    profile_verified_badge: '\u2713 Verificado',
    profile_from:       'Desde',
    profile_per_session: '/ sesi\u00f3n',
    profile_contact_pricing: 'Contactar para precio',
    // For-trainers page
    for_trainers_eyebrow: 'Para Entrenadores Personales',
    for_trainers_title: 'Todo lo que necesitas para gestionar tu pr\u00e1ctica.',
    for_trainers_sub:   'Un solo enlace. Tu perfil verificado, productos digitales, reservas y gesti\u00f3n de clientes.',
    for_trainers_cta:   'Empezar gratis \u2192',
    for_trainers_login: '\u00bfYa tienes una cuenta? Iniciar sesi\u00f3n',
    // Community page
    community_eyebrow:  'Comunidad',
    community_title:    'Conect\u00e1te con entrenadores y clientes.',
    community_sub:      'Comparte conocimiento, haz preguntas y amplia tu red.',
    community_cta:      'Unirse a la comunidad \u2192',
  },
};

// Merge underscore keys into TRANSLATIONS at module load time
(Object.keys(UNDERSCORE_KEYS) as Locale[]).forEach((locale) => {
  Object.assign(TRANSLATIONS[locale], UNDERSCORE_KEYS[locale]);
});

/** Export for use in Base.astro server-side merge */
export const UNDERSCORE_KEYS_EXPORT = UNDERSCORE_KEYS;

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

/** Inline script string to inject locale + full translations into window for client-side JS */
export function getLocaleScript(locale: Locale): string {
  // Merge underscore keys into the translations before serialising
  const merged = { ...TRANSLATIONS[locale], ...UNDERSCORE_KEYS[locale] };
  return [
    `window.__LOCALE__ = '${locale}';`,
    `window.__BRAND__ = ${JSON.stringify(BRAND[locale])};`,
    `window.__I18N__ = ${JSON.stringify(merged)};`,
  ].join(' ');
}
