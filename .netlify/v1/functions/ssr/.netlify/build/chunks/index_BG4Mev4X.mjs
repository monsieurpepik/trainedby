import { g as getMarket, $ as $$Base } from './Base_BncrLJgF.mjs';
import { c as createComponent } from './astro-component_rYSPh4RH.mjs';
import { h as renderComponent, r as renderTemplate, m as maybeRenderHead } from './ssr-function_C4Nx6pnO.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const market = getMarket(Astro2.url.hostname);
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": market.siteTitle, "description": market.metaDescription, "canonical": `https://${market.domain}/` }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([` <meta http-equiv="refresh" content="0;url=/landing"> <script>window.location.replace('/landing');<\/script> `, '<noscript> <a href="/landing" style="color:#FF5C00;font-family:sans-serif;">\nClick here to enter the site\n</a> </noscript> '])), maybeRenderHead()) })}`;
}, "/home/ubuntu/trainedby2/src/pages/index.astro", void 0);

const $$file = "/home/ubuntu/trainedby2/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
