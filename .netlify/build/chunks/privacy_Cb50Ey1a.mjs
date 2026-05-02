/* empty css               */
import { c as createComponent } from './astro-component_DS3eNzrN.mjs';
import { h as renderComponent, r as renderTemplate, m as maybeRenderHead, f as addAttribute } from './ssr-function_BCqmIxwe.mjs';
import { $ as $$Base } from './Base_DyQz6xRU.mjs';
import { g as getMarket } from './market_CDU5Sp-0.mjs';

const $$Privacy = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Privacy;
  const market = getMarket(Astro2.url.hostname);
  const brand = market.brandName ?? "TrainedBy";
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
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": `${t.title} - ${brand}`, "description": t.intro, "canonical": `https://${domain}/privacy`, "data-astro-cid-fb3qbcs3": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main style="max-width:760px;margin:0 auto;padding:48px 24px;color:var(--text-1);" data-astro-cid-fb3qbcs3> <h1 style="font-size:28px;font-weight:700;margin-bottom:8px;" data-astro-cid-fb3qbcs3>${t.title}</h1> <p style="color:var(--text-3);font-size:13px;margin-bottom:40px;" data-astro-cid-fb3qbcs3>Effective date: ${effectiveDate}</p> <p style="margin-bottom:24px;" data-astro-cid-fb3qbcs3>${t.intro}</p> <h2 data-astro-cid-fb3qbcs3>1. Who We Are</h2> <p data-astro-cid-fb3qbcs3>${brand} is operated by ${brand} Inc., a Delaware LLC. Our platform connects certified fitness professionals with clients seeking personal training services. References to "we", "us", or "our" refer to ${brand} Inc.</p> <h2 data-astro-cid-fb3qbcs3>2. Data We Collect</h2> <p data-astro-cid-fb3qbcs3>We collect the following categories of personal data:</p> <ul data-astro-cid-fb3qbcs3> <li data-astro-cid-fb3qbcs3><strong data-astro-cid-fb3qbcs3>Trainer data:</strong> name, email address, phone number, certification number, city, profile photo, Instagram handle, and billing information (processed by Stripe — we do not store card numbers).</li> <li data-astro-cid-fb3qbcs3><strong data-astro-cid-fb3qbcs3>Consumer (lead) data:</strong> name, email address, phone number, and fitness goals submitted via trainer profile contact forms and reviews.</li> <li data-astro-cid-fb3qbcs3><strong data-astro-cid-fb3qbcs3>Usage data:</strong> pages visited, browser type, IP address, device type, and error events, collected via server logs and error monitoring tools.</li> </ul> <h2 data-astro-cid-fb3qbcs3>3. How We Use Your Data</h2> <p data-astro-cid-fb3qbcs3>We use your data to operate the platform, verify trainer certifications, process payments, send transactional emails (welcome, lead notifications, billing receipts), monitor platform errors, and improve the service. We do not sell your personal data to third parties.</p> <h2 data-astro-cid-fb3qbcs3>4. Data Sharing</h2> <p data-astro-cid-fb3qbcs3>We share data only with trusted service providers necessary to operate the platform:</p> <ul data-astro-cid-fb3qbcs3> <li data-astro-cid-fb3qbcs3><strong data-astro-cid-fb3qbcs3>Supabase</strong> — database hosting and authentication</li> <li data-astro-cid-fb3qbcs3><strong data-astro-cid-fb3qbcs3>Stripe</strong> — payment processing and subscription billing</li> <li data-astro-cid-fb3qbcs3><strong data-astro-cid-fb3qbcs3>Resend</strong> — transactional email delivery</li> <li data-astro-cid-fb3qbcs3><strong data-astro-cid-fb3qbcs3>Sentry</strong> — performance monitoring and error tracking (collects anonymised stack traces and browser metadata; no payment data is sent)</li> </ul> <p data-astro-cid-fb3qbcs3>All processors are bound by data processing agreements. We do not share your data for advertising purposes.</p> <h2 data-astro-cid-fb3qbcs3>5. Data Retention</h2> <p data-astro-cid-fb3qbcs3>Trainer account data is retained for as long as the account is active, plus 90 days after account deletion to allow for recovery. Consumer lead data submitted via trainer profile forms is retained for 12 months unless deleted earlier by the trainer. Payment and billing records are retained for 7 years as required by applicable law.</p> ${isGDPR && renderTemplate`<div data-astro-cid-fb3qbcs3> <h2 data-astro-cid-fb3qbcs3>6. Your Rights Under UK/EU GDPR</h2> <p data-astro-cid-fb3qbcs3>If you are located in the United Kingdom or the European Economic Area, you have the right to access, correct, delete, restrict, or port your personal data. You also have the right to object to processing and to withdraw consent at any time. To exercise these rights, contact us at <a${addAttribute(`mailto:${contactEmail}`, "href")} data-astro-cid-fb3qbcs3>${contactEmail}</a>. You also have the right to lodge a complaint with your local supervisory authority (e.g., the ICO in the UK).</p> <h2 data-astro-cid-fb3qbcs3>7. Legal Basis for Processing</h2> <p data-astro-cid-fb3qbcs3>We process your data on the following legal bases: performance of a contract (to provide the platform service), legitimate interests (to improve the platform and prevent fraud), and consent (for marketing communications, which you may withdraw at any time).</p> <h2 data-astro-cid-fb3qbcs3>8. International Transfers</h2> <p data-astro-cid-fb3qbcs3>Your data is stored on Supabase infrastructure. Where data is transferred outside the EEA (for example, to Stripe's US servers), we ensure appropriate safeguards are in place, including Standard Contractual Clauses.</p> </div>`} ${isCCPA && renderTemplate`<div data-astro-cid-fb3qbcs3> <h2 data-astro-cid-fb3qbcs3>${isGDPR ? "9" : "6"}. California Privacy Rights (CCPA/CPRA)</h2> <p data-astro-cid-fb3qbcs3>If you are a California resident, you have the right to:</p> <ul data-astro-cid-fb3qbcs3> <li data-astro-cid-fb3qbcs3>Know what personal information we collect and how it is used</li> <li data-astro-cid-fb3qbcs3>Request deletion of your personal information</li> <li data-astro-cid-fb3qbcs3>Opt out of the sale of personal information (we do not sell personal information)</li> <li data-astro-cid-fb3qbcs3>Non-discrimination for exercising your rights</li> </ul> <p data-astro-cid-fb3qbcs3>To submit a deletion or access request, email <a${addAttribute(`mailto:${contactEmail}`, "href")} data-astro-cid-fb3qbcs3>${contactEmail}</a> with the subject line "CCPA Request". We will respond within 45 days. You may also designate an authorised agent to submit a request on your behalf.</p> </div>`} ${isUAE && renderTemplate`<div data-astro-cid-fb3qbcs3> <h2 data-astro-cid-fb3qbcs3>6. UAE Personal Data Protection Law (PDPL)</h2> <p data-astro-cid-fb3qbcs3>We comply with the UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data (PDPL). You have the right to access your personal data, request correction of inaccurate data, and request deletion of your personal data where it is no longer necessary for the purpose for which it was collected.</p> <p data-astro-cid-fb3qbcs3>To exercise these rights, email <a${addAttribute(`mailto:${contactEmail}`, "href")} data-astro-cid-fb3qbcs3>${contactEmail}</a> with the subject line "PDPL Request". We will respond within 30 days as required by PDPL Article 14.</p> </div>`} <h2 data-astro-cid-fb3qbcs3>${isGDPR && isCCPA ? "10" : isGDPR || isCCPA || isUAE ? "7" : "6"}. Cookies</h2> <p data-astro-cid-fb3qbcs3>We use essential cookies to maintain your login session and store your cookie consent preference. We use performance cookies (with your consent) to monitor platform errors and understand how the platform is used. You can manage your cookie preferences at any time via the cookie banner or by visiting our <a href="/cookie-policy" data-astro-cid-fb3qbcs3>Cookie Policy</a>.</p> <h2 data-astro-cid-fb3qbcs3>Contact</h2> <p data-astro-cid-fb3qbcs3>${t.contact} <a${addAttribute(`mailto:${contactEmail}`, "href")} data-astro-cid-fb3qbcs3>${contactEmail}</a>.</p> <p style="margin-top:8px;" data-astro-cid-fb3qbcs3>${brand} Inc., 2093 Philadelphia Pike #5888, Claymont, DE 19703, USA.</p> </main> ` })}`;
}, "/Users/bobanpepic/trainedby/src/pages/privacy.astro", void 0);

const $$file = "/Users/bobanpepic/trainedby/src/pages/privacy.astro";
const $$url = "/privacy";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Privacy,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
