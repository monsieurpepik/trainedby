/* empty css               */
import { c as createComponent } from './astro-component_akO4VGQX.mjs';
import { h as renderComponent, r as renderTemplate, m as maybeRenderHead, k as Fragment } from './ssr-function_COMFhlhs.mjs';
import { $ as $$BaseMinimal } from './BaseMinimal_Bq7dowLV.mjs';
import { g as getMarket } from './market_BDx7-ntv.mjs';

const $$Cancel = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Cancel;
  const market = getMarket(Astro2.url.hostname);
  Astro2.url.searchParams.get("token");
  let result = {};
  let errorMsg = "";
  {
    errorMsg = "Server configuration error. Please contact support.";
  }
  return renderTemplate`${renderComponent($$result, "BaseMinimal", $$BaseMinimal, { "title": `Booking cancellation — ${market.brandName}`, "data-astro-cid-7w4qtnf3": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="center-page" data-astro-cid-7w4qtnf3> <div class="card" data-astro-cid-7w4qtnf3> <div class="logo" data-astro-cid-7w4qtnf3>Trained<span data-astro-cid-7w4qtnf3>By</span></div> ${errorMsg ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-7w4qtnf3": true }, { "default": async ($$result3) => renderTemplate` <div class="icon" data-astro-cid-7w4qtnf3>⚠️</div> <h1 data-astro-cid-7w4qtnf3>Something went wrong</h1> <p data-astro-cid-7w4qtnf3>${errorMsg}</p> <a href="/" class="btn" style="background: var(--surface-3); color: var(--text)" data-astro-cid-7w4qtnf3>Go home</a> ` })}` : result.alreadyCancelled ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-7w4qtnf3": true }, { "default": async ($$result3) => renderTemplate` <div class="icon" data-astro-cid-7w4qtnf3>ℹ️</div> <h1 data-astro-cid-7w4qtnf3>Already cancelled</h1> <p data-astro-cid-7w4qtnf3>This booking was already cancelled${result.refunded ? " and refunded" : ""}.</p> ` })}` : result.cancelled ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-7w4qtnf3": true }, { "default": async ($$result3) => renderTemplate` <div class="icon" data-astro-cid-7w4qtnf3>✓</div> <h1 data-astro-cid-7w4qtnf3>Booking cancelled</h1> ${result.refunded ? renderTemplate`<p data-astro-cid-7w4qtnf3>Your booking has been cancelled and a full refund has been issued. It will appear in 5–10 business days.</p>` : renderTemplate`<p data-astro-cid-7w4qtnf3>Your booking has been cancelled. No refund is available as it was within 24 hours of the session.</p>`}` })}` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-7w4qtnf3": true }, { "default": async ($$result3) => renderTemplate` <div class="icon" data-astro-cid-7w4qtnf3>⚠️</div> <h1 data-astro-cid-7w4qtnf3>Cancellation failed</h1> <p data-astro-cid-7w4qtnf3>Please contact support.</p> ` })}`} </div> </div> ` })}`;
}, "/Users/bobanpepic/trainedby/src/pages/book/cancel.astro", void 0);
const $$file = "/Users/bobanpepic/trainedby/src/pages/book/cancel.astro";
const $$url = "/book/cancel";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Cancel,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
