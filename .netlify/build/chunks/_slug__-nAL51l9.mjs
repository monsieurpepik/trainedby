import { g as getMarket, $ as $$Base, r as renderScript } from './Base_DyLnssWi.mjs';
import { c as createComponent } from './astro-component_0KXJcZ39.mjs';
import { h as renderComponent, r as renderTemplate, m as maybeRenderHead, j as defineScriptVars } from './ssr-function_DOqjNcNT.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  const market = getMarket(Astro2.url.hostname);
  const brandName = market.brandName;
  if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
    return Astro2.redirect("/find", 302);
  }
  const RESERVED = /* @__PURE__ */ new Set([
    "find",
    "join",
    "pricing",
    "blog",
    "dashboard",
    "edit",
    "admin",
    "superadmin",
    "for-trainers",
    "privacy",
    "terms",
    "cookie-policy",
    "landing",
    "index",
    "profile",
    "sitemap.xml",
    "robots.txt",
    "favicon.ico",
    "manifest.webmanifest"
  ]);
  if (RESERVED.has(slug.toLowerCase())) {
    return Astro2.redirect("/find", 302);
  }
  const SUPABASE_URL = "https://mezhtdbfyvkshpuplqqw.supabase.co";
  const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo";
  let trainerName = "";
  let trainerSpecialty = "";
  let trainerPhoto = "";
  let trainerExists = false;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/trainers?slug=eq.${encodeURIComponent(slug)}&select=name,specialties,avatar_url&limit=1`,
      { headers: { "apikey": ANON_KEY, "Authorization": `Bearer ${ANON_KEY}` } }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        trainerExists = true;
        trainerName = data[0].name || "";
        trainerSpecialty = Array.isArray(data[0].specialties) ? data[0].specialties[0] : data[0].specialties || "Personal Trainer";
        trainerPhoto = data[0].avatar_url || "";
      }
    }
  } catch (e) {
    trainerExists = true;
  }
  if (!trainerExists) {
    return new Response(null, { status: 404 });
  }
  const pageTitle = trainerName ? `${trainerName}  -  Verified Trainer on ${brandName}` : `Trainer Profile  -  ${brandName}`;
  const pageDesc = trainerName ? `Book sessions with ${trainerName}, a verified ${trainerSpecialty} on ${brandName}.` : `Verified personal trainer profile on ${brandName}`;
  const pageImage = trainerPhoto || "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=85";
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": pageTitle, "description": pageDesc, "ogImage": pageImage, "data-astro-cid-yvbahnfj": true }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template(["  <script>(function(){", "\n    window.__TRAINER_SLUG__ = slug;\n  })();<\/script>   ", '<div id="bg" data-astro-cid-yvbahnfj></div> <div id="bg-bloom" data-astro-cid-yvbahnfj></div> <div id="root" data-astro-cid-yvbahnfj> <div class="loading-state" id="loading-state" data-astro-cid-yvbahnfj> <div class="spinner" data-astro-cid-yvbahnfj></div> </div> <div id="profile-mount" style="display:none" data-astro-cid-yvbahnfj></div> </div> ', " "])), defineScriptVars({ slug }), maybeRenderHead(), renderScript($$result2, "/home/ubuntu/trainedby2/src/pages/[slug].astro?astro&type=script&index=0&lang.ts")) })}`;
}, "/home/ubuntu/trainedby2/src/pages/[slug].astro", void 0);

const $$file = "/home/ubuntu/trainedby2/src/pages/[slug].astro";
const $$url = "/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
