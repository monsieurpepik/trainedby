/* empty css               */
import { c as createComponent } from './astro-component_w8h7bBB0.mjs';
import { h as renderComponent, r as renderTemplate, m as maybeRenderHead } from './ssr-function_CLQsF_mO.mjs';
import { $ as $$Base } from './Base_i0jskCET.mjs';
import { g as getMarket } from './market_dK7R5WHH.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const market = getMarket(Astro2.url.hostname);
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": market.siteTitle, "description": market.metaDescription, "canonical": `https://${market.domain}/` }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([` <meta http-equiv="refresh" content="0;url=/landing"> <script>window.location.replace('/landing');<\/script> `, '<noscript> <a href="/landing" style="color:#FF5C00;font-family:sans-serif;">\nClick here to enter the site\n</a> </noscript> '])), maybeRenderHead()) })}`;
}, "/Users/bobanpepic/trainedby/src/pages/index.astro", void 0);

const $$file = "/Users/bobanpepic/trainedby/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
