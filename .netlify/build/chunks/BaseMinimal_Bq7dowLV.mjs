import { c as createComponent } from './astro-component_akO4VGQX.mjs';
import { f as addAttribute, r as renderTemplate, m as maybeRenderHead, h as renderComponent, l as renderSlot, n as renderHead } from './ssr-function_COMFhlhs.mjs';
import { g as getMarket } from './market_BDx7-ntv.mjs';
import { r as renderScript } from './script_B7Px0gfL.mjs';

const $$ClientRouter = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$ClientRouter;
  const { fallback = "animate" } = Astro2.props;
  return renderTemplate`<meta name="astro-view-transitions-enabled" content="true"><meta name="astro-view-transitions-fallback"${addAttribute(fallback, "content")}>${renderScript($$result, "/Users/bobanpepic/trainedby/node_modules/.pnpm/astro@6.1.6_@netlify+blobs@10.7.4_@types+node@24.12.2_jiti@1.21.7_rollup@4.60.1_typescript@6.0.3_yaml@2.8.3/node_modules/astro/components/ClientRouter.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/bobanpepic/trainedby/node_modules/.pnpm/astro@6.1.6_@netlify+blobs@10.7.4_@types+node@24.12.2_jiti@1.21.7_rollup@4.60.1_typescript@6.0.3_yaml@2.8.3/node_modules/astro/components/ClientRouter.astro", void 0);

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
  return renderTemplate`${maybeRenderHead()}<div id="cookie-banner" style="display:none;" aria-live="polite" role="dialog" aria-label="Cookie consent" data-astro-cid-garwan2p> <div class="cookie-inner" data-astro-cid-garwan2p> <div class="cookie-text" data-astro-cid-garwan2p> <p data-astro-cid-garwan2p>${t.message} <a href="/cookie-policy" data-astro-cid-garwan2p>${t.learnMore}</a>.</p> </div> <div class="cookie-actions" data-astro-cid-garwan2p> <button id="cookie-essential" class="btn-essential" data-astro-cid-garwan2p>${t.essential}</button> <button id="cookie-accept" class="btn-accept" data-astro-cid-garwan2p>${t.accept}</button> </div> </div> </div> ${renderScript($$result, "/Users/bobanpepic/trainedby/src/components/CookieConsent.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/bobanpepic/trainedby/src/components/CookieConsent.astro", void 0);

const $$BaseMinimal = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$BaseMinimal;
  const {
    title,
    description,
    ogImage,
    canonical,
    noIndex = false
  } = Astro2.props;
  const market = getMarket(Astro2.url.hostname);
  const marketCanonicalBase = canonical ?? `https://${market.domain}${Astro2.url.pathname}`;
  const marketOgLocale = market.locale.replace("-", "_");
  const resolvedDescription = description ?? market.metaDescription;
  const resolvedOgImage = ogImage ?? `https://${market.domain}/og-image.jpg`;
  return renderTemplate`<html${addAttribute(market.locale.split("-")[0], "lang")} dir="ltr"${addAttribute(market.market, "data-market")}> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><title>${title}</title><meta name="description"${addAttribute(resolvedDescription, "content")}><link rel="canonical"${addAttribute(marketCanonicalBase, "href")}>${noIndex && renderTemplate`<meta name="robots" content="noindex,nofollow">`}<meta name="theme-color" content="#FFFFFF"><meta name="color-scheme" content="light"><meta property="og:title"${addAttribute(title, "content")}><meta property="og:description"${addAttribute(resolvedDescription, "content")}><meta property="og:image"${addAttribute(resolvedOgImage, "content")}><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:url"${addAttribute(marketCanonicalBase, "content")}><meta property="og:type" content="website"><meta property="og:site_name"${addAttribute(market.brandName ?? "TrainedBy", "content")}><meta property="og:locale"${addAttribute(marketOgLocale, "content")}><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"${addAttribute(title, "content")}><meta name="twitter:description"${addAttribute(resolvedDescription, "content")}><meta name="twitter:image"${addAttribute(resolvedOgImage, "content")}><link rel="dns-prefetch" href="https://fonts.googleapis.com"><link rel="dns-prefetch" href="https://mezhtdbfyvkshpuplqqw.supabase.co"><link rel="dns-prefetch" href="https://cdn.jsdelivr.net"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="preconnect" href="https://mezhtdbfyvkshpuplqqw.supabase.co"><link rel="preload" as="style" crossorigin href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,200;0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap"><link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,200;0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap" rel="stylesheet"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="apple-touch-icon" href="/apple-touch-icon.png">${renderComponent($$result, "ClientRouter", $$ClientRouter, { "fallback": "none" })}<!-- Light theme tokens (BaseMinimal pages are always light) --><!-- Per-page head overrides -->${renderSlot($$result, $$slots["head"])}${renderHead()}</head> <body> ${renderSlot($$result, $$slots["default"])} ${renderComponent($$result, "CookieConsent", $$CookieConsent, {})} </body></html>`;
}, "/Users/bobanpepic/trainedby/src/layouts/BaseMinimal.astro", void 0);

export { $$BaseMinimal as $ };
