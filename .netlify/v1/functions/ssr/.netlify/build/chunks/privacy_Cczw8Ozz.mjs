import { g as getMarket, $ as $$Base } from './Base_FjIho6vc.mjs';
import { c as createComponent } from './astro-component_B9z2_ibQ.mjs';
import { h as renderComponent, r as renderTemplate, m as maybeRenderHead, f as addAttribute } from './ssr-function__udbY6MT.mjs';

const $$Privacy = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Privacy;
  const market = getMarket(Astro2.url.hostname);
  const brand = market.brandName;
  const domain = market.domain;
  const isGDPR = ["uk", "fr", "it", "es", "mx"].includes(market.market);
  const isUAE = market.market === "ae";
  const isCCPA = ["com", "uk"].includes(market.market);
  const effectiveDate = "April 15, 2026";
  const contactEmail = `legal@${domain}`;
  const t = {
    fr: {
      title: "Politique de Confidentialité",
      intro: `Cette Politique de Confidentialité décrit comment ${brand} collecte, utilise et protège vos données personnelles.`,
      contact: "Pour toute question relative à vos données personnelles, contactez-nous à"
    },
    it: {
      title: "Informativa sulla Privacy",
      intro: `Questa Informativa sulla Privacy descrive come ${brand} raccoglie, utilizza e protegge i tuoi dati personali.`,
      contact: "Per qualsiasi domanda relativa ai tuoi dati personali, contattaci a"
    },
    es: {
      title: "Política de Privacidad",
      intro: `Esta Política de Privacidad describe cómo ${brand} recopila, usa y protege sus datos personales.`,
      contact: "Para cualquier consulta sobre sus datos personales, contáctenos en"
    }
  }[market.i18nLocale] ?? {
    title: "Privacy Policy",
    intro: `This Privacy Policy describes how ${brand} collects, uses, and protects your personal data.`,
    contact: "For any questions about your personal data, contact us at"
  };
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": `${t.title}  -  ${brand}`, "description": t.intro, "canonical": `https://${domain}/privacy`, "data-astro-cid-fb3qbcs3": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main style="max-width:760px;margin:0 auto;padding:48px 24px;color:var(--text-1);" data-astro-cid-fb3qbcs3> <h1 style="font-size:28px;font-weight:700;margin-bottom:8px;" data-astro-cid-fb3qbcs3>${t.title}</h1> <p style="color:var(--text-3);font-size:13px;margin-bottom:40px;" data-astro-cid-fb3qbcs3>Effective date: ${effectiveDate}</p> <p style="margin-bottom:24px;" data-astro-cid-fb3qbcs3>${t.intro}</p> <h2 data-astro-cid-fb3qbcs3>1. Who We Are</h2> <p data-astro-cid-fb3qbcs3>${brand} is operated by ${brandName} Inc., a Delaware LLC. Our platform connects certified fitness professionals with clients seeking personal training services. References to "we", "us", or "our" refer to ${brandName} Inc.</p> <h2 data-astro-cid-fb3qbcs3>2. Data We Collect</h2> <p data-astro-cid-fb3qbcs3>We collect the following categories of personal data:</p> <ul data-astro-cid-fb3qbcs3> <li data-astro-cid-fb3qbcs3><strong data-astro-cid-fb3qbcs3>Trainer data:</strong> name, email address, phone number, certification number, city, profile photo, Instagram handle, and billing information.</li> <li data-astro-cid-fb3qbcs3><strong data-astro-cid-fb3qbcs3>Consumer (lead) data:</strong> name, email address, phone number, and fitness goals submitted via trainer profile contact forms.</li> <li data-astro-cid-fb3qbcs3><strong data-astro-cid-fb3qbcs3>Usage data:</strong> pages visited, browser type, IP address, and device type, collected via server logs and analytics tools.</li> </ul> <h2 data-astro-cid-fb3qbcs3>3. How We Use Your Data</h2> <p data-astro-cid-fb3qbcs3>We use your data to operate the platform, verify trainer certifications, process payments, send transactional emails (welcome, lead notifications, billing receipts), and improve the service. We do not sell your personal data to third parties.</p> <h2 data-astro-cid-fb3qbcs3>4. Data Sharing</h2> <p data-astro-cid-fb3qbcs3>We share data only with trusted service providers necessary to operate the platform: Supabase (database and authentication), Stripe (payment processing), Resend (transactional email), and Sentry (error monitoring). All processors are bound by data processing agreements.</p> ${isGDPR && renderTemplate`<div data-astro-cid-fb3qbcs3> <h2 data-astro-cid-fb3qbcs3>5. Your Rights Under UK/EU GDPR</h2> <p data-astro-cid-fb3qbcs3>If you are located in the UK or European Economic Area, you have the right to access, correct, delete, restrict, or port your personal data. You also have the right to object to processing and to withdraw consent at any time. To exercise these rights, contact us at <a${addAttribute(`mailto:${contactEmail}`, "href")} data-astro-cid-fb3qbcs3>${contactEmail}</a>. You also have the right to lodge a complaint with your local supervisory authority (e.g., the ICO in the UK).</p> <h2 data-astro-cid-fb3qbcs3>6. Legal Basis for Processing</h2> <p data-astro-cid-fb3qbcs3>We process your data on the following legal bases: performance of a contract (to provide the platform service), legitimate interests (to improve the platform and prevent fraud), and consent (for marketing communications, which you may withdraw at any time).</p> <h2 data-astro-cid-fb3qbcs3>7. Data Retention</h2> <p data-astro-cid-fb3qbcs3>We retain trainer account data for as long as the account is active, plus 90 days after deletion. Lead data is retained for 12 months unless deleted earlier by the trainer. Payment records are retained for 7 years as required by law.</p> <h2 data-astro-cid-fb3qbcs3>8. International Transfers</h2> <p data-astro-cid-fb3qbcs3>Your data is stored on Supabase infrastructure hosted in the EU. Where data is transferred outside the EEA (e.g., to Stripe's US servers), we ensure appropriate safeguards are in place, including Standard Contractual Clauses.</p> </div>`} ${isCCPA && renderTemplate`<div data-astro-cid-fb3qbcs3> <h2 data-astro-cid-fb3qbcs3>${isGDPR ? "9" : "5"}. California Privacy Rights (CCPA/CPRA)</h2> <p data-astro-cid-fb3qbcs3>If you are a California resident, you have the right to know what personal information we collect, to delete your personal information, to opt out of the sale of personal information (we do not sell personal information), and to non-discrimination for exercising your rights. To submit a request, contact us at <a${addAttribute(`mailto:${contactEmail}`, "href")} data-astro-cid-fb3qbcs3>${contactEmail}</a>.</p> </div>`} ${isUAE && renderTemplate`<div data-astro-cid-fb3qbcs3> <h2 data-astro-cid-fb3qbcs3>5. UAE Personal Data Protection Law (PDPL)</h2> <p data-astro-cid-fb3qbcs3>We comply with the UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection. You have the right to access, correct, and request deletion of your personal data. To exercise these rights, contact us at <a${addAttribute(`mailto:${contactEmail}`, "href")} data-astro-cid-fb3qbcs3>${contactEmail}</a>.</p> </div>`} <h2 data-astro-cid-fb3qbcs3>${isGDPR && isCCPA ? "10" : isGDPR || isCCPA || isUAE ? "6" : "5"}. Cookies</h2> <p data-astro-cid-fb3qbcs3>We use essential cookies to maintain your login session. We use analytics cookies (with your consent) to understand how the platform is used. You can manage your cookie preferences at any time via the cookie banner or by contacting us.</p> <h2 data-astro-cid-fb3qbcs3>Contact</h2> <p data-astro-cid-fb3qbcs3>${t.contact} <a${addAttribute(`mailto:${contactEmail}`, "href")} data-astro-cid-fb3qbcs3>${contactEmail}</a>.</p> <p style="margin-top:8px;" data-astro-cid-fb3qbcs3>${brandName} Inc., 2093 Philadelphia Pike #5888, Claymont, DE 19703, USA.</p> </main> ` })}`;
}, "/home/ubuntu/trainedby2/src/pages/privacy.astro", void 0);

const $$file = "/home/ubuntu/trainedby2/src/pages/privacy.astro";
const $$url = "/privacy";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Privacy,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
