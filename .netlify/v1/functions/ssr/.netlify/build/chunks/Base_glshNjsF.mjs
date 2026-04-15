import { c as createComponent } from './astro-component_QCe02764.mjs';
import { k as createRenderInstruction, m as maybeRenderHead, r as renderTemplate, h as renderComponent, l as renderSlot, n as renderHead, u as unescapeHTML, f as addAttribute } from './ssr-function_qCRG1Hg9.mjs';

async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}</script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"></script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}

const MARKETS = {
  ae: {
    market: "ae",
    domain: "trainedby.ae",
    currency: "AED",
    currencySymbol: "AED",
    proPrice: 149,
    proPriceLabel: "149 AED/month",
    certificationBody: "REPs UAE",
    heroHeadline: "The Verified Trainer Platform for the UAE",
    heroSubline: "REPs UAE certified. Client-ready in 60 seconds. Free forever.",
    ctaText: "Create Your Free Profile",
    trustBadges: ["REPs UAE Verified", "Dubai Fitness Challenge Partner", "ADNOC Wellness Network"],
    locale: "en-AE",
    flag: "🇦🇪",
    phonePrefix: "+971",
    paymentEnabled: true,
    waitlistEnabled: false,
    incomeSession: "8,400",
    incomePro: "24,600",
    incomePassive: "6,200",
    incomeSessionLabel: "AED/month from 6 clients × 1,400 AED packages",
    incomeProLabel: "Sessions + digital products + affiliate commissions",
    incomePassiveLabel: "AED while you sleep — digital products & affiliate deals",
    paymentProvider: "stripe",
    siteTitle: "TrainedBy.ae — Verified Personal Trainers in the UAE",
    metaDescription: "Find REPs UAE verified personal trainers in Dubai, Abu Dhabi, and across the UAE. Build your verified trainer profile for free.",
    certVerifyLabel: "REPs UAE Number",
    certVerifyPlaceholder: "e.g. REP-12345",
    i18nLocale: "en",
    brandName: "TrainedBy"
  },
  uk: {
    market: "uk",
    domain: "trainedby.uk",
    currency: "GBP",
    currencySymbol: "£",
    proPrice: 9.99,
    proPriceLabel: "£9.99/month",
    certificationBody: "REPs UK",
    heroHeadline: "The Verified Personal Trainer Platform for the UK",
    heroSubline: "REPs UK registered. Get found by local clients. Free forever.",
    ctaText: "Create Your Free Profile",
    trustBadges: ["REPs UK Registered", "CIMSPA Endorsed", "UK Active Partner"],
    locale: "en-GB",
    flag: "🇬🇧",
    phonePrefix: "+44",
    paymentEnabled: true,
    waitlistEnabled: false,
    incomeSession: "3,200",
    incomePro: "9,400",
    incomePassive: "2,300",
    incomeSessionLabel: "£/month from 6 clients × £530 packages",
    incomeProLabel: "Sessions + digital products + affiliate commissions",
    incomePassiveLabel: "£ while you sleep — digital products & affiliate deals",
    paymentProvider: "stripe",
    siteTitle: "TrainedBy.uk — Verified Personal Trainers in the UK",
    metaDescription: "Find REPs UK registered personal trainers near you. Build your verified trainer profile for free.",
    certVerifyLabel: "REPs UK Number",
    certVerifyPlaceholder: "e.g. R0012345",
    i18nLocale: "en",
    brandName: "TrainedBy"
  },
  in: {
    market: "in",
    domain: "trainedby.in",
    currency: "INR",
    currencySymbol: "₹",
    proPrice: 499,
    proPriceLabel: "₹499/month",
    proAltPrice: 999,
    proAltPriceLabel: "₹999/month",
    certificationBody: "UK-Standard Verified",
    heroHeadline: "UK-Standard Fitness Verification. Now in India.",
    heroSubline: "The same standard that certifies trainers in London — now available to India's best. Free forever.",
    ctaText: "Get Your Free Verified Profile",
    trustBadges: ["UK-Standard Verified", "CIMSPA-Aligned", "Trusted by Trainers in 3 Countries"],
    locale: "en-IN",
    flag: "🇮🇳",
    phonePrefix: "+91",
    paymentEnabled: false,
    waitlistEnabled: true,
    paymentNote: "Payments launching soon in India. Join the waitlist for early access and lock in the launch price.",
    incomeSession: "52,000",
    incomePro: "1,52,000",
    incomePassive: "38,000",
    incomeSessionLabel: "₹/month from 6 clients × ₹8,500 packages",
    incomeProLabel: "Sessions + digital products + affiliate commissions",
    incomePassiveLabel: "₹ while you sleep — digital products & affiliate deals",
    paymentProvider: "razorpay",
    siteTitle: "TrainedBy.in — UK-Standard Verified Fitness Professionals in India",
    metaDescription: "The UK-origin platform for verified personal trainers and fitness coaches in India. Get your UK-Standard Verified badge and grow your client base for free.",
    certVerifyLabel: "Certification Number (NSCA, ACSM, ACE, CIMSPA or equivalent)",
    certVerifyPlaceholder: "e.g. NSCA-CPT-12345 or CIMSPA-12345",
    i18nLocale: "en",
    brandName: "TrainedBy"
  },
  com: {
    market: "com",
    domain: "trainedby.com",
    currency: "USD",
    currencySymbol: "$",
    proPrice: 19,
    proPriceLabel: "$19/month",
    certificationBody: "NASM / ACE / NSCA",
    heroHeadline: "The Verified Personal Trainer Platform",
    heroSubline: "Internationally certified. Client-ready in 60 seconds. Free forever.",
    ctaText: "Create Your Free Profile",
    trustBadges: ["NASM Certified", "ACE Accredited", "NSCA Member"],
    locale: "en-US",
    flag: "🌍",
    phonePrefix: "+1",
    paymentEnabled: true,
    waitlistEnabled: false,
    incomeSession: "2,400",
    incomePro: "7,200",
    incomePassive: "1,800",
    incomeSessionLabel: "$/month from 6 clients × $400 packages",
    incomeProLabel: "Sessions + digital products + affiliate commissions",
    incomePassiveLabel: "$ while you sleep — digital products & affiliate deals",
    paymentProvider: "stripe",
    siteTitle: "TrainedBy — Verified Personal Trainers Worldwide",
    metaDescription: "The global platform for NASM, ACE, and NSCA certified personal trainers. Build your verified profile for free.",
    certVerifyLabel: "Certification Number",
    certVerifyPlaceholder: "e.g. NASM-12345",
    i18nLocale: "en",
    brandName: "TrainedBy"
  },
  // ── French market (coachepar.fr / coachepar.com) ──────────────────────────
  fr: {
    market: "fr",
    domain: "coachepar.fr",
    currency: "EUR",
    currencySymbol: "€",
    proPrice: 19,
    proPriceLabel: "19 €/mois",
    certificationBody: "BPJEPS / STAPS",
    heroHeadline: "La plateforme des coachs sportifs certifiés",
    heroSubline: "Certifié BPJEPS ou STAPS. Visible par vos clients en 60 secondes. Gratuit.",
    ctaText: "Créer mon profil gratuit",
    trustBadges: ["Certifié BPJEPS", "Diplômé STAPS", "Coach vérifié"],
    locale: "fr-FR",
    flag: "🇫🇷",
    phonePrefix: "+33",
    paymentEnabled: false,
    waitlistEnabled: true,
    paymentNote: "Les paiements arrivent bientôt en France. Rejoignez la liste d'attente pour un accès anticipé et bloquez le prix de lancement.",
    incomeSession: "2,400",
    incomePro: "7,200",
    incomePassive: "1,800",
    incomeSessionLabel: "€/mois de 6 clients × 400€ forfaits",
    incomeProLabel: "Séances + produits digitaux + commissions d'affiliation",
    incomePassiveLabel: "€ pendant que vous dormez — produits digitaux & affiliation",
    paymentProvider: "stripe",
    siteTitle: "CoachéPar — Coachs Sportifs Certifiés en France",
    metaDescription: "Trouvez un coach sportif certifié BPJEPS ou STAPS près de chez vous. Créez votre profil de coach vérifié gratuitement.",
    certVerifyLabel: "Numéro de certification (BPJEPS / STAPS)",
    certVerifyPlaceholder: "ex. BPJEPS-12345",
    i18nLocale: "fr",
    brandName: "CoachéPar"
  },
  // ── Italian market (allenaticon.it / allenaticon.com) ─────────────────────
  it: {
    market: "it",
    domain: "allenaticon.it",
    currency: "EUR",
    currencySymbol: "€",
    proPrice: 19,
    proPriceLabel: "19 €/mese",
    certificationBody: "EQF / CONI / FIPE",
    heroHeadline: "La piattaforma per i Personal Trainer certificati",
    heroSubline: "Certificato EQF o CONI. Trovato dai tuoi clienti in 60 secondi. Gratis.",
    ctaText: "Crea il mio profilo gratis",
    trustBadges: ["Certificato EQF", "CONI Riconosciuto", "FIPE Affiliato"],
    locale: "it-IT",
    flag: "🇮🇹",
    phonePrefix: "+39",
    paymentEnabled: false,
    waitlistEnabled: true,
    paymentNote: "I pagamenti arriveranno presto in Italia. Unisciti alla lista d'attesa per l'accesso anticipato e blocca il prezzo di lancio.",
    incomeSession: "2,400",
    incomePro: "7,200",
    incomePassive: "1,800",
    incomeSessionLabel: "€/mese da 6 clienti × 400€ pacchetti",
    incomeProLabel: "Sessioni + prodotti digitali + commissioni di affiliazione",
    incomePassiveLabel: "€ mentre dormi — prodotti digitali & affiliazione",
    paymentProvider: "stripe",
    siteTitle: "AllenatoCon — Personal Trainer Certificati in Italia",
    metaDescription: "Trova un personal trainer certificato EQF o CONI vicino a te. Crea il tuo profilo verificato gratuitamente.",
    certVerifyLabel: "Numero certificazione (EQF / CONI / FIPE)",
    certVerifyPlaceholder: "es. EQF-12345",
    i18nLocale: "it",
    brandName: "AllenatoCon"
  },
  // ── Spanish market (entrenacon.com) ──────────────────────────────────────
  es: {
    market: "es",
    domain: "entrenacon.com",
    currency: "EUR",
    currencySymbol: "€",
    proPrice: 19,
    proPriceLabel: "19 €/mes",
    certificationBody: "NSCA / ISSA / CFES",
    heroHeadline: "La plataforma para Entrenadores Personales certificados",
    heroSubline: "Certificado NSCA, ISSA o CFES. Visible para tus clientes en 60 segundos. Gratis.",
    ctaText: "Crear mi perfil gratis",
    trustBadges: ["Certificado NSCA", "ISSA Acreditado", "Entrenador Verificado"],
    locale: "es-ES",
    flag: "🇪🇸",
    phonePrefix: "+34",
    paymentEnabled: false,
    waitlistEnabled: true,
    paymentNote: "Los pagos llegarán pronto en España. Únete a la lista de espera para acceso anticipado y bloquea el precio de lanzamiento.",
    incomeSession: "2,400",
    incomePro: "7,200",
    incomePassive: "1,800",
    incomeSessionLabel: "€/mes de 6 clientes × 400€ paquetes",
    incomeProLabel: "Sesiones + productos digitales + comisiones de afiliados",
    incomePassiveLabel: "€ mientras duermes — productos digitales & afiliación",
    paymentProvider: "stripe",
    siteTitle: "EntrenaCon — Entrenadores Personales Certificados",
    metaDescription: "Encuentra un entrenador personal certificado NSCA, ISSA o CFES cerca de ti. Crea tu perfil verificado gratis.",
    certVerifyLabel: "Número de certificación (NSCA / ISSA / CFES)",
    certVerifyPlaceholder: "ej. NSCA-CPT-12345",
    i18nLocale: "es",
    brandName: "EntrenaCon"
  },
  // ── Mexico market (entrenacon.mx) — Spanish UI, MXN pricing ──────────────
  mx: {
    market: "mx",
    domain: "entrenacon.mx",
    currency: "MXN",
    currencySymbol: "MX$",
    proPrice: 399,
    proPriceLabel: "MX$399/mes",
    certificationBody: "CONADE / NSCA / ISSA",
    heroHeadline: "La plataforma para Entrenadores Personales certificados en México",
    heroSubline: "Certificado CONADE, NSCA o ISSA. Visible para tus clientes en 60 segundos. Gratis.",
    ctaText: "Crear mi perfil gratis",
    trustBadges: ["Certificado CONADE", "NSCA Acreditado", "Entrenador Verificado"],
    locale: "es-MX",
    flag: "🇲🇽",
    phonePrefix: "+52",
    paymentEnabled: false,
    waitlistEnabled: true,
    paymentNote: "Los pagos llegarán pronto en México. Únete a la lista de espera para acceso anticipado y bloquea el precio de lanzamiento.",
    incomeSession: "48,000",
    incomePro: "1,44,000",
    incomePassive: "36,000",
    incomeSessionLabel: "MX$/mes de 6 clientes × MX$8,000 paquetes",
    incomeProLabel: "Sesiones + productos digitales + comisiones de afiliados",
    incomePassiveLabel: "MX$ mientras duermes — productos digitales & afiliación",
    paymentProvider: "stripe",
    siteTitle: "EntrenaCon — Entrenadores Personales Certificados en México",
    metaDescription: "Encuentra un entrenador personal certificado CONADE, NSCA o ISSA cerca de ti. Crea tu perfil verificado gratis.",
    certVerifyLabel: "Número de certificación (CONADE / NSCA / ISSA)",
    certVerifyPlaceholder: "ej. CONADE-12345",
    i18nLocale: "es",
    brandName: "EntrenaCon"
  }
};
function detectMarket(hostname) {
  const h = hostname.toLowerCase().replace(/^www\./, "");
  if (h === "coachepar.fr" || h === "coachepar.com") return MARKETS.fr;
  if (h === "allenaticon.it" || h === "allenaticon.com") return MARKETS.it;
  if (h === "entrenacon.mx") return MARKETS.mx;
  if (h === "entrenacon.com") return MARKETS.es;
  if (h.includes("trainedby.uk")) return MARKETS.uk;
  if (h.includes("trainedby.in")) return MARKETS.in;
  if (h.includes("trainedby.com") && !h.includes("trainedby.ae")) return MARKETS.com;
  return MARKETS.ae;
}
function getMarket(hostname) {
  return detectMarket(hostname);
}

const DOMAIN_LOCALE_MAP = {
  "coachepar.fr": "fr",
  "coachepar.com": "fr",
  "www.coachepar.fr": "fr",
  "www.coachepar.com": "fr",
  "allenaticon.it": "it",
  "allenaticon.com": "it",
  "www.allenaticon.it": "it",
  "www.allenaticon.com": "it",
  "entrenacon.com": "es",
  "entrenacon.mx": "es",
  "www.entrenacon.com": "es",
  "www.entrenacon.mx": "es"
};
function getLocale(request) {
  try {
    const host = new URL(request.url).hostname.replace(/^www\./, "");
    return DOMAIN_LOCALE_MAP[host] ?? "en";
  } catch {
    return "en";
  }
}
const BRAND = {
  en: { name: "TrainedBy", tagline: "The OS for Personal Trainers", domain: "trainedby.ae" },
  fr: { name: "CoachéPar", tagline: "L'OS pour les Coachs Sportifs", domain: "coachepar.fr" },
  it: { name: "AllenatoCon", tagline: "Il sistema operativo per i Personal Trainer", domain: "allenaticon.it" },
  es: { name: "EntrenaCon", tagline: "El sistema para Entrenadores Personales", domain: "entrenacon.com" }
};
const TRANSLATIONS = {
  en: {
    // Nav
    "nav.how_it_works": "How it works",
    "nav.income": "Income calculator",
    "nav.pricing": "Pricing",
    "nav.see_profile": "See a Profile",
    "nav.get_os": "Get Your OS →",
    "nav.find_trainer": "Find a Trainer",
    "nav.login": "Log in",
    // Landing hero
    "landing.eyebrow": "The PT Operating System",
    "landing.headline_1": "Your entire PT business.",
    "landing.headline_2": "One link.",
    "landing.sub": "Verified profile. AI training plans. Client management. Booking. All in one place — built for serious trainers.",
    "landing.guarantee": "No commission. Cancel anytime.",
    "landing.cta_primary": "Start for free →",
    "landing.cta_secondary": "See how it works",
    // Landing sections
    "landing.how_title": "Everything you need to run your PT business",
    "landing.social_proof": "Trusted by verified trainers across UAE & UK",
    "landing.income_title": "How much could you earn?",
    "landing.income_sub": "See your potential monthly income based on your sessions and rate.",
    "landing.pricing_title": "Simple, transparent pricing",
    "landing.pricing_sub": "No hidden fees. No commission on bookings.",
    // Find page
    "find.title": "Find a Verified Personal Trainer",
    "find.sub": "Browse REPs-verified trainers. Filter by speciality, location and training mode.",
    "find.search_placeholder": "Search by name, speciality or location…",
    "find.filter_all": "All",
    "find.filter_online": "Online",
    "find.filter_outdoor": "Outdoor",
    "find.filter_gym": "Gym",
    "find.filter_home": "Home",
    "find.verified_badge": "Verified",
    "find.per_session": "per session",
    "find.view_profile": "View Profile",
    "find.no_results": "No trainers found. Try a different search.",
    "find.loading": "Loading trainers…",
    // Join page
    "join.title": "Join TrainedBy",
    "join.sub": "Create your verified trainer profile in minutes.",
    "join.name_label": "Full name",
    "join.email_label": "Email address",
    "join.phone_label": "Phone number",
    "join.city_label": "City",
    "join.speciality_label": "Primary speciality",
    "join.reps_label": "REPs / CIMSPA number",
    "join.submit": "Create my profile →",
    "join.already": "Already have an account?",
    "join.login": "Log in",
    // Profile page
    "profile.book": "Book a Session",
    "profile.contact": "Contact",
    "profile.verified": "Verified Trainer",
    "profile.per_session": "per session",
    "profile.specialities": "Specialities",
    "profile.about": "About",
    "profile.reviews": "Reviews",
    "profile.location": "Location",
    "profile.training_modes": "Training modes",
    // Pricing
    "pricing.title": "Pricing",
    "pricing.sub": "One plan. Everything included.",
    "pricing.monthly": "month",
    "pricing.yearly": "year",
    "pricing.save": "Save 20%",
    "pricing.cta": "Start free trial →",
    "pricing.no_cc": "No credit card required",
    // Footer
    "footer.trainers": "For Trainers",
    "footer.clients": "For Clients",
    "footer.company": "Company",
    "footer.rights": "All rights reserved.",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    // Academy
    "academy.enrol": "Enrol Now",
    "academy.spots_left": "spots left",
    "academy.full": "Full",
    "academy.per_term": "per term",
    "academy.coaches": "Coaching Staff",
    "academy.programmes": "Programmes",
    "academy.book_trial": "Book a Trial"
  },
  fr: {
    // Nav
    "nav.how_it_works": "Comment ça marche",
    "nav.income": "Calculateur de revenus",
    "nav.pricing": "Tarifs",
    "nav.see_profile": "Voir un profil",
    "nav.get_os": "Démarrer →",
    "nav.find_trainer": "Trouver un coach",
    "nav.login": "Connexion",
    // Landing hero
    "landing.eyebrow": "Le système pour les coachs sportifs",
    "landing.headline_1": "Tout votre activité de coach.",
    "landing.headline_2": "Un seul lien.",
    "landing.sub": "Profil certifié. Plans d'entraînement IA. Gestion clients. Réservation. Tout en un — conçu pour les coachs sérieux.",
    "landing.guarantee": "Sans commission. Résiliable à tout moment.",
    "landing.cta_primary": "Commencer gratuitement →",
    "landing.cta_secondary": "Voir comment ça marche",
    // Landing sections
    "landing.how_title": "Tout ce qu'il faut pour gérer votre activité de coach",
    "landing.social_proof": "Approuvé par des coachs certifiés en France et en Europe",
    "landing.income_title": "Combien pourriez-vous gagner ?",
    "landing.income_sub": "Estimez vos revenus mensuels selon vos séances et votre tarif.",
    "landing.pricing_title": "Tarification simple et transparente",
    "landing.pricing_sub": "Aucuns frais cachés. Aucune commission sur les réservations.",
    // Find page
    "find.title": "Trouver un Coach Sportif Certifié",
    "find.sub": "Parcourez les coachs certifiés. Filtrez par spécialité, lieu et mode d'entraînement.",
    "find.search_placeholder": "Rechercher par nom, spécialité ou ville…",
    "find.filter_all": "Tous",
    "find.filter_online": "En ligne",
    "find.filter_outdoor": "Extérieur",
    "find.filter_gym": "Salle",
    "find.filter_home": "Domicile",
    "find.verified_badge": "Certifié",
    "find.per_session": "par séance",
    "find.view_profile": "Voir le profil",
    "find.no_results": "Aucun coach trouvé. Essayez une autre recherche.",
    "find.loading": "Chargement des coachs…",
    // Join page
    "join.title": "Rejoindre CoachéPar",
    "join.sub": "Créez votre profil de coach certifié en quelques minutes.",
    "join.name_label": "Nom complet",
    "join.email_label": "Adresse e-mail",
    "join.phone_label": "Numéro de téléphone",
    "join.city_label": "Ville",
    "join.speciality_label": "Spécialité principale",
    "join.reps_label": "Numéro de certification (BPJEPS / STAPS)",
    "join.submit": "Créer mon profil →",
    "join.already": "Vous avez déjà un compte ?",
    "join.login": "Se connecter",
    // Profile page
    "profile.book": "Réserver une séance",
    "profile.contact": "Contacter",
    "profile.verified": "Coach Certifié",
    "profile.per_session": "par séance",
    "profile.specialities": "Spécialités",
    "profile.about": "À propos",
    "profile.reviews": "Avis",
    "profile.location": "Lieu",
    "profile.training_modes": "Modes d'entraînement",
    // Pricing
    "pricing.title": "Tarifs",
    "pricing.sub": "Un seul abonnement. Tout inclus.",
    "pricing.monthly": "mois",
    "pricing.yearly": "an",
    "pricing.save": "Économisez 20 %",
    "pricing.cta": "Essai gratuit →",
    "pricing.no_cc": "Sans carte bancaire",
    // Footer
    "footer.trainers": "Pour les coachs",
    "footer.clients": "Pour les clients",
    "footer.company": "Entreprise",
    "footer.rights": "Tous droits réservés.",
    "footer.privacy": "Politique de confidentialité",
    "footer.terms": "Conditions d'utilisation",
    // Academy
    "academy.enrol": "S'inscrire",
    "academy.spots_left": "places restantes",
    "academy.full": "Complet",
    "academy.per_term": "par trimestre",
    "academy.coaches": "Équipe d'entraîneurs",
    "academy.programmes": "Programmes",
    "academy.book_trial": "Réserver un essai"
  },
  it: {
    // Nav
    "nav.how_it_works": "Come funziona",
    "nav.income": "Calcolatore guadagni",
    "nav.pricing": "Prezzi",
    "nav.see_profile": "Vedi un profilo",
    "nav.get_os": "Inizia →",
    "nav.find_trainer": "Trova un trainer",
    "nav.login": "Accedi",
    // Landing hero
    "landing.eyebrow": "Il sistema per i Personal Trainer",
    "landing.headline_1": "Tutta la tua attività da PT.",
    "landing.headline_2": "Un solo link.",
    "landing.sub": "Profilo certificato. Piani di allenamento con IA. Gestione clienti. Prenotazioni. Tutto in un posto — pensato per i trainer seri.",
    "landing.guarantee": "Nessuna commissione. Disdici quando vuoi.",
    "landing.cta_primary": "Inizia gratis →",
    "landing.cta_secondary": "Scopri come funziona",
    // Landing sections
    "landing.how_title": "Tutto ciò che ti serve per gestire la tua attività",
    "landing.social_proof": "Scelto da trainer certificati in Italia e in Europa",
    "landing.income_title": "Quanto potresti guadagnare?",
    "landing.income_sub": "Calcola il tuo reddito mensile in base alle sessioni e alla tariffa.",
    "landing.pricing_title": "Prezzi semplici e trasparenti",
    "landing.pricing_sub": "Nessun costo nascosto. Nessuna commissione sulle prenotazioni.",
    // Find page
    "find.title": "Trova un Personal Trainer Certificato",
    "find.sub": "Sfoglia i trainer certificati. Filtra per specialità, luogo e modalità di allenamento.",
    "find.search_placeholder": "Cerca per nome, specialità o città…",
    "find.filter_all": "Tutti",
    "find.filter_online": "Online",
    "find.filter_outdoor": "All'aperto",
    "find.filter_gym": "Palestra",
    "find.filter_home": "A domicilio",
    "find.verified_badge": "Certificato",
    "find.per_session": "a sessione",
    "find.view_profile": "Vedi il profilo",
    "find.no_results": "Nessun trainer trovato. Prova una ricerca diversa.",
    "find.loading": "Caricamento trainer…",
    // Join page
    "join.title": "Unisciti ad AllenatoCon",
    "join.sub": "Crea il tuo profilo da trainer certificato in pochi minuti.",
    "join.name_label": "Nome completo",
    "join.email_label": "Indirizzo email",
    "join.phone_label": "Numero di telefono",
    "join.city_label": "Città",
    "join.speciality_label": "Specialità principale",
    "join.reps_label": "Numero certificazione (EQF / CONI)",
    "join.submit": "Crea il mio profilo →",
    "join.already": "Hai già un account?",
    "join.login": "Accedi",
    // Profile page
    "profile.book": "Prenota una sessione",
    "profile.contact": "Contatta",
    "profile.verified": "Trainer Certificato",
    "profile.per_session": "a sessione",
    "profile.specialities": "Specialità",
    "profile.about": "Chi sono",
    "profile.reviews": "Recensioni",
    "profile.location": "Luogo",
    "profile.training_modes": "Modalità di allenamento",
    // Pricing
    "pricing.title": "Prezzi",
    "pricing.sub": "Un solo piano. Tutto incluso.",
    "pricing.monthly": "mese",
    "pricing.yearly": "anno",
    "pricing.save": "Risparmia il 20%",
    "pricing.cta": "Prova gratuita →",
    "pricing.no_cc": "Senza carta di credito",
    // Footer
    "footer.trainers": "Per i trainer",
    "footer.clients": "Per i clienti",
    "footer.company": "Azienda",
    "footer.rights": "Tutti i diritti riservati.",
    "footer.privacy": "Informativa sulla privacy",
    "footer.terms": "Termini di servizio",
    // Academy
    "academy.enrol": "Iscriviti ora",
    "academy.spots_left": "posti disponibili",
    "academy.full": "Completo",
    "academy.per_term": "a trimestre",
    "academy.coaches": "Staff tecnico",
    "academy.programmes": "Programmi",
    "academy.book_trial": "Prenota una prova"
  },
  es: {
    // Nav
    "nav.how_it_works": "Cómo funciona",
    "nav.income": "Calculadora de ingresos",
    "nav.pricing": "Precios",
    "nav.see_profile": "Ver un perfil",
    "nav.get_os": "Empezar →",
    "nav.find_trainer": "Encontrar un entrenador",
    "nav.login": "Iniciar sesión",
    // Landing hero
    "landing.eyebrow": "El sistema para Entrenadores Personales",
    "landing.headline_1": "Todo tu negocio como entrenador.",
    "landing.headline_2": "Un solo enlace.",
    "landing.sub": "Perfil verificado. Planes de entrenamiento con IA. Gestión de clientes. Reservas. Todo en un lugar — diseñado para entrenadores serios.",
    "landing.guarantee": "Sin comisiones. Cancela cuando quieras.",
    "landing.cta_primary": "Empieza gratis →",
    "landing.cta_secondary": "Ver cómo funciona",
    // Landing sections
    "landing.how_title": "Todo lo que necesitas para gestionar tu negocio",
    "landing.social_proof": "Elegido por entrenadores certificados en España y Latinoamérica",
    "landing.income_title": "¿Cuánto podrías ganar?",
    "landing.income_sub": "Calcula tus ingresos mensuales según tus sesiones y tarifa.",
    "landing.pricing_title": "Precios simples y transparentes",
    "landing.pricing_sub": "Sin cargos ocultos. Sin comisiones en reservas.",
    // Find page
    "find.title": "Encontrar un Entrenador Personal Certificado",
    "find.sub": "Explora entrenadores certificados. Filtra por especialidad, ubicación y modalidad.",
    "find.search_placeholder": "Buscar por nombre, especialidad o ciudad…",
    "find.filter_all": "Todos",
    "find.filter_online": "Online",
    "find.filter_outdoor": "Al aire libre",
    "find.filter_gym": "Gimnasio",
    "find.filter_home": "A domicilio",
    "find.verified_badge": "Verificado",
    "find.per_session": "por sesión",
    "find.view_profile": "Ver perfil",
    "find.no_results": "No se encontraron entrenadores. Prueba otra búsqueda.",
    "find.loading": "Cargando entrenadores…",
    // Join page
    "join.title": "Únete a EntrenaCon",
    "join.sub": "Crea tu perfil de entrenador certificado en minutos.",
    "join.name_label": "Nombre completo",
    "join.email_label": "Correo electrónico",
    "join.phone_label": "Número de teléfono",
    "join.city_label": "Ciudad",
    "join.speciality_label": "Especialidad principal",
    "join.reps_label": "Número de certificación (NSCA / ISSA / CFES)",
    "join.submit": "Crear mi perfil →",
    "join.already": "¿Ya tienes una cuenta?",
    "join.login": "Iniciar sesión",
    // Profile page
    "profile.book": "Reservar una sesión",
    "profile.contact": "Contactar",
    "profile.verified": "Entrenador Verificado",
    "profile.per_session": "por sesión",
    "profile.specialities": "Especialidades",
    "profile.about": "Sobre mí",
    "profile.reviews": "Reseñas",
    "profile.location": "Ubicación",
    "profile.training_modes": "Modalidades de entrenamiento",
    // Pricing
    "pricing.title": "Precios",
    "pricing.sub": "Un solo plan. Todo incluido.",
    "pricing.monthly": "mes",
    "pricing.yearly": "año",
    "pricing.save": "Ahorra un 20%",
    "pricing.cta": "Prueba gratuita →",
    "pricing.no_cc": "Sin tarjeta de crédito",
    // Footer
    "footer.trainers": "Para entrenadores",
    "footer.clients": "Para clientes",
    "footer.company": "Empresa",
    "footer.rights": "Todos los derechos reservados.",
    "footer.privacy": "Política de privacidad",
    "footer.terms": "Términos de servicio",
    // Academy
    "academy.enrol": "Inscribirse ahora",
    "academy.spots_left": "plazas disponibles",
    "academy.full": "Completo",
    "academy.per_term": "por trimestre",
    "academy.coaches": "Cuerpo técnico",
    "academy.programmes": "Programas",
    "academy.book_trial": "Reservar una prueba"
  }
};
const UNDERSCORE_KEYS = {
  en: {
    // Nav
    brand: "TrainedBy",
    nav_find: "Find a Trainer",
    nav_blog: "Stories",
    nav_community: "Community",
    nav_for_trainers: "For Trainers",
    nav_cta_find: "Find Your Trainer →",
    nav_login: "Log in",
    // Hero
    hero_headline: "Find a trainer who actually gets results.",
    hero_sub: "Every trainer is certified and verified. Browse real profiles, read real stories, and book the right person for you.",
    search_btn: "Search",
    search_placeholder: "Search by name, specialty or city…",
    // Filters
    filter_all: "All",
    filter_weight_loss: "Weight Loss",
    filter_strength: "Strength",
    filter_nutrition: "Nutrition",
    filter_running: "Running",
    filter_hiit: "HIIT",
    filter_yoga: "Yoga",
    filter_boxing: "Boxing",
    // Trust strip
    trust_verified: "Verified Trainers",
    trust_profiles: "Real Trainer Profiles",
    trust_reviews: "No Fake Reviews",
    trust_free: "Free to Browse",
    trust_verified_sub: "Every trainer is certified and verified.",
    trust_profiles_sub: "Real photos. Real credentials. No stock images.",
    trust_reviews_sub: "Only clients who booked can leave a review.",
    trust_free_sub: "Browse and contact trainers for free.",
    // Featured trainers section
    featured_eyebrow: "Top trainers near you.",
    featured_title: "Find someone who\nworks as hard as you do.",
    featured_cta: "See all trainers →",
    trainer_verified: "✓ Verified",
    trainer_from: "From",
    trainer_per_session: "/ session",
    trainer_contact: "Contact for pricing",
    // Transformations section
    transform_eyebrow: "Real Results",
    transform_title: "Stories that speak\nfor themselves.",
    transform_stat_weeks: "Weeks",
    transform_stat_lost: "Lost",
    transform_stat_race: "First Race",
    transform_stat_pain: "Pain Days",
    transform_stat_deadlift: "Deadlift",
    transform_story1_title: "From sedentary to running her first 10k in 14 weeks",
    transform_story1_body: "My client came to me post-pregnancy, hadn’t exercised in 3 years. We started with 20-minute walks and built from there. The key was making every session feel achievable — never overwhelming.",
    transform_story2_title: "Corporate burnout to competing in his first obstacle race",
    transform_story2_body: "He was working 70-hour weeks and using food as stress relief. We didn’t talk about diet for the first month — just built the habit of showing up. Everything else followed naturally.",
    transform_story3_title: "Rebuilding strength after a back injury — without surgery",
    transform_story3_body: "Her physio cleared her for light exercise but she was terrified to move. We worked with her physiotherapist from day one. Six months later she’s deadlifting bodyweight and pain-free.",
    // Blog section
    blog_eyebrow: "From the Community",
    blog_title: "Advice from trainers\nwho actually train.",
    blog_cta: "Read all articles →",
    blog_sub: "No sponsored content. No generic listicles. Written by verified trainers from their own practice.",
    blog_cat_science: "Training Science",
    blog_cat_nutrition: "Nutrition",
    blog_cat_mindset: "Mindset",
    blog_post1_title: "Why most people plateau after 3 months — and what actually breaks it",
    blog_post1_excerpt: "The first three months of training are almost always productive. Then something stops working. Here’s the physiology behind the plateau and the four interventions that consistently restart progress.",
    blog_post1_author: "Level 4 Trainer · 6 min read",
    blog_post2_title: "The only meal timing advice that actually matters",
    blog_post2_excerpt: "Forget the 6-meal-a-day myth. Here’s what the research says about when to eat — and why most of it is irrelevant if you’re not getting the basics right first.",
    blog_post2_author: "Nutrition Coach · 4 min read",
    blog_post3_title: "What I tell every new client in the first session",
    blog_post3_excerpt: "After hundreds of first sessions, I’ve learned that the conversation that happens before the first rep is the one that determines everything. Here’s what I say — and why.",
    blog_post3_author: "Strength Coach · 5 min read",
    // Trainer banner
    banner_eyebrow: "For Trainers",
    banner_title: "Build your practice on a platform that works as hard as you do.",
    banner_sub: "Verified profile, digital products, lead management, and an AI assistant — all in one place. Free to start.",
    banner_cta_primary: "See how it works →",
    banner_cta_ghost: "Create your profile",
    // Footer (landing page inline footer)
    footer_find: "Find a Trainer",
    footer_stories: "Stories",
    footer_community: "Community",
    footer_for_trainers: "For Trainers",
    footer_join: "Join as Trainer",
    // Profile / find page dynamic strings
    profile_verified_badge: "✓ Verified",
    profile_from: "From",
    profile_per_session: "/ session",
    profile_contact_pricing: "Contact for pricing",
    // For-trainers page
    for_trainers_eyebrow: "For Personal Trainers",
    for_trainers_title: "Everything you need to run your practice.",
    for_trainers_sub: "One link. Your verified profile, digital products, booking, and client management.",
    for_trainers_cta: "Get started free →",
    for_trainers_login: "Already have an account? Log in",
    // Community page
    community_eyebrow: "Community",
    community_title: "Connect with trainers and clients.",
    community_sub: "Share knowledge, ask questions, and grow your network.",
    community_cta: "Join the community →"
  },
  fr: {
    // Nav
    brand: "CoachéPar",
    nav_find: "Trouver un Coach",
    nav_blog: "Histoires",
    nav_community: "Communauté",
    nav_for_trainers: "Pour les Coachs",
    nav_cta_find: "Trouver votre Coach →",
    nav_login: "Se connecter",
    // Hero
    hero_headline: "Trouvez un coach qui obtient vraiment des résultats.",
    hero_sub: "Chaque coach est certifié et vérifié. Parcourez de vrais profils, lisez de vraies histoires et réservez la bonne personne pour vous.",
    search_btn: "Rechercher",
    search_placeholder: "Rechercher par nom, spécialité ou ville…",
    // Filters
    filter_all: "Tous",
    filter_weight_loss: "Perte de poids",
    filter_strength: "Force",
    filter_nutrition: "Nutrition",
    filter_running: "Course",
    filter_hiit: "HIIT",
    filter_yoga: "Yoga",
    filter_boxing: "Boxe",
    // Trust strip
    trust_verified: "Coachs vérifiés",
    trust_profiles: "Vrais profils de coachs",
    trust_reviews: "Aucun faux avis",
    trust_free: "Gratuit à consulter",
    trust_verified_sub: "Chaque coach est certifié et vérifié.",
    trust_profiles_sub: "Vraies photos. Vraies certifications. Pas de photos de stock.",
    trust_reviews_sub: "Seuls les clients ayant réservé peuvent laisser un avis.",
    trust_free_sub: "Consultez et contactez les coachs gratuitement.",
    // Featured trainers section
    featured_eyebrow: "Les meilleurs coachs près de chez vous.",
    featured_title: "Trouvez quelqu’un qui\ntravaille aussi dur que vous.",
    featured_cta: "Voir tous les coachs →",
    trainer_verified: "✓ Vérifié",
    trainer_from: "À partir de",
    trainer_per_session: "/ séance",
    trainer_contact: "Contacter pour le tarif",
    // Transformations section
    transform_eyebrow: "Résultats réels",
    transform_title: "Des histoires qui parlent\nd’elles-mêmes.",
    transform_stat_weeks: "Semaines",
    transform_stat_lost: "Perdus",
    transform_stat_race: "1ère course",
    transform_stat_pain: "Jours de douleur",
    transform_stat_deadlift: "Soulevement",
    transform_story1_title: "De sédentaire à son premier 10 km en 14 semaines",
    transform_story1_body: "Ma cliente est venue me voir après sa grossesse, sans avoir fait de sport depuis 3 ans. Nous avons commencé par des marches de 20 minutes. La clé était de rendre chaque séance atteignable — jamais écrasante.",
    transform_story2_title: "Du burn-out professionnel à sa première course d’obstacles",
    transform_story2_body: "Il travaillait 70 heures par semaine et utilisait la nourriture comme exutoire. Nous n’avons pas parlé de régime le premier mois — juste construit l’habitude de venir. Tout le reste a suivi naturellement.",
    transform_story3_title: "Retrouver la force après une blessure au dos — sans chirurgie",
    transform_story3_body: "Son kiné l’avait autorisée à faire de l’exercice léger mais elle avait peur de bouger. Six mois plus tard, elle soulève son poids de corps en soulevement et n’a plus de douleur.",
    // Blog section
    blog_eyebrow: "De la communauté",
    blog_title: "Conseils de coachs\nqui s’entraînent vraiment.",
    blog_cta: "Lire tous les articles →",
    blog_sub: "Pas de contenu sponsorisé. Pas de listes génériques. Rédigé par des coachs certifiés issus de leur pratique.",
    blog_cat_science: "Science de l’entraînement",
    blog_cat_nutrition: "Nutrition",
    blog_cat_mindset: "Mental",
    blog_post1_title: "Pourquoi la plupart des gens plafonnent après 3 mois — et ce qui brise vraiment ce plafond",
    blog_post1_excerpt: "Les trois premiers mois d’entraînement sont presque toujours productifs. Puis quelque chose s’arrête. Voici la physiologie derrière le plateau et les quatre interventions qui redémarrent constamment les progrès.",
    blog_post1_author: "Coach Niveau 4 · 6 min de lecture",
    blog_post2_title: "Les seuls conseils sur le timing des repas qui comptent vraiment",
    blog_post2_excerpt: "Oubliez le mythe des 6 repas par jour. Voici ce que la recherche dit sur le moment de manger — et pourquoi la plupart est hors sujet si vous ne maîtrisez pas les bases.",
    blog_post2_author: "Coach en nutrition · 4 min de lecture",
    blog_post3_title: "Ce que je dis à chaque nouveau client lors de la première séance",
    blog_post3_excerpt: "Après des centaines de premières séances, j’ai appris que la conversation avant la première rép est celle qui détermine tout. Voici ce que je dis — et pourquoi.",
    blog_post3_author: "Coach Force · 5 min de lecture",
    // Trainer banner
    banner_eyebrow: "Pour les Coachs",
    banner_title: "Développez votre activité sur une plateforme qui travaille aussi dur que vous.",
    banner_sub: "Profil vérifié, produits numériques, gestion des leads et assistant IA — tout en un. Gratuit pour commencer.",
    banner_cta_primary: "Voir comment ça marche →",
    banner_cta_ghost: "Créer mon profil",
    // Footer
    footer_find: "Trouver un Coach",
    footer_stories: "Histoires",
    footer_community: "Communauté",
    footer_for_trainers: "Pour les Coachs",
    footer_join: "Rejoindre en tant que Coach",
    // Profile / find page dynamic strings
    profile_verified_badge: "✓ Vérifié",
    profile_from: "À partir de",
    profile_per_session: "/ séance",
    profile_contact_pricing: "Contacter pour le tarif",
    // For-trainers page
    for_trainers_eyebrow: "Pour les Coachs Personnels",
    for_trainers_title: "Tout ce dont vous avez besoin pour gérer votre activité.",
    for_trainers_sub: "Un seul lien. Votre profil vérifié, produits numériques, réservation et gestion des clients.",
    for_trainers_cta: "Commencer gratuitement →",
    for_trainers_login: "Déjà un compte ? Se connecter",
    // Community page
    community_eyebrow: "Communauté",
    community_title: "Connectez-vous avec des coachs et des clients.",
    community_sub: "Partagez des connaissances, posez des questions et développez votre réseau.",
    community_cta: "Rejoindre la communauté →"
  },
  it: {
    brand: "AllenatoCon",
    nav_find: "Trova un Allenatore",
    nav_blog: "Storie",
    nav_community: "Comunità",
    nav_for_trainers: "Per gli Allenatori",
    nav_cta_find: "Trova il tuo Allenatore →",
    nav_login: "Accedi",
    // Hero
    hero_headline: "Trova un allenatore che ottiene davvero risultati.",
    hero_sub: "Ogni allenatore è certificato e verificato. Sfoglia profili reali, leggi storie vere e prenota la persona giusta per te.",
    search_btn: "Cerca",
    search_placeholder: "Cerca per nome, specialità o città…",
    // Filters
    filter_all: "Tutti",
    filter_weight_loss: "Perdita di peso",
    filter_strength: "Forza",
    filter_nutrition: "Nutrizione",
    filter_running: "Corsa",
    filter_hiit: "HIIT",
    filter_yoga: "Yoga",
    filter_boxing: "Boxe",
    // Trust strip
    trust_verified: "Allenatori verificati",
    trust_profiles: "Profili reali di allenatori",
    trust_reviews: "Nessuna recensione falsa",
    trust_free: "Gratuito da sfogliare",
    trust_verified_sub: "Ogni allenatore è certificato e verificato.",
    trust_profiles_sub: "Foto reali. Credenziali reali. Niente immagini stock.",
    trust_reviews_sub: "Solo i clienti che hanno prenotato possono lasciare una recensione.",
    trust_free_sub: "Sfoglia e contatta gli allenatori gratuitamente.",
    // Featured trainers section
    featured_eyebrow: "I migliori allenatori vicino a te.",
    featured_title: "Trova qualcuno che\nlavora duro quanto te.",
    featured_cta: "Vedi tutti gli allenatori →",
    trainer_verified: "✓ Verificato",
    trainer_from: "Da",
    trainer_per_session: "/ sessione",
    trainer_contact: "Contatta per il prezzo",
    // Transformations section
    transform_eyebrow: "Risultati reali",
    transform_title: "Storie che parlano\nda sole.",
    transform_stat_weeks: "Settimane",
    transform_stat_lost: "Persi",
    transform_stat_race: "1ª Gara",
    transform_stat_pain: "Giorni di dolore",
    transform_stat_deadlift: "Stacco",
    transform_story1_title: "Da sedentaria a correre il suo primo 10 km in 14 settimane",
    transform_story1_body: "La mia cliente è venuta da me dopo la gravidanza, senza aver fatto sport per 3 anni. Abbiamo iniziato con camminate di 20 minuti. La chiave era rendere ogni sessione raggiungibile — mai schiacciante.",
    transform_story2_title: "Dal burnout lavorativo alla prima gara ad ostacoli",
    transform_story2_body: "Lavorava 70 ore a settimana e usava il cibo come sfogo. Il primo mese non abbiamo parlato di dieta — abbiamo solo costruito l’abitudine di presentarsi. Tutto il resto è venuto naturalmente.",
    transform_story3_title: "Recuperare la forza dopo un infortunio alla schiena — senza chirurgia",
    transform_story3_body: "Il suo fisioterapista l’aveva autorizzata a fare esercizio leggero ma aveva paura di muoversi. Sei mesi dopo solleva il suo peso corporeo in stacco ed è senza dolore.",
    // Blog section
    blog_eyebrow: "Dalla comunità",
    blog_title: "Consigli da allenatori\nche si allenano davvero.",
    blog_cta: "Leggi tutti gli articoli →",
    blog_sub: "Nessun contenuto sponsorizzato. Nessuna lista generica. Scritto da allenatori certificati dalla loro pratica.",
    blog_cat_science: "Scienza dell’allenamento",
    blog_cat_nutrition: "Nutrizione",
    blog_cat_mindset: "Mentalità",
    blog_post1_title: "Perché la maggior parte delle persone si blocca dopo 3 mesi — e cosa lo sblocca davvero",
    blog_post1_excerpt: "I primi tre mesi di allenamento sono quasi sempre produttivi. Poi qualcosa smette di funzionare. Ecco la fisiologia dietro il plateau e i quattro interventi che riavviano costantemente i progressi.",
    blog_post1_author: "Allenatore Livello 4 · 6 min di lettura",
    blog_post2_title: "Gli unici consigli sul timing dei pasti che contano davvero",
    blog_post2_excerpt: "Dimentica il mito dei 6 pasti al giorno. Ecco cosa dice la ricerca su quando mangiare — e perché la maggior parte è irrilevante se non stai facendo bene le basi.",
    blog_post2_author: "Coach Nutrizionale · 4 min di lettura",
    blog_post3_title: "Cosa dico ad ogni nuovo cliente nella prima sessione",
    blog_post3_excerpt: "Dopo centinaia di prime sessioni, ho imparato che la conversazione prima del primo esercizio è quella che determina tutto. Ecco cosa dico — e perché.",
    blog_post3_author: "Coach di Forza · 5 min di lettura",
    // Trainer banner
    banner_eyebrow: "Per gli Allenatori",
    banner_title: "Costruisci la tua attività su una piattaforma che lavora duro quanto te.",
    banner_sub: "Profilo verificato, prodotti digitali, gestione dei lead e assistente IA — tutto in un posto. Gratuito per iniziare.",
    banner_cta_primary: "Scopri come funziona →",
    banner_cta_ghost: "Crea il tuo profilo",
    // Footer
    footer_find: "Trova un Allenatore",
    footer_stories: "Storie",
    footer_community: "Comunità",
    footer_for_trainers: "Per gli Allenatori",
    footer_join: "Unisciti come Allenatore",
    // Profile / find page dynamic strings
    profile_verified_badge: "✓ Verificato",
    profile_from: "Da",
    profile_per_session: "/ sessione",
    profile_contact_pricing: "Contatta per il prezzo",
    // For-trainers page
    for_trainers_eyebrow: "Per i Personal Trainer",
    for_trainers_title: "Tutto ciò di cui hai bisogno per gestire la tua attività.",
    for_trainers_sub: "Un solo link. Il tuo profilo verificato, prodotti digitali, prenotazione e gestione clienti.",
    for_trainers_cta: "Inizia gratuitamente →",
    for_trainers_login: "Hai già un account? Accedi",
    // Community page
    community_eyebrow: "Comunità",
    community_title: "Connettiti con allenatori e clienti.",
    community_sub: "Condividi conoscenze, fai domande e amplia la tua rete.",
    community_cta: "Unisciti alla comunità →"
  },
  es: {
    brand: "EntrenaCon",
    nav_find: "Encontrar un Entrenador",
    nav_blog: "Historias",
    nav_community: "Comunidad",
    nav_for_trainers: "Para Entrenadores",
    nav_cta_find: "Encuentra tu Entrenador →",
    nav_login: "Iniciar sesión",
    // Hero
    hero_headline: "Encuentra un entrenador que realmente obtiene resultados.",
    hero_sub: "Cada entrenador está certificado y verificado. Explora perfiles reales, lee historias reales y reserva a la persona adecuada para ti.",
    search_btn: "Buscar",
    search_placeholder: "Buscar por nombre, especialidad o ciudad…",
    // Filters
    filter_all: "Todos",
    filter_weight_loss: "Pérdida de peso",
    filter_strength: "Fuerza",
    filter_nutrition: "Nutrición",
    filter_running: "Running",
    filter_hiit: "HIIT",
    filter_yoga: "Yoga",
    filter_boxing: "Boxeo",
    // Trust strip
    trust_verified: "Entrenadores verificados",
    trust_profiles: "Perfiles reales de entrenadores",
    trust_reviews: "Sin reseñas falsas",
    trust_free: "Gratis para explorar",
    trust_verified_sub: "Cada entrenador está certificado y verificado.",
    trust_profiles_sub: "Fotos reales. Credenciales reales. Sin imágenes de stock.",
    trust_reviews_sub: "Solo los clientes que reservaron pueden dejar una reseña.",
    trust_free_sub: "Explora y contacta entrenadores de forma gratuita.",
    // Featured trainers section
    featured_eyebrow: "Los mejores entrenadores cerca de ti.",
    featured_title: "Encuentra a alguien que\ntrabaje tan duro como tú.",
    featured_cta: "Ver todos los entrenadores →",
    trainer_verified: "✓ Verificado",
    trainer_from: "Desde",
    trainer_per_session: "/ sesión",
    trainer_contact: "Contactar para precio",
    // Transformations section
    transform_eyebrow: "Resultados reales",
    transform_title: "Historias que hablan\npor sí solas.",
    transform_stat_weeks: "Semanas",
    transform_stat_lost: "Perdidos",
    transform_stat_race: "1ª Carrera",
    transform_stat_pain: "Días de dolor",
    transform_stat_deadlift: "Peso muerto",
    transform_story1_title: "De sedentaria a correr su primer 10 km en 14 semanas",
    transform_story1_body: "Mi clienta vino a mí tras su embarazo, sin haber hecho ejercicio en 3 años. Empezamos con caminatas de 20 minutos. La clave era hacer que cada sesión se sintiera alcanzable — nunca abrumadora.",
    transform_story2_title: "Del agotamiento laboral a competir en su primera carrera de obstáculos",
    transform_story2_body: "Trabajaba 70 horas a la semana y usaba la comida como alivio del estrés. El primer mes no hablamos de dieta — solo construimos el hábito de presentarse. Todo lo demás siguió naturalmente.",
    transform_story3_title: "Recuperar la fuerza tras una lesión de espalda — sin cirugía",
    transform_story3_body: "Su fisioterapeuta le autorizó ejercicio ligero pero tenía miedo de moverse. Seis meses después levanta su peso corporal en peso muerto y está sin dolor.",
    // Blog section
    blog_eyebrow: "De la comunidad",
    blog_title: "Consejos de entrenadores\nque realmente entrenan.",
    blog_cta: "Leer todos los artículos →",
    blog_sub: "Sin contenido patrocinado. Sin listas genéricas. Escrito por entrenadores certificados desde su propia práctica.",
    blog_cat_science: "Ciencia del entrenamiento",
    blog_cat_nutrition: "Nutrición",
    blog_cat_mindset: "Mentalidad",
    blog_post1_title: "Por qué la mayoría de las personas se estanca después de 3 meses — y qué lo rompe de verdad",
    blog_post1_excerpt: "Los primeros tres meses de entrenamiento son casi siempre productivos. Luego algo deja de funcionar. Aquí está la fisiología detrás del estancamiento y las cuatro intervenciones que reinician el progreso.",
    blog_post1_author: "Entrenador Nivel 4 · 6 min de lectura",
    blog_post2_title: "El único consejo sobre el timing de las comidas que realmente importa",
    blog_post2_excerpt: "Olvida el mito de las 6 comidas al día. Aquí está lo que dice la investigación sobre cuándo comer — y por qué la mayoría es irrelevante si no tienes los básicos bien.",
    blog_post2_author: "Coach de Nutrición · 4 min de lectura",
    blog_post3_title: "Lo que le digo a cada nuevo cliente en la primera sesión",
    blog_post3_excerpt: "Tras cientos de primeras sesiones, he aprendido que la conversación antes de la primera repetición es la que determina todo. Aquí está lo que digo — y por qué.",
    blog_post3_author: "Coach de Fuerza · 5 min de lectura",
    // Trainer banner
    banner_eyebrow: "Para Entrenadores",
    banner_title: "Construye tu práctica en una plataforma que trabaja tan duro como tú.",
    banner_sub: "Perfil verificado, productos digitales, gestión de leads y asistente de IA — todo en un lugar. Gratis para empezar.",
    banner_cta_primary: "Ver cómo funciona →",
    banner_cta_ghost: "Crear mi perfil",
    // Footer
    footer_find: "Encontrar un Entrenador",
    footer_stories: "Historias",
    footer_community: "Comunidad",
    footer_for_trainers: "Para Entrenadores",
    footer_join: "Unirse como Entrenador",
    // Profile / find page dynamic strings
    profile_verified_badge: "✓ Verificado",
    profile_from: "Desde",
    profile_per_session: "/ sesión",
    profile_contact_pricing: "Contactar para precio",
    // For-trainers page
    for_trainers_eyebrow: "Para Entrenadores Personales",
    for_trainers_title: "Todo lo que necesitas para gestionar tu práctica.",
    for_trainers_sub: "Un solo enlace. Tu perfil verificado, productos digitales, reservas y gestión de clientes.",
    for_trainers_cta: "Empezar gratis →",
    for_trainers_login: "¿Ya tienes una cuenta? Iniciar sesión",
    // Community page
    community_eyebrow: "Comunidad",
    community_title: "Conectáte con entrenadores y clientes.",
    community_sub: "Comparte conocimiento, haz preguntas y amplia tu red.",
    community_cta: "Unirse a la comunidad →"
  }
};
Object.keys(UNDERSCORE_KEYS).forEach((locale) => {
  Object.assign(TRANSLATIONS[locale], UNDERSCORE_KEYS[locale]);
});
const UNDERSCORE_KEYS_EXPORT = UNDERSCORE_KEYS;

const $$CookieConsent = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$CookieConsent;
  const market = getMarket(Astro2.url.hostname);
  const t = {
    fr: {
      message: "Nous utilisons des cookies essentiels pour faire fonctionner la plateforme et des cookies analytiques (avec votre consentement) pour améliorer nos services.",
      accept: "Accepter tout",
      essential: "Essentiels uniquement",
      manage: "Paramètres des cookies",
      learnMore: "En savoir plus"
    },
    it: {
      message: "Utilizziamo cookie essenziali per il funzionamento della piattaforma e cookie analitici (con il tuo consenso) per migliorare i nostri servizi.",
      accept: "Accetta tutto",
      essential: "Solo essenziali",
      manage: "Impostazioni cookie",
      learnMore: "Scopri di più"
    },
    es: {
      message: "Usamos cookies esenciales para el funcionamiento de la plataforma y cookies analíticas (con su consentimiento) para mejorar nuestros servicios.",
      accept: "Aceptar todo",
      essential: "Solo esenciales",
      manage: "Configuración de cookies",
      learnMore: "Más información"
    }
  }[market.i18nLocale] ?? {
    message: "We use essential cookies to operate the platform and analytics cookies (with your consent) to improve our services.",
    accept: "Accept all",
    essential: "Essential only",
    learnMore: "Learn more"
  };
  return renderTemplate`${maybeRenderHead()}<div id="cookie-banner" style="display:none;" aria-live="polite" role="dialog" aria-label="Cookie consent" data-astro-cid-garwan2p> <div class="cookie-inner" data-astro-cid-garwan2p> <div class="cookie-text" data-astro-cid-garwan2p> <p data-astro-cid-garwan2p>${t.message} <a href="/cookie-policy" data-astro-cid-garwan2p>${t.learnMore}</a>.</p> </div> <div class="cookie-actions" data-astro-cid-garwan2p> <button id="cookie-essential" class="btn-essential" data-astro-cid-garwan2p>${t.essential}</button> <button id="cookie-accept" class="btn-accept" data-astro-cid-garwan2p>${t.accept}</button> </div> </div> </div> ${renderScript($$result, "/home/ubuntu/trainedby2/src/components/CookieConsent.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/ubuntu/trainedby2/src/components/CookieConsent.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Base = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Base;
  const {
    title,
    description,
    ogImage,
    canonical,
    noIndex = false,
    structuredData
  } = Astro2.props;
  const market = getMarket(Astro2.url.hostname);
  const locale = getLocale(Astro2.request);
  const brand = BRAND[locale];
  const i18nStrings = { ...TRANSLATIONS[locale], ...UNDERSCORE_KEYS_EXPORT?.[locale] ?? {} };
  const marketCanonicalBase = canonical ?? `https://${market.domain}${Astro2.url.pathname}`;
  const marketOgLocale = market.locale.replace("-", "_");
  const resolvedDescription = description ?? market.metaDescription;
  const resolvedOgImage = ogImage ?? `https://${market.domain}/og-image.jpg`;
  const resolvedTitle = title;
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: market.brandName ?? "TrainedBy",
    url: `https://${market.domain}`,
    logo: `https://${market.domain}/logo.png`,
    description: market.metaDescription,
    areaServed: market.market.toUpperCase(),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      availableLanguage: market.i18nLocale ?? "en"
    }
  };
  const jsonLd = structuredData ?? defaultStructuredData;
  return renderTemplate(_a || (_a = __template(["<html", ' dir="ltr"', '> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><!-- ── Critical meta ─────────────────────────────────────────────── --><title>', '</title><meta name="description"', '><link rel="canonical"', ">", '<meta name="theme-color" content="#0a0a0a"><meta name="color-scheme" content="dark"><!-- ── PWA Manifest ──────────────────────────────────────────────── --><link rel="manifest" href="/manifest.webmanifest"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title"', '><!-- ── Open Graph / Twitter ──────────────────────────────────────── --><meta property="og:title"', '><meta property="og:description"', '><meta property="og:image"', '><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:url"', '><meta property="og:type" content="website"><meta property="og:site_name"', '><meta property="og:locale"', '><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"', '><meta name="twitter:description"', '><meta name="twitter:image"', '><!-- ── Performance: DNS prefetch & preconnect ────────────────────── --><link rel="dns-prefetch" href="https://fonts.googleapis.com"><link rel="dns-prefetch" href="https://mezhtdbfyvkshpuplqqw.supabase.co"><link rel="dns-prefetch" href="https://cdn.jsdelivr.net"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="preconnect" href="https://mezhtdbfyvkshpuplqqw.supabase.co"><!-- ── Fonts: preload critical weights, then full load ───────────── --><!-- Preload the 700 weight used in headings for fastest LCP --><link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&display=swap"><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"><!-- ── Favicon ───────────────────────────────────────────────────── --><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><!-- ── Structured Data (JSON-LD) ─────────────────────────────────── --><script type="application/ld+json">', "<\/script><!-- ── Global design tokens & critical CSS ───────────────────────── --><!-- ── i18n: locale + brand + translation strings ─────────────────── --><script>", `<\/script><!-- ── Lazy image loading polyfill (inline, tiny) ─────────────────── --><script>
      // Ensure all dynamically inserted images get loading="lazy"
      // This runs before any page JS to catch early renders
      if ('loading' in HTMLImageElement.prototype) {
        document.addEventListener('DOMContentLoaded', () => {
          document.querySelectorAll('img:not([loading])').forEach(img => {
            img.setAttribute('loading', 'lazy');
          });
        });
      }
    <\/script>`, "</head> <body> ", " <!-- ── i18n runtime: translate data-i18n elements ───────────────── --> <script>\n      (function() {\n        var locale = window.__LOCALE__;\n        if (!locale || locale === 'en') return;\n        var strings = window.__I18N__;\n        var brand = window.__BRAND__;\n        if (!strings) return;\n        function translate() {\n          // Text content\n          document.querySelectorAll('[data-i18n]').forEach(function(el) {\n            var key = el.getAttribute('data-i18n');\n            if (strings[key]) el.textContent = strings[key];\n          });\n          // Placeholders\n          document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {\n            var key = el.getAttribute('data-i18n-placeholder');\n            if (strings[key]) el.placeholder = strings[key];\n          });\n          // Brand name\n          if (brand) {\n            document.querySelectorAll('[data-brand-name]').forEach(function(el) {\n              el.textContent = brand.name;\n            });\n            document.querySelectorAll('[data-brand-tagline]').forEach(function(el) {\n              el.textContent = brand.tagline;\n            });\n            // Update page title\n            if (document.title.includes('TrainedBy')) {\n              document.title = document.title.replace(/TrainedBy/g, brand.name);\n            }\n          }\n          // Update html lang\n          document.documentElement.lang = locale;\n        }\n        if (document.readyState === 'loading') {\n          document.addEventListener('DOMContentLoaded', translate);\n        } else {\n          translate();\n        }\n      })();\n    <\/script> <!-- ── Cookie Consent Banner ───────────────────────────────────────── --> ", " <!-- ── Error boundary: catch unhandled errors and log them ─────────── --> <script>\n      window.addEventListener('error', function(e) {\n        // In production, send to monitoring endpoint\n        // For now, log structured error to console\n        const errorData = {\n          message: e.message,\n          filename: e.filename,\n          lineno: e.lineno,\n          colno: e.colno,\n          timestamp: new Date().toISOString(),\n          url: window.location.href,\n          userAgent: navigator.userAgent.substring(0, 100),\n        };\n        console.error('[TrainedBy Error]', errorData);\n        // TODO: POST to /functions/v1/log-error when monitoring is wired\n      });\n\n      window.addEventListener('unhandledrejection', function(e) {\n        console.error('[TrainedBy Unhandled Promise]', {\n          reason: e.reason?.message || String(e.reason),\n          timestamp: new Date().toISOString(),\n          url: window.location.href,\n        });\n      });\n    <\/script> </body> </html>"])), addAttribute(market.locale.split("-")[0], "lang"), addAttribute(market.market, "data-market"), resolvedTitle, addAttribute(resolvedDescription, "content"), addAttribute(marketCanonicalBase, "href"), noIndex && renderTemplate`<meta name="robots" content="noindex,nofollow">`, addAttribute(market.brandName ?? "TrainedBy", "content"), addAttribute(resolvedTitle, "content"), addAttribute(resolvedDescription, "content"), addAttribute(resolvedOgImage, "content"), addAttribute(marketCanonicalBase, "content"), addAttribute(market.brandName ?? "TrainedBy", "content"), addAttribute(marketOgLocale, "content"), addAttribute(resolvedTitle, "content"), addAttribute(resolvedDescription, "content"), addAttribute(resolvedOgImage, "content"), unescapeHTML(JSON.stringify(jsonLd)), unescapeHTML(`
      window.__LOCALE__ = '${locale}';
      window.__BRAND__ = ${JSON.stringify(brand)};
      window.__I18N__ = ${JSON.stringify(i18nStrings)};
    `), renderHead(), renderSlot($$result, $$slots["default"]), renderComponent($$result, "CookieConsent", $$CookieConsent, {}));
}, "/home/ubuntu/trainedby2/src/layouts/Base.astro", void 0);

export { $$Base as $, getMarket as g, renderScript as r };
