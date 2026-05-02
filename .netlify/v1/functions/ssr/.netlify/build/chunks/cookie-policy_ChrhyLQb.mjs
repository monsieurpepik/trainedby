/* empty css               */
import { c as createComponent } from './astro-component_w8h7bBB0.mjs';
import { h as renderComponent, r as renderTemplate, m as maybeRenderHead, f as addAttribute } from './ssr-function_CLQsF_mO.mjs';
import { $ as $$Base } from './Base_i0jskCET.mjs';
import { g as getMarket } from './market_dK7R5WHH.mjs';

const $$CookiePolicy = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$CookiePolicy;
  const market = getMarket(Astro2.url.hostname);
  const brand = market.brandName ?? "TrainedBy";
  const domain = market.domain;
  const effectiveDate = "April 15, 2026";
  const contactEmail = `legal@${domain}`;
  const t = {
    fr: { title: "Politique de Cookies", intro: `${brand} utilise des cookies pour faire fonctionner la plateforme et améliorer votre expérience.` },
    it: { title: "Politica sui Cookie", intro: `${brand} utilizza i cookie per far funzionare la piattaforma e migliorare la tua esperienza.` },
    es: { title: "Política de Cookies", intro: `${brand} utiliza cookies para hacer funcionar la plataforma y mejorar tu experiencia.` }
  }[market.i18nLocale] ?? {
    title: "Cookie Policy",
    intro: `${brand} uses cookies and local storage to operate the platform and, with your consent, to monitor performance.`
  };
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": `${t.title} - ${brand}`, "description": t.intro, "canonical": `https://${domain}/cookie-policy`, "data-astro-cid-4qq6gci3": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main style="max-width:760px;margin:0 auto;padding:48px 24px;color:var(--text-1);" data-astro-cid-4qq6gci3> <h1 style="font-size:28px;font-weight:700;margin-bottom:8px;" data-astro-cid-4qq6gci3>${t.title}</h1> <p style="color:var(--text-3);font-size:13px;margin-bottom:40px;" data-astro-cid-4qq6gci3>Effective date: ${effectiveDate}</p> <p style="margin-bottom:24px;" data-astro-cid-4qq6gci3>${t.intro}</p> <h2 data-astro-cid-4qq6gci3>What Are Cookies</h2> <p data-astro-cid-4qq6gci3>Cookies are small text files stored on your device when you visit a website. They allow the website to remember your preferences and session state across page loads. Some of the storage described below uses browser <code data-astro-cid-4qq6gci3>localStorage</code> rather than cookies — it behaves similarly and is subject to the same consent rules.</p> <h2 data-astro-cid-4qq6gci3>Storage We Use</h2> <table data-astro-cid-4qq6gci3> <thead data-astro-cid-4qq6gci3> <tr data-astro-cid-4qq6gci3><th data-astro-cid-4qq6gci3>Name</th><th data-astro-cid-4qq6gci3>Type</th><th data-astro-cid-4qq6gci3>Purpose</th><th data-astro-cid-4qq6gci3>Duration</th></tr> </thead> <tbody data-astro-cid-4qq6gci3> <tr data-astro-cid-4qq6gci3> <td data-astro-cid-4qq6gci3><code data-astro-cid-4qq6gci3>sb-access-token</code><br data-astro-cid-4qq6gci3><code data-astro-cid-4qq6gci3>sb-refresh-token</code></td> <td data-astro-cid-4qq6gci3>Essential (cookie)</td> <td data-astro-cid-4qq6gci3>Maintains your authenticated session as a Trainer. Set by Supabase Auth when you log in. Deleted on logout.</td> <td data-astro-cid-4qq6gci3>1 hour (access) / 7 days (refresh)</td> </tr> <tr data-astro-cid-4qq6gci3> <td data-astro-cid-4qq6gci3><code data-astro-cid-4qq6gci3>tb_cookie_consent</code></td> <td data-astro-cid-4qq6gci3>Essential (localStorage + cookie)</td> <td data-astro-cid-4qq6gci3>Stores your cookie consent preference so the banner does not reappear on subsequent visits.</td> <td data-astro-cid-4qq6gci3>1 year</td> </tr> <tr data-astro-cid-4qq6gci3> <td data-astro-cid-4qq6gci3><code data-astro-cid-4qq6gci3>_sentry_session</code><br data-astro-cid-4qq6gci3><code data-astro-cid-4qq6gci3>_sentry_release</code></td> <td data-astro-cid-4qq6gci3>Performance (opt-in)</td> <td data-astro-cid-4qq6gci3>Used by Sentry to monitor platform errors and performance. Collects anonymised stack traces and browser metadata. No personal data is included. Set only if you accept performance cookies.</td> <td data-astro-cid-4qq6gci3>Session / 1 year</td> </tr> </tbody> </table> <h2 data-astro-cid-4qq6gci3>Essential Storage</h2> <p data-astro-cid-4qq6gci3>Essential cookies and localStorage entries are required for the platform to function correctly. The Supabase session cookies are only set when you log in as a Trainer. The consent preference entry is set the first time you interact with the cookie banner. These cannot be disabled without logging out or clearing your browser data.</p> <h2 data-astro-cid-4qq6gci3>Performance Cookies</h2> <p data-astro-cid-4qq6gci3>We use Sentry for error monitoring and performance tracking. Sentry does not collect personal data and does not share data with advertisers. Performance cookies are only set if you click "Accept all" on the cookie banner. If you choose "Essential only", no performance cookies are set.</p> <h2 data-astro-cid-4qq6gci3>Managing Your Preferences</h2> <p data-astro-cid-4qq6gci3>You can change your cookie preferences at any time by clearing your browser cookies and localStorage for this site. Refusing performance cookies does not affect your ability to use the platform. The cookie banner will reappear the next time you visit after clearing your preferences.</p> <h2 data-astro-cid-4qq6gci3>Contact</h2> <p data-astro-cid-4qq6gci3>For questions about our use of cookies, contact <a${addAttribute(`mailto:${contactEmail}`, "href")} data-astro-cid-4qq6gci3>${contactEmail}</a>.</p> </main> ` })}`;
}, "/Users/bobanpepic/trainedby/src/pages/cookie-policy.astro", void 0);

const $$file = "/Users/bobanpepic/trainedby/src/pages/cookie-policy.astro";
const $$url = "/cookie-policy";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$CookiePolicy,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
