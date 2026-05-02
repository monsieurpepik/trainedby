/* empty css               */
import { c as createComponent } from './astro-component_w8h7bBB0.mjs';
import { j as renderHead, h as renderComponent, k as Fragment, r as renderTemplate } from './ssr-function_CLQsF_mO.mjs';

const $$Cancel = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Cancel;
  Astro2.url.searchParams.get("token");
  let result = {};
  let errorMsg = "";
  {
    errorMsg = "Server configuration error. Please contact support.";
  }
  return renderTemplate`<html lang="en" data-astro-cid-7w4qtnf3> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Booking cancellation — TrainedBy</title>${renderHead()}</head> <body data-astro-cid-7w4qtnf3> <div class="card" data-astro-cid-7w4qtnf3> <div class="logo" data-astro-cid-7w4qtnf3>Trained<span data-astro-cid-7w4qtnf3>By</span></div> ${errorMsg ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "data-astro-cid-7w4qtnf3": true }, { "default": async ($$result2) => renderTemplate` <div class="icon" data-astro-cid-7w4qtnf3>⚠️</div> <h1 data-astro-cid-7w4qtnf3>Something went wrong</h1> <p data-astro-cid-7w4qtnf3>${errorMsg}</p> <a href="/" class="btn" style="background:#333" data-astro-cid-7w4qtnf3>Go home</a> ` })}` : result.alreadyCancelled ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "data-astro-cid-7w4qtnf3": true }, { "default": async ($$result2) => renderTemplate` <div class="icon" data-astro-cid-7w4qtnf3>ℹ️</div> <h1 data-astro-cid-7w4qtnf3>Already cancelled</h1> <p data-astro-cid-7w4qtnf3>This booking was already cancelled${result.refunded ? " and refunded" : ""}.</p> ` })}` : result.cancelled ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "data-astro-cid-7w4qtnf3": true }, { "default": async ($$result2) => renderTemplate` <div class="icon" data-astro-cid-7w4qtnf3>✓</div> <h1 data-astro-cid-7w4qtnf3>Booking cancelled</h1> ${result.refunded ? renderTemplate`<p data-astro-cid-7w4qtnf3>Your booking has been cancelled and a full refund has been issued. It will appear in 5–10 business days.</p>` : renderTemplate`<p data-astro-cid-7w4qtnf3>Your booking has been cancelled. No refund is available as it was within 24 hours of the session.</p>`}` })}` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "data-astro-cid-7w4qtnf3": true }, { "default": async ($$result2) => renderTemplate` <div class="icon" data-astro-cid-7w4qtnf3>⚠️</div> <h1 data-astro-cid-7w4qtnf3>Cancellation failed</h1> <p data-astro-cid-7w4qtnf3>Please contact support.</p> ` })}`} </div> </body></html>`;
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
