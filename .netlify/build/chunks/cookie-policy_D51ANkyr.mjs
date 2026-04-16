import { g as getMarket, $ as $$Base } from './Base_BncrLJgF.mjs';
import { c as createComponent } from './astro-component_rYSPh4RH.mjs';
import { h as renderComponent, r as renderTemplate, m as maybeRenderHead, f as addAttribute } from './ssr-function_C4Nx6pnO.mjs';

const $$CookiePolicy = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$CookiePolicy;
  const market = getMarket(Astro2.url.hostname);
  const brand = market.brandName;
  const domain = market.domain;
  const effectiveDate = "April 15, 2026";
  const contactEmail = `legal@${domain}`;
  const t = {
    fr: { title: "Politique de Cookies", intro: `${brand} utilise des cookies pour faire fonctionner la plateforme et améliorer votre expérience.` },
    it: { title: "Politica sui Cookie", intro: `${brand} utilizza i cookie per far funzionare la piattaforma e migliorare la tua esperienza.` },
    es: { title: "Política de Cookies", intro: `${brand} utiliza cookies para hacer funcionar la plataforma y mejorar tu experiencia.` }
  }[market.i18nLocale] ?? {
    title: "Cookie Policy",
    intro: `${brand} uses cookies to operate the platform and improve your experience.`
  };
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": `${t.title}  -  ${brand}`, "description": t.intro, "canonical": `https://${domain}/cookie-policy`, "data-astro-cid-4qq6gci3": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main style="max-width:760px;margin:0 auto;padding:48px 24px;color:var(--text-1);" data-astro-cid-4qq6gci3> <h1 style="font-size:28px;font-weight:700;margin-bottom:8px;" data-astro-cid-4qq6gci3>${t.title}</h1> <p style="color:var(--text-3);font-size:13px;margin-bottom:40px;" data-astro-cid-4qq6gci3>Effective date: ${effectiveDate}</p> <p style="margin-bottom:24px;" data-astro-cid-4qq6gci3>${t.intro}</p> <h2 data-astro-cid-4qq6gci3>What Are Cookies</h2> <p data-astro-cid-4qq6gci3>Cookies are small text files stored on your device when you visit a website. They allow the website to remember your preferences and session state across page loads.</p> <h2 data-astro-cid-4qq6gci3>Cookies We Use</h2> <table data-astro-cid-4qq6gci3> <thead data-astro-cid-4qq6gci3> <tr data-astro-cid-4qq6gci3><th data-astro-cid-4qq6gci3>Cookie</th><th data-astro-cid-4qq6gci3>Type</th><th data-astro-cid-4qq6gci3>Purpose</th><th data-astro-cid-4qq6gci3>Duration</th></tr> </thead> <tbody data-astro-cid-4qq6gci3> <tr data-astro-cid-4qq6gci3><td data-astro-cid-4qq6gci3><code data-astro-cid-4qq6gci3>tb_session</code></td><td data-astro-cid-4qq6gci3>Essential</td><td data-astro-cid-4qq6gci3>Maintains your login session as a Trainer</td><td data-astro-cid-4qq6gci3>30 days</td></tr> <tr data-astro-cid-4qq6gci3><td data-astro-cid-4qq6gci3><code data-astro-cid-4qq6gci3>tb_cookie_consent</code></td><td data-astro-cid-4qq6gci3>Essential</td><td data-astro-cid-4qq6gci3>Stores your cookie consent preference</td><td data-astro-cid-4qq6gci3>1 year</td></tr> <tr data-astro-cid-4qq6gci3><td data-astro-cid-4qq6gci3><code data-astro-cid-4qq6gci3>_plausible</code></td><td data-astro-cid-4qq6gci3>Analytics (opt-in)</td><td data-astro-cid-4qq6gci3>Anonymous page view analytics  -  no personal data, no cross-site tracking</td><td data-astro-cid-4qq6gci3>Session</td></tr> </tbody> </table> <h2 data-astro-cid-4qq6gci3>Essential Cookies</h2> <p data-astro-cid-4qq6gci3>Essential cookies are required for the platform to function. They cannot be disabled. The <code data-astro-cid-4qq6gci3>tb_session</code> cookie is set only when you log in as a Trainer and is deleted when you log out or after 30 days of inactivity.</p> <h2 data-astro-cid-4qq6gci3>Analytics Cookies</h2> <p data-astro-cid-4qq6gci3>We use Plausible Analytics, a privacy-first analytics tool that does not use cookies by default and does not track individuals across sites. If you accept analytics cookies, a session cookie is set to count unique visits. No personal data is collected or shared with third parties for advertising purposes.</p> <h2 data-astro-cid-4qq6gci3>Managing Your Preferences</h2> <p data-astro-cid-4qq6gci3>You can change your cookie preferences at any time by clicking the "Cookie Settings" link in the footer, or by clearing your browser cookies. Refusing analytics cookies does not affect your ability to use the platform.</p> <h2 data-astro-cid-4qq6gci3>Contact</h2> <p data-astro-cid-4qq6gci3>For questions about our use of cookies, contact <a${addAttribute(`mailto:${contactEmail}`, "href")} data-astro-cid-4qq6gci3>${contactEmail}</a>.</p> </main> ` })}`;
}, "/home/ubuntu/trainedby2/src/pages/cookie-policy.astro", void 0);

const $$file = "/home/ubuntu/trainedby2/src/pages/cookie-policy.astro";
const $$url = "/cookie-policy";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$CookiePolicy,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
