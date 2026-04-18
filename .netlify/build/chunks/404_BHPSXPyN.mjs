import { g as getMarket, $ as $$Base } from './Base_BTvRh2ea.mjs';
import { c as createComponent } from './astro-component_DPs2D7Ga.mjs';
import { h as renderComponent, r as renderTemplate, m as maybeRenderHead } from './ssr-function_CUiZsz_Y.mjs';

const $$404 = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$404;
  const market = getMarket(Astro2.url.hostname);
  const brandName = market.brandName;
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": `Page Not Found  -  ${brandName}`, "description": `The page you're looking for doesn't exist on ${brandName}.`, "data-astro-cid-zetdm5md": true }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="container" data-astro-cid-zetdm5md> <div class="code" data-astro-cid-zetdm5md>404</div> <h1 data-astro-cid-zetdm5md>Page not found</h1> <p data-astro-cid-zetdm5md>The page you're looking for doesn't exist, or the trainer profile may have been removed.</p> <div class="actions" data-astro-cid-zetdm5md> <a href="/find" class="btn-primary" data-astro-cid-zetdm5md>Find a Trainer</a> <a href="/" class="btn-ghost" data-astro-cid-zetdm5md>Go Home</a> </div> </div> ` })}`;
}, "/home/ubuntu/trainedby2/src/pages/404.astro", void 0);

const $$file = "/home/ubuntu/trainedby2/src/pages/404.astro";
const $$url = "/404";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
