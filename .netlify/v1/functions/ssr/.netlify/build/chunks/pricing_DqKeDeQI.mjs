/* empty css               */
import { c as createComponent } from './astro-component_DiJ9uz96.mjs';
import { h as renderComponent, r as renderTemplate, f as addAttribute, u as unescapeHTML, m as maybeRenderHead } from './ssr-function_D_8GPgmW.mjs';
import { g as getLocale, t, $ as $$Base, a as getBrand } from './Base_X9W0huPu.mjs';
import { g as getMarket } from './market_CY7-kFE1.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Pricing = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Pricing;
  const market = getMarket(Astro2.url.hostname);
  const locale = getLocale(Astro2.request);
  const brand = getBrand(locale);
  const brandName = brand.name;
  const proMonthly = market.currency === "AED" ? 99 : market.currency === "GBP" ? 29 : market.currency === "EUR" ? 29 : market.currency === "INR" ? 1999 : 29;
  const premiumMonthly = market.currency === "AED" ? 199 : market.currency === "GBP" ? 59 : market.currency === "EUR" ? 59 : market.currency === "INR" ? 3999 : 59;
  const pricingHeadline = t(locale, "pricing.headline").replace("{price}", `${market.currency} ${proMonthly}`);
  const DEMO_SLUGS = {
    "en-ae": "sarah-al-mansoori",
    "en-uk": "james-hartley",
    "en-us": "marcus-johnson",
    "en-in": "arjun-sharma",
    "es": "lucia-fernandez",
    "fr": "thomas-moreau",
    "it": "giulia-romano"
  };
  const demoSlug = DEMO_SLUGS[locale] ?? "sarah-al-mansoori";
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": `Pricing - ${brandName}`, "description": `Simple, transparent pricing for ${brandName}. Free to start. Pro plan with a 30-day ROI guarantee.`, "data-astro-cid-lmkygsfs": true }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template(["  ", '<nav data-astro-cid-lmkygsfs> <div class="nav-inner" data-astro-cid-lmkygsfs> <a href="/" class="nav-logo" data-astro-cid-lmkygsfs> <svg width="30" height="30" viewBox="0 0 32 32" data-astro-cid-lmkygsfs><rect width="32" height="32" rx="8" fill="#FF5C00" data-astro-cid-lmkygsfs></rect><text x="16" y="23" font-family="Manrope,Arial,sans-serif" font-size="14" font-weight="800" text-anchor="middle" fill="white" data-astro-cid-lmkygsfs>TB</text></svg> ', ' </a> <a href="/join" class="nav-cta" data-astro-cid-lmkygsfs>', ' →</a> </div> </nav> <div class="pricing-wrap" data-astro-cid-lmkygsfs> <div class="pricing-header" data-astro-cid-lmkygsfs> <div class="pricing-label" data-astro-cid-lmkygsfs>', '</div> <h1 class="pricing-title" data-astro-cid-lmkygsfs>', '</h1> <p class="pricing-sub" data-astro-cid-lmkygsfs>', `</p> </div> <!-- Billing toggle --> <div class="billing-toggle" data-astro-cid-lmkygsfs> <span class="billing-option active" id="monthly-label" onclick="setBilling('monthly')" data-astro-cid-lmkygsfs>`, `</span> <div class="toggle-switch" id="billing-switch" onclick="toggleBilling()" data-astro-cid-lmkygsfs> <div class="toggle-knob" data-astro-cid-lmkygsfs></div> </div> <span class="billing-option" id="annual-label" onclick="setBilling('annual')" data-astro-cid-lmkygsfs>`, '</span> <span class="billing-save" data-astro-cid-lmkygsfs>', '</span> </div> <!-- Plans --> <div class="plans-grid" data-astro-cid-lmkygsfs> <!-- Free --> <div class="plan-card" data-astro-cid-lmkygsfs> <div class="plan-name" data-astro-cid-lmkygsfs>', '</div> <div class="plan-price" data-astro-cid-lmkygsfs> <span class="plan-price-currency" data-astro-cid-lmkygsfs>', '</span> <span class="plan-price-value" data-astro-cid-lmkygsfs>0</span> <span class="plan-price-period" data-astro-cid-lmkygsfs>/', '</span> </div> <div class="plan-price-annual" data-astro-cid-lmkygsfs>&nbsp;</div> <div class="plan-desc" data-astro-cid-lmkygsfs>', `</div> <button class="plan-btn plan-btn-ghost" onclick="location.href='/join'" data-astro-cid-lmkygsfs>`, '</button> <div class="plan-features" data-astro-cid-lmkygsfs> <div class="plan-feature included" data-astro-cid-lmkygsfs> <svg width="14" height="14" viewBox="0 0 24 24" fill="#00C853" data-astro-cid-lmkygsfs><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-lmkygsfs></path></svg> ', ' </div> <div class="plan-feature included" data-astro-cid-lmkygsfs> <svg width="14" height="14" viewBox="0 0 24 24" fill="#00C853" data-astro-cid-lmkygsfs><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-lmkygsfs></path></svg> ', " ", ' </div> <div class="plan-feature included" data-astro-cid-lmkygsfs> <svg width="14" height="14" viewBox="0 0 24 24" fill="#00C853" data-astro-cid-lmkygsfs><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-lmkygsfs></path></svg> ', ' </div> <div class="plan-feature included" data-astro-cid-lmkygsfs> <svg width="14" height="14" viewBox="0 0 24 24" fill="#00C853" data-astro-cid-lmkygsfs><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-lmkygsfs></path></svg> ', ' </div> <div class="plan-feature excluded" data-astro-cid-lmkygsfs> <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)" data-astro-cid-lmkygsfs><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" data-astro-cid-lmkygsfs></path></svg> ', ' </div> <div class="plan-feature excluded" data-astro-cid-lmkygsfs> <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)" data-astro-cid-lmkygsfs><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" data-astro-cid-lmkygsfs></path></svg> ', ' </div> <div class="plan-feature excluded" data-astro-cid-lmkygsfs> <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)" data-astro-cid-lmkygsfs><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" data-astro-cid-lmkygsfs></path></svg> ', ' </div> <div class="plan-feature excluded" data-astro-cid-lmkygsfs> <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)" data-astro-cid-lmkygsfs><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" data-astro-cid-lmkygsfs></path></svg> ', ' </div> </div> </div> <!-- Pro (Popular) --> <div class="plan-card popular" data-astro-cid-lmkygsfs> <div class="popular-badge" data-astro-cid-lmkygsfs>', '</div> <div class="plan-name" data-astro-cid-lmkygsfs>', '</div> <div class="plan-price" data-astro-cid-lmkygsfs> <span class="plan-price-currency" data-astro-cid-lmkygsfs>', '</span> <span class="plan-price-value" id="pro-price" data-astro-cid-lmkygsfs>', '</span> <span class="plan-price-period" data-astro-cid-lmkygsfs>/', '</span> </div> <div class="plan-price-annual" id="pro-annual-note" data-astro-cid-lmkygsfs>&nbsp;</div> <div class="plan-desc" data-astro-cid-lmkygsfs>', `</div> <button class="plan-btn plan-btn-brand" onclick="startCheckout('pro')" data-astro-cid-lmkygsfs>`, "</button> <a", ' style="display:block;text-align:center;margin-top:10px;font-size:12px;color:rgba(255,255,255,0.4);text-decoration:underline;text-underline-offset:3px" target="_blank" rel="noopener" data-astro-cid-lmkygsfs>See an example Pro profile</a> <div class="plan-features" data-astro-cid-lmkygsfs> <div class="plan-feature included" data-astro-cid-lmkygsfs> <svg width="14" height="14" viewBox="0 0 24 24" fill="#00C853" data-astro-cid-lmkygsfs><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-lmkygsfs></path></svg> ', ' </div> <div class="plan-feature included" style="background:rgba(255,92,0,0.04);border-radius:8px;padding:6px 8px;margin:-2px 0" data-astro-cid-lmkygsfs> <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF5C00" data-astro-cid-lmkygsfs><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-lmkygsfs></path></svg> <strong style="color:#FF5C00" data-astro-cid-lmkygsfs>📊 ', '</strong> </div> <div class="plan-feature included" data-astro-cid-lmkygsfs> <svg width="14" height="14" viewBox="0 0 24 24" fill="#00C853" data-astro-cid-lmkygsfs><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-lmkygsfs></path></svg> ', " ", ' </div> <div class="plan-feature included" data-astro-cid-lmkygsfs> <svg width="14" height="14" viewBox="0 0 24 24" fill="#00C853" data-astro-cid-lmkygsfs><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-lmkygsfs></path></svg> <strong data-astro-cid-lmkygsfs>', " (", ')</strong> </div> <div class="plan-feature included" data-astro-cid-lmkygsfs> <svg width="14" height="14" viewBox="0 0 24 24" fill="#00C853" data-astro-cid-lmkygsfs><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-lmkygsfs></path></svg> <strong data-astro-cid-lmkygsfs>', '</strong> </div> <div class="plan-feature included" data-astro-cid-lmkygsfs> <svg width="14" height="14" viewBox="0 0 24 24" fill="#00C853" data-astro-cid-lmkygsfs><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-lmkygsfs></path></svg> ', " (", ')\n</div> <div class="plan-feature included" data-astro-cid-lmkygsfs> <svg width="14" height="14" viewBox="0 0 24 24" fill="#00C853" data-astro-cid-lmkygsfs><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-lmkygsfs></path></svg> <strong data-astro-cid-lmkygsfs>', '</strong> </div> <div class="plan-feature included" data-astro-cid-lmkygsfs> <svg width="14" height="14" viewBox="0 0 24 24" fill="#00C853" data-astro-cid-lmkygsfs><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-lmkygsfs></path></svg> ', ' </div> </div> </div> <!-- Premium --> <div class="plan-card" data-astro-cid-lmkygsfs> <div class="plan-name" data-astro-cid-lmkygsfs>', '</div> <div class="plan-price" data-astro-cid-lmkygsfs> <span class="plan-price-currency" data-astro-cid-lmkygsfs>', '</span> <span class="plan-price-value" id="premium-price" data-astro-cid-lmkygsfs>', '</span> <span class="plan-price-period" data-astro-cid-lmkygsfs>/', '</span> </div> <div class="plan-price-annual" id="premium-annual-note" data-astro-cid-lmkygsfs>&nbsp;</div> <div class="plan-desc" data-astro-cid-lmkygsfs>', `</div> <button class="plan-btn plan-btn-brand" style="background:var(--surface-3);color:var(--text);border:1px solid var(--border);" onmouseover="this.style.background='var(--brand)';this.style.borderColor='var(--brand)'" onmouseout="this.style.background='var(--surface-3)';this.style.borderColor='var(--border)'" onclick="startCheckout('premium')" data-astro-cid-lmkygsfs>`, '</button> <div class="plan-features" data-astro-cid-lmkygsfs> <div class="plan-feature included" data-astro-cid-lmkygsfs> <svg width="14" height="14" viewBox="0 0 24 24" fill="#00C853" data-astro-cid-lmkygsfs><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-lmkygsfs></path></svg> ', ' </div> <div class="plan-feature included" data-astro-cid-lmkygsfs> <svg width="14" height="14" viewBox="0 0 24 24" fill="#00C853" data-astro-cid-lmkygsfs><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-lmkygsfs></path></svg> <strong data-astro-cid-lmkygsfs>', " ", '</strong> </div> <div class="plan-feature included" data-astro-cid-lmkygsfs> <svg width="14" height="14" viewBox="0 0 24 24" fill="#00C853" data-astro-cid-lmkygsfs><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-lmkygsfs></path></svg> ', ' </div> <div class="plan-feature included" data-astro-cid-lmkygsfs> <svg width="14" height="14" viewBox="0 0 24 24" fill="#00C853" data-astro-cid-lmkygsfs><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-lmkygsfs></path></svg> ', ' </div> </div> </div> </div> <!-- Comparison table --> <div class="compare-section" data-astro-cid-lmkygsfs> <div class="compare-title" data-astro-cid-lmkygsfs>', '</div> <table class="compare-table" data-astro-cid-lmkygsfs> <thead data-astro-cid-lmkygsfs> <tr data-astro-cid-lmkygsfs> <th data-astro-cid-lmkygsfs>', "</th> <th data-astro-cid-lmkygsfs>", '</th> <th style="color:var(--brand);" data-astro-cid-lmkygsfs>', "</th> <th data-astro-cid-lmkygsfs>", "</th> </tr> </thead> <tbody data-astro-cid-lmkygsfs> <tr data-astro-cid-lmkygsfs><td data-astro-cid-lmkygsfs>", '</td><td data-astro-cid-lmkygsfs><span class="check" data-astro-cid-lmkygsfs>✓</span></td><td data-astro-cid-lmkygsfs><span class="check" data-astro-cid-lmkygsfs>✓</span></td><td data-astro-cid-lmkygsfs><span class="check" data-astro-cid-lmkygsfs>✓</span></td></tr> <tr data-astro-cid-lmkygsfs><td data-astro-cid-lmkygsfs>', " ", '</td><td data-astro-cid-lmkygsfs><span class="check" data-astro-cid-lmkygsfs>✓</span></td><td data-astro-cid-lmkygsfs><span class="check" data-astro-cid-lmkygsfs>✓</span></td><td data-astro-cid-lmkygsfs><span class="check" data-astro-cid-lmkygsfs>✓</span></td></tr> <tr data-astro-cid-lmkygsfs><td data-astro-cid-lmkygsfs>', '</td><td data-astro-cid-lmkygsfs><span class="check" data-astro-cid-lmkygsfs>✓</span></td><td data-astro-cid-lmkygsfs><span class="check" data-astro-cid-lmkygsfs>✓</span></td><td data-astro-cid-lmkygsfs><span class="check" data-astro-cid-lmkygsfs>✓</span></td></tr> <tr data-astro-cid-lmkygsfs><td data-astro-cid-lmkygsfs>', '</td><td data-astro-cid-lmkygsfs><span class="cross" data-astro-cid-lmkygsfs> - </span></td><td data-astro-cid-lmkygsfs><span class="check" data-astro-cid-lmkygsfs>✓</span></td><td data-astro-cid-lmkygsfs><span class="check" data-astro-cid-lmkygsfs>✓</span></td></tr> <tr data-astro-cid-lmkygsfs><td data-astro-cid-lmkygsfs>', "</td><td data-astro-cid-lmkygsfs>", '</td><td class="plan-highlight" data-astro-cid-lmkygsfs>', '</td><td class="plan-highlight" data-astro-cid-lmkygsfs>', "</td></tr> <tr data-astro-cid-lmkygsfs><td data-astro-cid-lmkygsfs>", '</td><td data-astro-cid-lmkygsfs><span class="cross" data-astro-cid-lmkygsfs> - </span></td><td class="plan-highlight" data-astro-cid-lmkygsfs>', '</td><td class="plan-highlight" data-astro-cid-lmkygsfs>', "</td></tr> <tr data-astro-cid-lmkygsfs><td data-astro-cid-lmkygsfs>", '</td><td data-astro-cid-lmkygsfs><span class="cross" data-astro-cid-lmkygsfs> - </span></td><td data-astro-cid-lmkygsfs><span class="check" data-astro-cid-lmkygsfs>✓</span></td><td data-astro-cid-lmkygsfs><span class="check" data-astro-cid-lmkygsfs>✓</span></td></tr> <tr data-astro-cid-lmkygsfs><td data-astro-cid-lmkygsfs>', '</td><td data-astro-cid-lmkygsfs><span class="cross" data-astro-cid-lmkygsfs> - </span></td><td data-astro-cid-lmkygsfs><span class="check" data-astro-cid-lmkygsfs>✓</span></td><td data-astro-cid-lmkygsfs><span class="check" data-astro-cid-lmkygsfs>✓</span></td></tr> <tr data-astro-cid-lmkygsfs><td data-astro-cid-lmkygsfs>', '</td><td data-astro-cid-lmkygsfs><span class="cross" data-astro-cid-lmkygsfs> - </span></td><td data-astro-cid-lmkygsfs><span class="check" data-astro-cid-lmkygsfs>✓</span></td><td data-astro-cid-lmkygsfs><span class="check" data-astro-cid-lmkygsfs>✓</span></td></tr> <tr data-astro-cid-lmkygsfs><td data-astro-cid-lmkygsfs>', '</td><td data-astro-cid-lmkygsfs><span class="cross" data-astro-cid-lmkygsfs> - </span></td><td data-astro-cid-lmkygsfs><span class="check" data-astro-cid-lmkygsfs>✓</span></td><td data-astro-cid-lmkygsfs><span class="check" data-astro-cid-lmkygsfs>✓</span></td></tr> <tr data-astro-cid-lmkygsfs><td data-astro-cid-lmkygsfs>', '</td><td data-astro-cid-lmkygsfs><span class="cross" data-astro-cid-lmkygsfs> - </span></td><td data-astro-cid-lmkygsfs><span class="cross" data-astro-cid-lmkygsfs> - </span></td><td class="plan-highlight" data-astro-cid-lmkygsfs>', "</td></tr> <tr data-astro-cid-lmkygsfs><td data-astro-cid-lmkygsfs>", '</td><td data-astro-cid-lmkygsfs><span class="cross" data-astro-cid-lmkygsfs> - </span></td><td data-astro-cid-lmkygsfs><span class="cross" data-astro-cid-lmkygsfs> - </span></td><td data-astro-cid-lmkygsfs><span class="check" data-astro-cid-lmkygsfs>✓</span></td></tr> <tr data-astro-cid-lmkygsfs><td data-astro-cid-lmkygsfs>', '</td><td data-astro-cid-lmkygsfs><span class="cross" data-astro-cid-lmkygsfs> - </span></td><td data-astro-cid-lmkygsfs><span class="cross" data-astro-cid-lmkygsfs> - </span></td><td data-astro-cid-lmkygsfs><span class="check" data-astro-cid-lmkygsfs>✓</span></td></tr> </tbody> </table> </div> </div> <footer data-astro-cid-lmkygsfs> <div class="footer-inner" data-astro-cid-lmkygsfs> <a href="/" class="footer-logo" data-astro-cid-lmkygsfs> <svg width="26" height="26" viewBox="0 0 32 32" data-astro-cid-lmkygsfs><rect width="32" height="32" rx="8" fill="#FF5C00" data-astro-cid-lmkygsfs></rect><text x="16" y="23" font-family="Manrope,Arial,sans-serif" font-size="14" font-weight="800" text-anchor="middle" fill="white" data-astro-cid-lmkygsfs>TB</text></svg> ', ' </a> <div class="footer-copy" data-astro-cid-lmkygsfs>© ', " ", `.</div> </div> </footer> <script>
const SUPABASE_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co';
const EDGE_BASE = SUPABASE_URL + '/functions/v1';
let isAnnual = false;

function toggleBilling() { setBilling(isAnnual ? 'monthly' : 'annual'); }
function setBilling(mode) {
  isAnnual = mode === 'annual';
  document.getElementById('billing-switch').classList.toggle('annual', isAnnual);
  document.getElementById('monthly-label').classList.toggle('active', !isAnnual);
  document.getElementById('annual-label').classList.toggle('active', isAnnual);
  const currency = '{market.currency}';
  const proM = {proMonthly}, proA = {proAnnual};
  const premM = {premiumMonthly}, premA = {premiumAnnual};
  document.getElementById('pro-price').textContent = isAnnual ? proA : proM;
  document.getElementById('premium-price').textContent = isAnnual ? premA : premM;
  document.getElementById('pro-annual-note').textContent = isAnnual ? currency + ' ' + (proA * 12) + '/yr - save ' + currency + ' ' + ((proM - proA) * 12) : '';
  document.getElementById('premium-annual-note').textContent = isAnnual ? currency + ' ' + (premA * 12) + '/yr - save ' + currency + ' ' + ((premM - premA) * 12) : '';
}

function getAuthToken() {
  const cookies = document.cookie.split(';').map(c => c.trim());
  for (const c of cookies) {
    if (c.startsWith('tb_session=')) return c.slice('tb_session='.length);
  }
  return localStorage.getItem('tb_edit_token');
}

async function startCheckout(plan) {
  const token = getAuthToken();
  if (!token) { location.href = '/join'; return; }
  try {
    // Resolve trainer_id from token — required by payment-router auth check
    const verifyRes = await fetch(EDGE_BASE + '/verify-magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token })
    });
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !verifyData.trainer) { alert('Session expired. Please log in again.'); location.href = '/join'; return; }
    const trainer_id = verifyData.trainer.id;

    const res = await fetch(EDGE_BASE + '/payment-router', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({
        trainer_id,
        plan,
        billing: isAnnual ? 'annual' : 'monthly',
        success_url: location.origin + '/dashboard?upgraded=1',
        cancel_url: location.origin + '/pricing',
      })
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error || 'Could not start checkout.'); return; }
    if (data.provider === 'stripe' && data.checkout_url) {
      location.href = data.checkout_url;
    } else if (data.provider === 'razorpay') {
      await openRazorpay(data);
    } else {
      alert('Could not start checkout. Please try again.');
    }
  } catch (err) {
    if (err && err.message && err.message.includes('razorpay')) {
      alert('Payment provider unavailable. Please try again or contact support.');
    } else {
      alert('Could not start checkout. Please try again.');
    }
  }
}

function openRazorpay(data) {
  return new Promise((resolve, reject) => {
    function openModal() {
      const rzp = new Razorpay({
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        order_id: data.order_id,
        name: 'TrainedBy',
        description: data.description,
        prefill: { name: data.trainer_name, email: data.trainer_email },
        handler: () => { resolve(); location.href = location.origin + '/dashboard?upgraded=1'; },
        modal: { ondismiss: resolve },
      });
      rzp.open();
    }
    if (window.Razorpay) { openModal(); return; }
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existing) { existing.addEventListener('load', openModal); existing.addEventListener('error', () => reject(new Error('razorpay-sdk-load-failed'))); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = openModal;
    script.onerror = () => reject(new Error('razorpay-sdk-load-failed'));
    document.head.appendChild(script);
  });
}
<\/script> `])), maybeRenderHead(), brandName, t(locale, "join.submit").replace(" →", ""), t(locale, "pricing.title"), unescapeHTML(pricingHeadline.replace(". ", ".<br>")), t(locale, "pricing.sub_ext"), t(locale, "pricing.monthly_label"), t(locale, "pricing.annual_label"), t(locale, "pricing.save"), t(locale, "pricing.free_name"), market.currency, t(locale, "pricing.monthly"), t(locale, "pricing.free_desc"), t(locale, "pricing.get_started_free"), t(locale, "pricing.f_profile"), market.certificationBody, t(locale, "pricing.f_badge"), t(locale, "pricing.f_whatsapp"), t(locale, "pricing.f_1_package"), t(locale, "pricing.f_assessment"), t(locale, "pricing.f_ai"), t(locale, "pricing.f_analytics"), t(locale, "pricing.f_priority"), t(locale, "pricing.popular"), t(locale, "pricing.pro_name"), market.currency, proMonthly, t(locale, "pricing.monthly"), t(locale, "pricing.pro_desc"), t(locale, "pricing.upgrade_pro"), addAttribute(`/${demoSlug}`, "href"), t(locale, "pricing.f_everything_free"), t(locale, "pricing.f_analytics"), t(locale, "pricing.f_unlimited"), t(locale, "pricing.f_packages").toLowerCase(), t(locale, "pricing.f_ai"), t(locale, "pricing.f_unlimited").toLowerCase(), t(locale, "pricing.f_priority"), t(locale, "pricing.f_gallery"), t(locale, "pricing.f_9_photos"), t(locale, "pricing.f_analytics"), t(locale, "pricing.f_branding"), t(locale, "pricing.premium_name"), market.currency, premiumMonthly, t(locale, "pricing.monthly"), t(locale, "pricing.premium_desc"), t(locale, "pricing.get_premium"), t(locale, "pricing.f_everything_pro"), t(locale, "pricing.f_up_to_5"), t(locale, "pricing.f_multi").toLowerCase(), t(locale, "pricing.f_gym"), t(locale, "pricing.f_support"), t(locale, "pricing.full_comparison"), t(locale, "pricing.feature"), t(locale, "pricing.free_name"), t(locale, "pricing.pro_name"), t(locale, "pricing.premium_name"), t(locale, "pricing.f_profile"), market.certificationBody, t(locale, "pricing.f_badge"), t(locale, "pricing.f_whatsapp"), t(locale, "pricing.f_assessment"), t(locale, "pricing.f_packages"), t(locale, "pricing.f_1_package"), t(locale, "pricing.f_unlimited"), t(locale, "pricing.f_unlimited"), t(locale, "pricing.f_gallery"), t(locale, "pricing.f_9_photos"), t(locale, "pricing.f_9_photos"), t(locale, "pricing.f_ai"), t(locale, "pricing.f_priority"), t(locale, "pricing.f_analytics"), t(locale, "pricing.f_branding"), t(locale, "pricing.f_multi"), t(locale, "pricing.f_up_to_5"), t(locale, "pricing.f_gym"), t(locale, "pricing.f_support"), brandName, (/* @__PURE__ */ new Date()).getFullYear(), brandName) })}`;
}, "/Users/bobanpepic/trainedby/src/pages/pricing.astro", void 0);

const $$file = "/Users/bobanpepic/trainedby/src/pages/pricing.astro";
const $$url = "/pricing";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Pricing,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
