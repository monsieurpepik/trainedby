/* empty css               */
import { c as createComponent } from './astro-component_w8h7bBB0.mjs';
import { j as renderHead, r as renderTemplate, h as renderComponent, k as Fragment } from './ssr-function_CLQsF_mO.mjs';

const $$MyBookings = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$MyBookings;
  Astro2.url.searchParams.get("token");
  let credits = [];
  let errorMsg = "";
  let email = "";
  {
    errorMsg = "Server configuration error. Please contact support.";
  }
  const available = credits.filter((c) => c.status === "available");
  const scheduled = credits.filter((c) => c.status === "scheduled");
  const used = credits.filter((c) => c.status === "used");
  return renderTemplate`<html lang="en" data-astro-cid-7yvrukok> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>My sessions — TrainedBy</title>${renderHead()}</head> <body data-astro-cid-7yvrukok> <div class="page" data-astro-cid-7yvrukok> <div class="logo" data-astro-cid-7yvrukok>Trained<span data-astro-cid-7yvrukok>By</span></div> ${errorMsg ? renderTemplate`<div class="error" data-astro-cid-7yvrukok> <h1 data-astro-cid-7yvrukok>⚠️ Invalid link</h1> <p data-astro-cid-7yvrukok>${errorMsg}</p> </div>` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "data-astro-cid-7yvrukok": true }, { "default": async ($$result2) => renderTemplate` <h1 data-astro-cid-7yvrukok>My sessions</h1> <p class="sub" data-astro-cid-7yvrukok>${email}</p> ${available.length > 0 && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-7yvrukok": true }, { "default": async ($$result3) => renderTemplate` <div class="section-label" data-astro-cid-7yvrukok>Ready to schedule (${available.length})</div> ${available.map((c) => renderTemplate`<div class="credit-card" data-astro-cid-7yvrukok> <div class="credit-info" data-astro-cid-7yvrukok> <div data-astro-cid-7yvrukok>${c.session_type?.name ?? "Session"}</div> <div class="credit-meta" data-astro-cid-7yvrukok>${c.session_type?.duration_min ?? "—"} min</div> </div> <span class="status-badge badge-available" data-astro-cid-7yvrukok>Available</span> </div>`)}<p style="font-size:13px;color:rgba(255,255,255,0.4);margin-bottom:24px;line-height:1.7" data-astro-cid-7yvrukok>
Contact your trainer directly to schedule your remaining sessions, or visit your trainer's booking page.
</p> ` })}`}${scheduled.length > 0 && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-7yvrukok": true }, { "default": async ($$result3) => renderTemplate` <div class="section-label" data-astro-cid-7yvrukok>Scheduled (${scheduled.length})</div> ${scheduled.map((c) => renderTemplate`<div class="credit-card" data-astro-cid-7yvrukok> <div class="credit-info" data-astro-cid-7yvrukok> <div data-astro-cid-7yvrukok>${c.session_type?.name ?? "Session"}</div> <div class="credit-meta" data-astro-cid-7yvrukok>${c.session_type?.duration_min ?? "—"} min</div> </div> <span class="status-badge badge-scheduled" data-astro-cid-7yvrukok>Scheduled</span> </div>`)}` })}`}${used.length > 0 && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-7yvrukok": true }, { "default": async ($$result3) => renderTemplate` <div class="section-label" style="margin-top:16px" data-astro-cid-7yvrukok>Completed (${used.length})</div> ${used.map((c) => renderTemplate`<div class="credit-card" style="opacity:.5" data-astro-cid-7yvrukok> <div class="credit-info" data-astro-cid-7yvrukok> <div data-astro-cid-7yvrukok>${c.session_type?.name ?? "Session"}</div> </div> <span class="status-badge badge-used" data-astro-cid-7yvrukok>Used</span> </div>`)}` })}`}${credits.length === 0 && renderTemplate`<p class="empty" data-astro-cid-7yvrukok>No session credits found for this link.</p>`}` })}`} </div> </body></html>`;
}, "/Users/bobanpepic/trainedby/src/pages/my-bookings.astro", void 0);
const $$file = "/Users/bobanpepic/trainedby/src/pages/my-bookings.astro";
const $$url = "/my-bookings";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$MyBookings,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
