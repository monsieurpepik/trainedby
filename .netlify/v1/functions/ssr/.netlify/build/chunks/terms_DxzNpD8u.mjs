import { g as getMarket, $ as $$Base } from './Base_glshNjsF.mjs';
import { c as createComponent } from './astro-component_QCe02764.mjs';
import { h as renderComponent, r as renderTemplate, m as maybeRenderHead, f as addAttribute } from './ssr-function_qCRG1Hg9.mjs';

const $$Terms = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Terms;
  const market = getMarket(Astro2.url.hostname);
  const brand = market.brandName;
  const domain = market.domain;
  const effectiveDate = "April 15, 2026";
  const contactEmail = `legal@${domain}`;
  const isGDPR = ["uk", "fr", "it", "es", "mx"].includes(market.market);
  const t = {
    fr: {
      title: "Conditions Générales d'Utilisation",
      intro: `Bienvenue sur ${brand}. En utilisant notre plateforme, vous acceptez les présentes conditions.`
    },
    it: {
      title: "Termini di Servizio",
      intro: `Benvenuto su ${brand}. Utilizzando la nostra piattaforma, accetti i presenti termini.`
    },
    es: {
      title: "Términos de Servicio",
      intro: `Bienvenido a ${brand}. Al utilizar nuestra plataforma, acepta estos términos.`
    }
  }[market.i18nLocale] ?? {
    title: "Terms of Service",
    intro: `Welcome to ${brand}. By using our platform, you agree to these terms.`
  };
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": `${t.title} — ${brand}`, "description": t.intro, "canonical": `https://${domain}/terms`, "data-astro-cid-y5py4vqc": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main style="max-width:760px;margin:0 auto;padding:48px 24px;color:var(--text-1);" data-astro-cid-y5py4vqc> <h1 style="font-size:28px;font-weight:700;margin-bottom:8px;" data-astro-cid-y5py4vqc>${t.title}</h1> <p style="color:var(--text-3);font-size:13px;margin-bottom:40px;" data-astro-cid-y5py4vqc>Effective date: ${effectiveDate}</p> <p style="margin-bottom:24px;" data-astro-cid-y5py4vqc>${t.intro}</p> <h2 data-astro-cid-y5py4vqc>1. About ${brand}</h2> <p data-astro-cid-y5py4vqc>${brand} is a software platform operated by ${brandName} Inc. (a Delaware LLC) that enables certified fitness professionals ("Trainers") to create verified public profiles and receive client enquiries. We are a technology provider, not a fitness service provider. We do not employ Trainers, and we are not responsible for the quality, safety, or legality of any fitness services delivered by Trainers.</p> <h2 data-astro-cid-y5py4vqc>2. Trainer Accounts</h2> <p data-astro-cid-y5py4vqc>To create a Trainer profile, you must hold a valid fitness certification from a recognised body (e.g., NASM, ACE, NSCA, REPs UK, BPJEPS, CONI, EQF). By submitting your certification number, you confirm it is genuine and current. We reserve the right to verify certifications and suspend accounts where verification fails. You are solely responsible for all content on your profile and for complying with applicable laws in your jurisdiction.</p> <h2 data-astro-cid-y5py4vqc>3. Consumer Use</h2> <p data-astro-cid-y5py4vqc>Consumers who submit enquiries via Trainer profiles consent to their contact information being shared with the relevant Trainer. ${brand} is not a party to any agreement between a consumer and a Trainer. We are not liable for any injury, loss, or damage arising from fitness services arranged via the platform.</p> <h2 data-astro-cid-y5py4vqc>4. Liability Disclaimer</h2> <p data-astro-cid-y5py4vqc><strong data-astro-cid-y5py4vqc>The platform is provided "as is" without warranty of any kind.</strong> ${brandName} Inc. expressly disclaims all liability for physical injury, property damage, or financial loss arising from the use of fitness services booked or arranged via the platform. Users engage with Trainers entirely at their own risk. Trainers are independent contractors, not employees or agents of ${brandName} Inc.</p> <h2 data-astro-cid-y5py4vqc>5. Payments and Subscriptions</h2> <p data-astro-cid-y5py4vqc>Pro subscriptions are billed monthly or annually via Stripe. Subscriptions auto-renew unless cancelled before the renewal date. Refunds are not provided for partial subscription periods. Digital products sold by Trainers via the platform are subject to the Trainer's own refund policy. Payment processing is subject to the <a href="https://stripe.com/legal/ssa" target="_blank" rel="noopener" data-astro-cid-y5py4vqc>Stripe Services Agreement</a>.</p> <h2 data-astro-cid-y5py4vqc>6. Intellectual Property</h2> <p data-astro-cid-y5py4vqc>You retain ownership of all content you upload (profile photos, bio text, etc.). By uploading content, you grant ${brandName} Inc. a non-exclusive, royalty-free licence to display and distribute that content on the platform and in marketing materials. We retain all rights to the platform's design, code, and brand assets.</p> <h2 data-astro-cid-y5py4vqc>7. Termination</h2> <p data-astro-cid-y5py4vqc>We may suspend or terminate accounts that violate these terms, post false certification information, or engage in conduct harmful to other users. You may delete your account at any time from your dashboard. Deletion removes your public profile within 24 hours.</p> ${isGDPR && renderTemplate`<div data-astro-cid-y5py4vqc> <h2 data-astro-cid-y5py4vqc>8. Governing Law (UK/EU)</h2> <p data-astro-cid-y5py4vqc>For users in the United Kingdom, these terms are governed by the laws of England and Wales. For users in the EU, these terms are governed by the laws of the relevant member state. Nothing in these terms affects your statutory rights as a consumer.</p> </div>`} <h2 data-astro-cid-y5py4vqc>${isGDPR ? "9" : "8"}. Governing Law (General)</h2> <p data-astro-cid-y5py4vqc>These terms are governed by the laws of the State of Delaware, USA, without regard to conflict of law principles. Any disputes shall be resolved by binding arbitration in Delaware, except where prohibited by local law.</p> <h2 data-astro-cid-y5py4vqc>Contact</h2> <p data-astro-cid-y5py4vqc>For questions about these terms, contact <a${addAttribute(`mailto:${contactEmail}`, "href")} data-astro-cid-y5py4vqc>${contactEmail}</a>.</p> <p style="margin-top:8px;" data-astro-cid-y5py4vqc>${brandName} Inc., 2093 Philadelphia Pike #5888, Claymont, DE 19703, USA.</p> </main> ` })}`;
}, "/home/ubuntu/trainedby2/src/pages/terms.astro", void 0);

const $$file = "/home/ubuntu/trainedby2/src/pages/terms.astro";
const $$url = "/terms";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Terms,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
