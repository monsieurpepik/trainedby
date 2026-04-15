import { c as createComponent } from './astro-component_BvaTlKiI.mjs';
import { k as createRenderInstruction, m as maybeRenderHead, r as renderTemplate, h as renderComponent, l as renderSlot, n as renderHead, u as unescapeHTML, f as addAttribute } from './ssr-function_Dvw9vuPO.mjs';

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
  const i18nStrings = TRANSLATIONS[locale];
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
