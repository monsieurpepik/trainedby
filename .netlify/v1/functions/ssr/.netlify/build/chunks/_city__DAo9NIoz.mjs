/* empty css               */
import { c as createComponent } from './astro-component_DS3eNzrN.mjs';
import { h as renderComponent, r as renderTemplate, m as maybeRenderHead, f as addAttribute } from './ssr-function_BCqmIxwe.mjs';
import { $ as $$Base } from './Base_DyQz6xRU.mjs';
import { g as getMarket } from './market_CDU5Sp-0.mjs';
import { createClient } from '@supabase/supabase-js';
import { S as SUPABASE_URL, a as SUPABASE_ANON_KEY } from './config_D-F8zC9_.mjs';

const $$city = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$city;
  const market = getMarket(Astro2.url.hostname);
  const CITY_MAP = {
    "dubai": "Dubai",
    "abu-dhabi": "Abu Dhabi",
    "sharjah": "Sharjah",
    "london": "London",
    "manchester": "Manchester",
    "new-york": "New York",
    "los-angeles": "Los Angeles",
    "miami": "Miami",
    "paris": "Paris",
    "rome": "Rome",
    "milan": "Milan",
    "madrid": "Madrid",
    "barcelona": "Barcelona",
    "delhi": "Delhi",
    "mumbai": "Mumbai",
    "bangalore": "Bangalore"
  };
  const citySlug = Astro2.params.city ?? "";
  const cityName = CITY_MAP[citySlug];
  if (!cityName) {
    return Astro2.redirect("/find", 302);
  }
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: trainers, error: trainersError } = await sb.from("trainers").select("id, name, slug, title, avatar_url, specialties, city, market, plan, reps_verified").ilike("city", `%${cityName}%`).eq("market", market.market).order("plan", { ascending: false }).limit(20);
  if (trainersError) console.error("[city page] Supabase error:", trainersError.message);
  const pageTitle = `Personal Trainers in ${cityName} | ${market.brandName}`;
  const pageDesc = `Find verified personal trainers in ${cityName}. Book sessions, compare rates, and connect via WhatsApp — free on ${market.brandName}.`;
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": pageTitle, "description": pageDesc, "data-astro-cid-ucxu4o7g": true }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<nav data-astro-cid-ucxu4o7g> <a href="/" class="logo" data-astro-cid-ucxu4o7g>${market.brandName}</a> <a href="/join" class="nav-cta" data-astro-cid-ucxu4o7g>Create your profile →</a> </nav> <div class="hero" data-astro-cid-ucxu4o7g> <div class="hero-eyebrow" data-astro-cid-ucxu4o7g>Verified Trainers · ${market.certificationBody} Standard</div> <h1 data-astro-cid-ucxu4o7g>Personal Trainers<br data-astro-cid-ucxu4o7g>in ${cityName}</h1> <p class="hero-sub" data-astro-cid-ucxu4o7g> ${trainers && trainers.length > 0 ? `${trainers.length} verified trainer${trainers.length > 1 ? "s" : ""} in ${cityName}. Compare profiles, see packages, and book directly via WhatsApp.` : `Be the first verified trainer listed in ${cityName} on ${market.brandName}.`} </p> </div> ${trainers && trainers.length > 0 ? renderTemplate`<div class="trainer-grid" data-astro-cid-ucxu4o7g> ${trainers.map((trainer) => renderTemplate`<a${addAttribute(`/${trainer.slug}`, "href")} class="trainer-card" data-astro-cid-ucxu4o7g> <div class="card-header" data-astro-cid-ucxu4o7g> ${trainer.avatar_url ? renderTemplate`<img${addAttribute(trainer.avatar_url, "src")}${addAttribute(trainer.name, "alt")} class="card-avatar" loading="lazy" data-astro-cid-ucxu4o7g>` : renderTemplate`<div class="card-avatar-initials" data-astro-cid-ucxu4o7g>${trainer.name.charAt(0)}</div>`} <div data-astro-cid-ucxu4o7g> <div class="card-name" data-astro-cid-ucxu4o7g>${trainer.name}</div> <div class="card-title" data-astro-cid-ucxu4o7g>${trainer.title || "Personal Trainer"}</div> </div> </div> ${trainer.reps_verified && renderTemplate`<div class="card-badge" data-astro-cid-ucxu4o7g>✓ ${market.certificationBody} Verified</div>`} <div class="card-specs" data-astro-cid-ucxu4o7g> ${(trainer.specialties || []).slice(0, 3).map((s) => renderTemplate`<span class="spec-pill" data-astro-cid-ucxu4o7g>${s}</span>`)} </div> </a>`)} </div>` : renderTemplate`<div class="empty" data-astro-cid-ucxu4o7g> <p data-astro-cid-ucxu4o7g>No trainers listed in ${cityName} yet.</p> </div>`}<div class="cta-strip" data-astro-cid-ucxu4o7g> <h2 data-astro-cid-ucxu4o7g>Are you a trainer in ${cityName}?</h2> <p data-astro-cid-ucxu4o7g>Get a verified public profile, manage leads, and book clients — free to start.</p> <a href="/join" class="btn-primary" data-astro-cid-ucxu4o7g>Create your free profile →</a> </div> ` })}`;
}, "/Users/bobanpepic/trainedby/src/pages/find/[city].astro", void 0);

const $$file = "/Users/bobanpepic/trainedby/src/pages/find/[city].astro";
const $$url = "/find/[city]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$city,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
