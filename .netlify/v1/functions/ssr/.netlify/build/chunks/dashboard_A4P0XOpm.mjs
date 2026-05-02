/* empty css               */
import { c as createComponent } from './astro-component_w8h7bBB0.mjs';
import { r as renderTemplate, l as defineScriptVars, m as maybeRenderHead, f as addAttribute, h as renderComponent, k as Fragment } from './ssr-function_CLQsF_mO.mjs';
import { g as getLocale, $ as $$Base, t } from './Base_i0jskCET.mjs';
import { g as getMarket } from './market_dK7R5WHH.mjs';
import { createClient } from '@supabase/supabase-js';

var __freeze$1 = Object.freeze;
var __defProp$1 = Object.defineProperty;
var __template$1 = (cooked, raw) => __freeze$1(__defProp$1(cooked, "raw", { value: __freeze$1(cooked.slice()) }));
var _a$1;
const $$ProfileCompleteness = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$ProfileCompleteness;
  const { score, fields, plan, slug } = Astro2.props;
  const ssrMode = !(score === 0 && fields.length === 0);
  const circumference = 113.1;
  const dashoffset = circumference - score / 100 * circumference;
  const ringStroke = score === 100 ? "#00C853" : score >= 70 ? "#FF5C00" : score >= 50 ? "#22c55e" : "#FF5C00";
  const statusMsg = score < 50 ? "Complete your profile to get discovered" : score < 70 ? "You're on your way — keep going" : score < 100 ? "Almost there — looking great" : "Perfect profile — share it!";
  const showUpgradeNudge = score >= 70 && score < 100 && plan === "free";
  const showShare = score === 100;
  return renderTemplate(_a$1 || (_a$1 = __template$1(["", "<script>(function(){", "\nfunction togglePCDetails() {\n  const details = document.getElementById('pc-details');\n  const chevron = document.getElementById('pc-chevron');\n  if (!details) return;\n  const isHidden = details.classList.toggle('hidden');\n  if (chevron) {\n    chevron.style.transform = isHidden ? '' : 'rotate(180deg)';\n  }\n}\n\nfunction shareProfile() {\n  const url = window.location.origin + '/' + slug;\n  if (navigator.share) {\n    navigator.share({ title: 'My TrainedBy Profile', url });\n  } else {\n    navigator.clipboard?.writeText(url).catch(() => {});\n  }\n}\n})();<\/script>"])), ssrMode ? renderTemplate`${maybeRenderHead()}<div id="profile-completeness" class="pc-widget" data-astro-cid-nf3zlqki><div class="pc-header" data-astro-cid-nf3zlqki><div class="pc-ring-wrap" data-astro-cid-nf3zlqki><svg class="pc-ring" viewBox="0 0 44 44" fill="none" data-astro-cid-nf3zlqki><circle cx="22" cy="22" r="18" stroke="rgba(255,255,255,0.08)" stroke-width="4" data-astro-cid-nf3zlqki></circle><circle id="pc-ring-fill" cx="22" cy="22" r="18"${addAttribute(ringStroke, "stroke")} stroke-width="4" stroke-linecap="round" stroke-dasharray="113.1"${addAttribute(dashoffset, "stroke-dashoffset")} transform="rotate(-90 22 22)" style="transition: stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" data-astro-cid-nf3zlqki></circle></svg><span id="pc-pct" class="pc-pct-label" data-astro-cid-nf3zlqki>${score}%</span></div><div class="pc-title-block" data-astro-cid-nf3zlqki><div class="pc-title" data-astro-cid-nf3zlqki>Profile Strength</div><div id="pc-status" class="pc-status" data-astro-cid-nf3zlqki>${statusMsg}</div></div><button class="pc-toggle" onclick="togglePCDetails()" aria-label="Toggle details" data-astro-cid-nf3zlqki><svg id="pc-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-astro-cid-nf3zlqki><path d="M6 9l6 6 6-6" data-astro-cid-nf3zlqki></path></svg></button></div><div id="pc-details" class="pc-details hidden" data-astro-cid-nf3zlqki><div id="pc-items" class="pc-items" data-astro-cid-nf3zlqki>${fields.map((field) => renderTemplate`<a${addAttribute(field.done ? "#" : field.action, "href")}${addAttribute(`pc-item${field.done ? " done" : ""}`, "class")}${addAttribute(field.done ? "event.preventDefault()" : void 0, "onclick")} data-astro-cid-nf3zlqki><div class="pc-check" data-astro-cid-nf3zlqki><svg class="pc-check-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" data-astro-cid-nf3zlqki><path d="M20 6L9 17l-5-5" data-astro-cid-nf3zlqki></path></svg><span class="pc-check-empty" style="width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.2)" data-astro-cid-nf3zlqki></span></div><span class="pc-item-label" data-astro-cid-nf3zlqki>${field.label}</span><span class="pc-item-pts" data-astro-cid-nf3zlqki>${field.done ? "✓" : `+${field.pts}pts`}</span></a>`)}</div>${showUpgradeNudge && renderTemplate`<div class="pc-upgrade-nudge" data-astro-cid-nf3zlqki><span class="pc-nudge-text" data-astro-cid-nf3zlqki>Upgrade to Pro to unlock digital product sales</span><a href="/pricing" class="pc-nudge-btn" data-astro-cid-nf3zlqki>Upgrade →</a></div>`}${showShare && renderTemplate`<button onclick="shareProfile()" class="pc-share-btn" data-astro-cid-nf3zlqki>Share your profile</button>`}</div></div>` : renderTemplate`<div id="profile-completeness" class="pc-widget hidden" data-astro-cid-nf3zlqki><div class="pc-header" data-astro-cid-nf3zlqki><div class="pc-ring-wrap" data-astro-cid-nf3zlqki><svg class="pc-ring" viewBox="0 0 44 44" fill="none" data-astro-cid-nf3zlqki><circle cx="22" cy="22" r="18" stroke="rgba(255,255,255,0.08)" stroke-width="4" data-astro-cid-nf3zlqki></circle><circle id="pc-ring-fill" cx="22" cy="22" r="18" stroke="#FF5C00" stroke-width="4" stroke-linecap="round" stroke-dasharray="113.1" stroke-dashoffset="113.1" transform="rotate(-90 22 22)" style="transition: stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" data-astro-cid-nf3zlqki></circle></svg><span id="pc-pct" class="pc-pct-label" data-astro-cid-nf3zlqki>0%</span></div><div class="pc-title-block" data-astro-cid-nf3zlqki><div class="pc-title" data-astro-cid-nf3zlqki>Profile Strength</div><div id="pc-status" class="pc-status" data-astro-cid-nf3zlqki>Loading...</div></div><button class="pc-toggle" onclick="togglePCDetails()" aria-label="Toggle details" data-astro-cid-nf3zlqki><svg id="pc-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-astro-cid-nf3zlqki><path d="M6 9l6 6 6-6" data-astro-cid-nf3zlqki></path></svg></button></div><div id="pc-details" class="pc-details hidden" data-astro-cid-nf3zlqki><div id="pc-items" class="pc-items" data-astro-cid-nf3zlqki></div><div id="pc-upgrade-nudge" class="pc-upgrade-nudge hidden" data-astro-cid-nf3zlqki><span class="pc-nudge-text" data-astro-cid-nf3zlqki>Upgrade to Pro to unlock digital product sales</span><a href="/pricing" class="pc-nudge-btn" data-astro-cid-nf3zlqki>Upgrade →</a></div></div></div>`, defineScriptVars({ slug }));
}, "/Users/bobanpepic/trainedby/src/components/ProfileCompleteness.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Dashboard = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Dashboard;
  const market = getMarket(Astro2.url.hostname);
  const locale = getLocale(Astro2.request);
  const SUPABASE_ANON_KEY = "";
  const ANON_KEY = "";
  let ssrScore = 0;
  let ssrFields = [];
  let ssrPlan = "free";
  let ssrSlug = "";
  let bookingSetupSteps = [];
  let bookingReady = false;
  let bookings = [];
  const cookieHeader = Astro2.request.headers.get("cookie") || "";
  const tbSession = cookieHeader.split(";").map((c) => c.trim()).find((c) => c.startsWith("tb_session="))?.slice("tb_session=".length);
  if (tbSession) {
    try {
      const svc = createClient(
        undefined                            ,
        undefined                                         
      );
      const { data: link } = await svc.from("magic_links").select("trainer_id").eq("token", tbSession).eq("used", false).gt("expires_at", (/* @__PURE__ */ new Date()).toISOString()).single();
      if (link?.trainer_id) {
        const [{ data: trainer }, { count: pkgCount }, { count: sessionTypeCount }, { count: availabilityCount }, { data: bookingsData }] = await Promise.all([
          svc.from("trainers").select("avatar_url, bio, instagram_handle, reps_verified, verification_status, plan, slug, stripe_connect_onboarded").eq("id", link.trainer_id).single(),
          svc.from("session_packages").select("id", { count: "exact", head: true }).eq("trainer_id", link.trainer_id),
          svc.from("session_types").select("id", { count: "exact", head: true }).eq("trainer_id", link.trainer_id).eq("is_active", true),
          svc.from("trainer_availability").select("id", { count: "exact", head: true }).eq("trainer_id", link.trainer_id),
          svc.from("bookings").select("id, consumer_name, consumer_email, scheduled_at, duration_min, amount_cents, status, session_type:session_types(name)").eq("trainer_id", link.trainer_id).in("status", ["confirmed", "cancelled", "refunded", "completed"]).order("scheduled_at", { ascending: false }).limit(50)
        ]);
        if (trainer) {
          ssrPlan = trainer.plan || "free";
          ssrSlug = trainer.slug || "";
          bookings = bookingsData ?? [];
          const certVerified = trainer.reps_verified === true || trainer.verification_status === "verified";
          const FIELDS = [
            { key: "avatar_url", label: "Profile photo", pts: 20, done: !!trainer.avatar_url, action: "/edit" },
            { key: "bio", label: "Bio (50+ characters)", pts: 20, done: !!(trainer.bio && trainer.bio.length > 50), action: "/edit" },
            { key: "instagram_handle", label: "Instagram handle", pts: 15, done: !!trainer.instagram_handle, action: "/edit" },
            { key: "packages", label: "At least 1 package", pts: 20, done: (pkgCount ?? 0) >= 1, action: "/edit" },
            { key: "cert_verified", label: "Certification verified", pts: 10, done: certVerified, action: "/edit" }
          ];
          const totalPts = FIELDS.reduce((s, f) => s + f.pts, 0);
          const raw = FIELDS.filter((f) => f.done).reduce((sum, f) => sum + f.pts, 0);
          ssrScore = Math.round(raw / totalPts * 100);
          ssrFields = FIELDS;
          bookingSetupSteps = [
            { label: "Connect your bank (Stripe)", done: !!trainer.stripe_connect_onboarded, action: "/dashboard?stripe=start" },
            { label: "Add at least one session type", done: (sessionTypeCount ?? 0) >= 1, action: "/edit?tab=sessions" },
            { label: "Set your availability", done: (availabilityCount ?? 0) >= 1, action: "/edit?tab=availability" }
          ];
          bookingReady = bookingSetupSteps.every((s) => s.done);
        }
      }
    } catch (e) {
      console.error("[SSR ProfileCompleteness]", e);
    }
  }
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": `Dashboard - ${market.brandName}`, "description": `Your ${market.brandName} trainer dashboard. Manage leads, analytics, and your profile.`, "data-astro-cid-3nssi2tu": true }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template(["    ", `<nav class="dash-tabs" id="dash-tabs" data-astro-cid-3nssi2tu> <div class="dash-tabs-inner" data-astro-cid-3nssi2tu> <a href="/" class="tabs-logo" data-astro-cid-3nssi2tu>TrainedBy</a> <div class="tabs-list" data-astro-cid-3nssi2tu> <a href="/dashboard" class="tab-item active" data-astro-cid-3nssi2tu>Overview</a> <a href="/edit" class="tab-item" data-astro-cid-3nssi2tu>Profile</a> <a href="/pricing" class="tab-item" data-astro-cid-3nssi2tu>Upgrade</a> </div> <div class="tabs-right" data-astro-cid-3nssi2tu> <a id="tab-view-link" href="#" class="tab-view-profile" data-astro-cid-3nssi2tu>View my profile →</a> <div class="tabs-avatar" id="tab-avatar-initials" data-astro-cid-3nssi2tu>TB</div> </div> </div> </nav> <div class="dash-wrap" data-astro-cid-3nssi2tu> <!-- Header --> <div class="dash-header" data-astro-cid-3nssi2tu> <a href="/" class="dash-logo" data-astro-cid-3nssi2tu> <svg width="26" height="26" viewBox="0 0 32 32" data-astro-cid-3nssi2tu><rect width="32" height="32" rx="8" fill="#1A1411" data-astro-cid-3nssi2tu></rect><text x="16" y="23" font-family="DM Sans,Arial,sans-serif" font-size="14" font-weight="800" text-anchor="middle" fill="white" data-astro-cid-3nssi2tu>TB</text></svg>
Dashboard
</a> <div class="header-nav" data-astro-cid-3nssi2tu> <a href="/edit" class="nav-edit" data-astro-cid-3nssi2tu>Edit</a> <a id="view-link" href="#" class="nav-view" data-astro-cid-3nssi2tu>View Profile</a> </div> </div> <!-- Loading --> <div id="dash-loading" style="text-align:center;padding:60px 0;" data-astro-cid-3nssi2tu> <div style="display:flex;align-items:center;justify-content:center;gap:8px;" data-astro-cid-3nssi2tu> <div style="width:8px;height:8px;border-radius:50%;background:var(--brand);animation:pulse 1.2s ease-in-out infinite;" data-astro-cid-3nssi2tu></div> <div style="width:8px;height:8px;border-radius:50%;background:var(--brand);animation:pulse 1.2s ease-in-out infinite;animation-delay:0.2s;" data-astro-cid-3nssi2tu></div> <div style="width:8px;height:8px;border-radius:50%;background:var(--brand);animation:pulse 1.2s ease-in-out infinite;animation-delay:0.4s;" data-astro-cid-3nssi2tu></div> </div> </div> <!-- Auth gate --> <div id="dash-auth" class="hidden" style="text-align:center;padding:60px 0;" data-astro-cid-3nssi2tu> <h2 style="font-family:'Manrope',sans-serif;font-size:20px;font-weight:800;margin-bottom:8px;" data-astro-cid-3nssi2tu>Sign in to view your dashboard</h2> <p style="font-size:14px;color:var(--text-muted);margin-bottom:24px;" data-astro-cid-3nssi2tu>Access your leads, analytics, and profile settings.</p> <a href="/edit" style="display:inline-block;padding:14px 28px;border-radius:12px;background:var(--brand);color:#fff;text-decoration:none;font-family:'Manrope',sans-serif;font-size:14px;font-weight:700;" data-astro-cid-3nssi2tu>Sign In →</a> </div> <!-- Dashboard content --> <div id="dash-content" class="hidden" data-astro-cid-3nssi2tu> <!-- Greeting --> <div class="trainer-greeting" data-astro-cid-3nssi2tu> <div class="greeting-row" data-astro-cid-3nssi2tu> <img id="dash-avatar" class="greeting-avatar" src="" alt="Avatar" data-astro-cid-3nssi2tu> <div data-astro-cid-3nssi2tu> <div class="greeting-name" id="dash-name" data-astro-cid-3nssi2tu>Loading...</div> <div class="greeting-sub" id="dash-sub" data-astro-cid-3nssi2tu>`, '</div> </div> </div> <div class="url-bar" data-astro-cid-3nssi2tu> <span class="url-bar-text" id="dash-url" data-astro-cid-3nssi2tu>...</span> <button class="url-copy-btn" onclick="copyUrl()" data-astro-cid-3nssi2tu>Copy Link</button> </div> </div> <!-- Profile Completeness Widget --> ', " <!-- Booking Setup Card (only shown when setup is incomplete) --> ", ' <!-- Stats --> <div class="stats-section" data-astro-cid-3nssi2tu> <div class="stats-section-title" data-astro-cid-3nssi2tu>This Week</div> <div class="stats-grid" data-astro-cid-3nssi2tu> <div class="stat-card brand-card" data-astro-cid-3nssi2tu> <div class="stat-card-icon" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-3nssi2tu><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" data-astro-cid-3nssi2tu></path><circle cx="9" cy="7" r="4" data-astro-cid-3nssi2tu></circle><path d="M23 21v-2a4 4 0 00-3-3.87" data-astro-cid-3nssi2tu></path><path d="M16 3.13a4 4 0 010 7.75" data-astro-cid-3nssi2tu></path></svg> </div> <div class="stat-card-value" id="stat-leads" data-astro-cid-3nssi2tu> - </div> <div class="stat-card-label" data-astro-cid-3nssi2tu>', '</div> <div class="stat-card-change up" id="stat-leads-change" data-astro-cid-3nssi2tu></div> </div> <div class="stat-card" data-astro-cid-3nssi2tu> <div class="stat-card-icon" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-3nssi2tu><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" data-astro-cid-3nssi2tu></path><circle cx="12" cy="12" r="3" data-astro-cid-3nssi2tu></circle></svg> </div> <div class="stat-card-value" id="stat-views" data-astro-cid-3nssi2tu> - </div> <div class="stat-card-label" data-astro-cid-3nssi2tu>', '</div> <div class="stat-card-change up" id="stat-views-change" data-astro-cid-3nssi2tu></div> </div> <div class="stat-card" data-astro-cid-3nssi2tu> <div class="stat-card-icon" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-3nssi2tu><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" data-astro-cid-3nssi2tu></path></svg> </div> <div class="stat-card-value" id="stat-wa-taps" data-astro-cid-3nssi2tu> - </div> <div class="stat-card-label" data-astro-cid-3nssi2tu>', '</div> <div class="stat-card-change up" id="stat-wa-change" data-astro-cid-3nssi2tu></div> </div> <div class="stat-card" data-astro-cid-3nssi2tu> <div class="stat-card-icon" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-3nssi2tu><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" data-astro-cid-3nssi2tu></polyline></svg> </div> <div class="stat-card-value" id="stat-assess" data-astro-cid-3nssi2tu> - </div> <div class="stat-card-label" data-astro-cid-3nssi2tu>Assessments</div> <div class="stat-card-change up" id="stat-assess-change" data-astro-cid-3nssi2tu></div> </div> </div> </div> <!-- WHOOP-style Actionable Insight Banner --> <div id="insight-banner" style="display:none;margin:16px 0;background:linear-gradient(135deg,rgba(255,92,0,0.10),rgba(255,92,0,0.04));border:1px solid rgba(255,92,0,0.25);border-radius:14px;padding:14px 16px;" data-astro-cid-3nssi2tu> <div style="display:flex;align-items:flex-start;gap:10px;" data-astro-cid-3nssi2tu> <div style="width:32px;height:32px;border-radius:8px;background:rgba(255,92,0,0.15);border:1px solid rgba(255,92,0,0.25);display:flex;align-items:center;justify-content:center;flex-shrink:0;" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF5C00" stroke-width="2.5" data-astro-cid-3nssi2tu><circle cx="12" cy="12" r="10" data-astro-cid-3nssi2tu></circle><line x1="12" y1="8" x2="12" y2="12" data-astro-cid-3nssi2tu></line><line x1="12" y1="16" x2="12.01" y2="16" data-astro-cid-3nssi2tu></line></svg> </div> <div data-astro-cid-3nssi2tu> <div style="font-size:11px;font-weight:700;color:rgba(255,92,0,0.9);letter-spacing:0.05em;text-transform:uppercase;margin-bottom:3px;" data-astro-cid-3nssi2tu>Insight</div> <div id="insight-text" style="font-size:13px;color:rgba(255,255,255,0.85);line-height:1.5;" data-astro-cid-3nssi2tu></div> <div id="insight-action" style="margin-top:8px;" data-astro-cid-3nssi2tu></div> </div> </div> </div> <!-- Views chart --> <div class="chart-section" data-astro-cid-3nssi2tu> <div class="chart-header" data-astro-cid-3nssi2tu> <span class="chart-title" data-astro-cid-3nssi2tu>', '</span> <select class="chart-period-select" onchange="loadChart(this.value)" data-astro-cid-3nssi2tu> <option value="7" data-astro-cid-3nssi2tu>Last 7 days</option> <option value="14" data-astro-cid-3nssi2tu>Last 14 days</option> <option value="30" data-astro-cid-3nssi2tu>Last 30 days</option> </select> </div> <div class="chart-area" data-astro-cid-3nssi2tu> <div class="chart-bars" id="chart-bars" data-astro-cid-3nssi2tu></div> </div> <div class="chart-labels" id="chart-labels" data-astro-cid-3nssi2tu></div> </div> <!-- Leads --> <div class="leads-section" data-astro-cid-3nssi2tu> <div class="leads-header" data-astro-cid-3nssi2tu> <span class="leads-title" data-astro-cid-3nssi2tu>', '</span> <span class="leads-count" id="leads-total-badge" data-astro-cid-3nssi2tu>0</span> </div> <div id="leads-list" data-astro-cid-3nssi2tu> <div class="empty-state" data-astro-cid-3nssi2tu> <div class="empty-state-icon" data-astro-cid-3nssi2tu> <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" data-astro-cid-3nssi2tu><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" data-astro-cid-3nssi2tu></path><circle cx="9" cy="7" r="4" data-astro-cid-3nssi2tu></circle><path d="M23 21v-2a4 4 0 00-3-3.87" data-astro-cid-3nssi2tu></path><path d="M16 3.13a4 4 0 010 7.75" data-astro-cid-3nssi2tu></path></svg> </div> <div class="empty-state-text" data-astro-cid-3nssi2tu>No leads yet - share your profile link to get started.</div> </div> </div> </div> <!-- Onboarding Checklist --> <div class="checklist-section" id="checklist-section" data-astro-cid-3nssi2tu> <div class="checklist-title" data-astro-cid-3nssi2tu>Getting Started</div> <div id="checklist-list" data-astro-cid-3nssi2tu></div> </div> <!-- Income Streams (launch version: sessions only) --> <div class="income-section" id="income-section" data-astro-cid-3nssi2tu> <div class="stats-section-title" style="margin-bottom:14px" data-astro-cid-3nssi2tu>Your Income</div> <div class="income-grid" id="income-grid" data-astro-cid-3nssi2tu> <div class="income-stream-card active" data-astro-cid-3nssi2tu> <div class="income-stream-icon" data-astro-cid-3nssi2tu>🏋️</div> <div class="income-stream-label" data-astro-cid-3nssi2tu>Sessions</div> <div class="income-stream-value" id="is-sessions" data-astro-cid-3nssi2tu>Active</div> <div class="income-stream-sub" data-astro-cid-3nssi2tu>Your core training income</div> </div> </div> </div> <!-- Bookings Section --> <div class="leads-section" id="bookings-section" data-astro-cid-3nssi2tu> <div class="stats-section-title" style="margin-bottom:14px" data-astro-cid-3nssi2tu>Your Bookings</div> ', ` </div> <!-- Generate Training Plan - Pro Feature Card --> <div class="checklist-section" id="generate-plan-section" style="display:none" data-astro-cid-3nssi2tu> <div class="checklist-title" style="display:flex;align-items:center;gap:8px;" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF5C00" stroke-width="2" data-astro-cid-3nssi2tu><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" data-astro-cid-3nssi2tu></path><polyline points="14 2 14 8 20 8" data-astro-cid-3nssi2tu></polyline><line x1="16" y1="13" x2="8" y2="13" data-astro-cid-3nssi2tu></line><line x1="16" y1="17" x2="8" y2="17" data-astro-cid-3nssi2tu></line><polyline points="10 9 9 9 8 9" data-astro-cid-3nssi2tu></polyline></svg>
Generate a Training Plan
</div> <div style="font-size:13px;color:var(--text-muted);margin-bottom:16px;line-height:1.6;" data-astro-cid-3nssi2tu>
Build a personalised training plan for a client in 30 seconds. Send it as a PDF or share the link directly.
</div> <div style="display:flex;flex-direction:column;gap:10px;" data-astro-cid-3nssi2tu> <div class="field" style="margin-bottom:0" data-astro-cid-3nssi2tu> <label style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.05em;" data-astro-cid-3nssi2tu>Client goal</label> <input type="text" id="plan-goal" placeholder="e.g. Lose 8kg in 12 weeks" style="background:var(--surface-3);border:1px solid var(--border);border-radius:10px;padding:10px 14px;color:var(--text);font-size:14px;width:100%;outline:none;font-family:'Inter',sans-serif;" data-astro-cid-3nssi2tu> </div> <div class="field" style="margin-bottom:0" data-astro-cid-3nssi2tu> <label style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.05em;" data-astro-cid-3nssi2tu>Sessions per week</label> <div style="display:flex;gap:8px;" data-astro-cid-3nssi2tu> <button class="toggle-pill active" id="plan-freq-2" onclick="setPlanFreq(2)" style="flex:1;padding:8px;border-radius:8px;background:var(--surface-3);border:1px solid var(--brand);color:var(--text);font-size:13px;font-weight:700;cursor:pointer;" data-astro-cid-3nssi2tu>2×</button> <button class="toggle-pill" id="plan-freq-3" onclick="setPlanFreq(3)" style="flex:1;padding:8px;border-radius:8px;background:var(--surface-3);border:1px solid var(--border);color:var(--text-muted);font-size:13px;font-weight:700;cursor:pointer;" data-astro-cid-3nssi2tu>3×</button> <button class="toggle-pill" id="plan-freq-4" onclick="setPlanFreq(4)" style="flex:1;padding:8px;border-radius:8px;background:var(--surface-3);border:1px solid var(--border);color:var(--text-muted);font-size:13px;font-weight:700;cursor:pointer;" data-astro-cid-3nssi2tu>4×</button> <button class="toggle-pill" id="plan-freq-5" onclick="setPlanFreq(5)" style="flex:1;padding:8px;border-radius:8px;background:var(--surface-3);border:1px solid var(--border);color:var(--text-muted);font-size:13px;font-weight:700;cursor:pointer;" data-astro-cid-3nssi2tu>5×</button> </div> </div> <div class="field" style="margin-bottom:0" data-astro-cid-3nssi2tu> <label style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.05em;" data-astro-cid-3nssi2tu>Duration</label> <div style="display:flex;gap:8px;" data-astro-cid-3nssi2tu> <button class="toggle-pill active" id="plan-dur-4" onclick="setPlanDur(4)" style="flex:1;padding:8px;border-radius:8px;background:var(--surface-3);border:1px solid var(--brand);color:var(--text);font-size:13px;font-weight:700;cursor:pointer;" data-astro-cid-3nssi2tu>4 wk</button> <button class="toggle-pill" id="plan-dur-8" onclick="setPlanDur(8)" style="flex:1;padding:8px;border-radius:8px;background:var(--surface-3);border:1px solid var(--border);color:var(--text-muted);font-size:13px;font-weight:700;cursor:pointer;" data-astro-cid-3nssi2tu>8 wk</button> <button class="toggle-pill" id="plan-dur-12" onclick="setPlanDur(12)" style="flex:1;padding:8px;border-radius:8px;background:var(--surface-3);border:1px solid var(--border);color:var(--text-muted);font-size:13px;font-weight:700;cursor:pointer;" data-astro-cid-3nssi2tu>12 wk</button> </div> </div> <button id="generate-plan-btn" onclick="generatePlan()" style="background:var(--brand);color:#fff;border:none;border-radius:12px;padding:12px 20px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-astro-cid-3nssi2tu><polygon points="5 3 19 12 5 21 5 3" data-astro-cid-3nssi2tu></polygon></svg>
Generate Plan
</button> <div id="plan-result" style="display:none;background:var(--surface-3);border:1px solid var(--border);border-radius:12px;padding:14px;font-size:13px;color:var(--text-muted);line-height:1.6;" data-astro-cid-3nssi2tu></div> </div> </div> <!-- AI Assistant Channel Settings (Pro only) --> <div class="checklist-section" id="ai-settings-section" style="display:none" data-astro-cid-3nssi2tu> <div class="checklist-title" data-astro-cid-3nssi2tu>`, '</div> <div style="font-size:13px;color:var(--text-muted);margin-bottom:16px;" data-astro-cid-3nssi2tu>', `</div> <!-- Channel selector --> <div style="display:flex;gap:10px;margin-bottom:20px;" id="ai-channel-selector" data-astro-cid-3nssi2tu> <button class="ai-channel-btn active" data-channel="dashboard" onclick="selectChannel('dashboard')" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-3nssi2tu><rect x="3" y="3" width="7" height="7" data-astro-cid-3nssi2tu></rect><rect x="14" y="3" width="7" height="7" data-astro-cid-3nssi2tu></rect><rect x="14" y="14" width="7" height="7" data-astro-cid-3nssi2tu></rect><rect x="3" y="14" width="7" height="7" data-astro-cid-3nssi2tu></rect></svg> `, ` </button> <button class="ai-channel-btn" data-channel="whatsapp" onclick="selectChannel('whatsapp')" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-3nssi2tu><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" data-astro-cid-3nssi2tu></path></svg> `, ` </button> <button class="ai-channel-btn" data-channel="telegram" onclick="selectChannel('telegram')" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-3nssi2tu><line x1="22" y1="2" x2="11" y2="13" data-astro-cid-3nssi2tu></line><polygon points="22 2 15 22 11 13 2 9 22 2" data-astro-cid-3nssi2tu></polygon></svg> `, ' </button> </div> <!-- Dashboard info --> <div id="ai-channel-dashboard" class="ai-channel-info" data-astro-cid-3nssi2tu> <p style="font-size:13px;color:var(--text-muted);" data-astro-cid-3nssi2tu>Your AI assistant is available in the AI Coach tab below. Tap it to start a conversation.</p> </div> <!-- WhatsApp setup --> <div id="ai-channel-whatsapp" class="ai-channel-info" style="display:none" data-astro-cid-3nssi2tu> <p style="font-size:13px;color:var(--text-muted);margin-bottom:12px;" data-astro-cid-3nssi2tu>Your AI assistant will reply to messages sent to the platform WhatsApp number from your registered WhatsApp number.</p> <div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:12px;font-size:13px;" data-astro-cid-3nssi2tu> <div style="color:rgba(255,255,255,0.5);margin-bottom:4px;" data-astro-cid-3nssi2tu>Your registered number</div> <div id="wa-registered-number" style="color:rgba(255,255,255,0.9);font-weight:600;" data-astro-cid-3nssi2tu>Loading...</div> </div> <p style="font-size:12px;color:rgba(255,255,255,0.35);margin-top:10px;" data-astro-cid-3nssi2tu>To change your number, update it in Edit Profile.</p> </div> <!-- Telegram setup --> <div id="ai-channel-telegram" class="ai-channel-info" style="display:none" data-astro-cid-3nssi2tu> <p style="font-size:13px;color:var(--text-muted);margin-bottom:12px;" data-astro-cid-3nssi2tu>Link your Telegram account to talk to your AI assistant there.</p> <div id="tg-linked-state" style="display:none;background:rgba(255,255,255,0.05);border-radius:10px;padding:12px;font-size:13px;" data-astro-cid-3nssi2tu> <div style="color:rgba(255,255,255,0.5);margin-bottom:4px;" data-astro-cid-3nssi2tu>Linked account</div> <div id="tg-username" style="color:rgba(255,255,255,0.9);font-weight:600;" data-astro-cid-3nssi2tu></div> <button onclick="unlinkTelegram()" style="margin-top:10px;font-size:12px;color:rgba(255,92,0,0.8);background:none;border:none;cursor:pointer;padding:0;" data-astro-cid-3nssi2tu>Unlink</button> </div> <div id="tg-unlinked-state" data-astro-cid-3nssi2tu> <button class="btn-primary" onclick="generateTelegramLink()" style="width:100%;margin-top:0;" data-astro-cid-3nssi2tu>\nGenerate Telegram Link\n</button> <div id="tg-link-display" style="display:none;margin-top:12px;background:rgba(255,255,255,0.05);border-radius:10px;padding:12px;" data-astro-cid-3nssi2tu> <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:6px;" data-astro-cid-3nssi2tu>Open this link on your phone:</div> <a id="tg-link-url" href="#" target="_blank" style="font-size:13px;color:#FF5C00;word-break:break-all;" data-astro-cid-3nssi2tu></a> <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:8px;" data-astro-cid-3nssi2tu>Link expires in 10 minutes. Tap it to open Telegram and complete the connection.</div> </div> </div> </div> </div> </div><!-- /dash-content --> </div>  <div class="ai-panel" id="ai-panel" data-astro-cid-3nssi2tu> <div class="ai-panel-header" data-astro-cid-3nssi2tu> <div class="ai-panel-title" data-astro-cid-3nssi2tu> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF5C00" stroke-width="2" data-astro-cid-3nssi2tu><path d="M12 2a10 10 0 110 20A10 10 0 0112 2z" data-astro-cid-3nssi2tu></path><path d="M12 6v6l4 2" data-astro-cid-3nssi2tu></path></svg> ', ` <span class="ai-panel-badge" data-astro-cid-3nssi2tu>Beta</span> </div> <button class="ai-panel-close" onclick="closeAI()" data-astro-cid-3nssi2tu>Done</button> </div> <div class="ai-messages" id="ai-messages" data-astro-cid-3nssi2tu> <div class="ai-welcome" id="ai-welcome" data-astro-cid-3nssi2tu> <div class="ai-welcome-icon" data-astro-cid-3nssi2tu> <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF5C00" stroke-width="1.8" data-astro-cid-3nssi2tu><circle cx="12" cy="12" r="10" data-astro-cid-3nssi2tu></circle><path d="M12 8v4l3 3" data-astro-cid-3nssi2tu></path></svg> </div> <div class="ai-welcome-title" data-astro-cid-3nssi2tu>Hey, I'm your AI coach</div> <div class="ai-welcome-sub" data-astro-cid-3nssi2tu>I know your profile, your market, and your goals. Ask me anything - from writing your bio to building a 12-week programme.</div> </div> </div> <div class="ai-quick-prompts" id="ai-chips" data-astro-cid-3nssi2tu> <button class="ai-chip" onclick="sendChip(this)" data-astro-cid-3nssi2tu>Write my bio</button> <button class="ai-chip" onclick="sendChip(this)" data-astro-cid-3nssi2tu>Build a 12-week plan</button> <button class="ai-chip" onclick="sendChip(this)" data-astro-cid-3nssi2tu>How to get more leads</button> <button class="ai-chip" onclick="sendChip(this)" data-astro-cid-3nssi2tu>Price my packages</button> <button class="ai-chip" onclick="sendChip(this)" data-astro-cid-3nssi2tu>Write a client email</button> <button class="ai-chip" onclick="sendChip(this)" data-astro-cid-3nssi2tu>Nutrition advice</button> </div> <div class="ai-input-row" data-astro-cid-3nssi2tu> <textarea class="ai-input" id="ai-input" placeholder="{t(locale, 'dash.ai_placeholder')}" rows="1" data-astro-cid-3nssi2tu></textarea> <button class="ai-send" id="ai-send" onclick="sendAI()" data-astro-cid-3nssi2tu> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-astro-cid-3nssi2tu><line x1="22" y1="2" x2="11" y2="13" data-astro-cid-3nssi2tu></line><polygon points="22 2 15 22 11 13 2 9 22 2" data-astro-cid-3nssi2tu></polygon></svg> </button> </div> </div>  <nav class="bottom-nav" data-astro-cid-3nssi2tu> <a href="/dashboard" class="bottom-nav-item active" data-astro-cid-3nssi2tu> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" data-astro-cid-3nssi2tu><rect x="3" y="3" width="7" height="7" data-astro-cid-3nssi2tu></rect><rect x="14" y="3" width="7" height="7" data-astro-cid-3nssi2tu></rect><rect x="14" y="14" width="7" height="7" data-astro-cid-3nssi2tu></rect><rect x="3" y="14" width="7" height="7" data-astro-cid-3nssi2tu></rect></svg> <span data-astro-cid-3nssi2tu>`, '</span> </a> <a href="/edit" class="bottom-nav-item" data-astro-cid-3nssi2tu> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" data-astro-cid-3nssi2tu><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" data-astro-cid-3nssi2tu></path><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" data-astro-cid-3nssi2tu></path></svg> <span data-astro-cid-3nssi2tu>', '</span> </a> <button class="bottom-nav-item" onclick="openAI()" style="background:none;border:none;cursor:pointer;" data-astro-cid-3nssi2tu> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" data-astro-cid-3nssi2tu><circle cx="12" cy="12" r="10" data-astro-cid-3nssi2tu></circle><path d="M12 8v4l3 3" data-astro-cid-3nssi2tu></path></svg> <span data-astro-cid-3nssi2tu>', '</span> </button> <a id="nav-view-profile" href="#" class="bottom-nav-item" data-astro-cid-3nssi2tu> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" data-astro-cid-3nssi2tu><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" data-astro-cid-3nssi2tu></path><circle cx="12" cy="12" r="3" data-astro-cid-3nssi2tu></circle></svg> <span data-astro-cid-3nssi2tu>', '</span> </a> <a href="/pricing" class="bottom-nav-item" data-astro-cid-3nssi2tu> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" data-astro-cid-3nssi2tu><line x1="12" y1="1" x2="12" y2="23" data-astro-cid-3nssi2tu></line><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" data-astro-cid-3nssi2tu></path></svg> <span data-astro-cid-3nssi2tu>', '</span> </a> </nav>  <div class="toast" id="toast" data-astro-cid-3nssi2tu></div> <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.min.js" crossorigin="anonymous"></script> <script>(function(){', `
const SUPABASE_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co';
const EDGE_BASE = SUPABASE_URL + '/functions/v1';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.renderPC = function() {}; // widget now server-rendered

let trainer = null;

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = 'toast' + (type ? ' ' + type : '');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== AUTH HELPERS =====
function getAuthToken() {
  const cookies = document.cookie.split(';').map(c => c.trim());
  for (const c of cookies) {
    if (c.startsWith('tb_session=')) return c.slice('tb_session='.length);
  }
  return localStorage.getItem('tb_edit_token');
}
function clearAuthToken() {
  localStorage.removeItem('tb_edit_token');
  document.cookie = 'tb_session=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Strict';
}

async function init() {
  const token = getAuthToken();
  document.getElementById('dash-loading').style.display = 'none';
  if (!token) { document.getElementById('dash-auth').classList.remove('hidden'); return; }

  try {
    const res = await fetch(EDGE_BASE + '/verify-magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token })
    });
    const data = await res.json();
    if (!res.ok || !data.trainer) throw new Error();
    trainer = data.trainer;
    populateDash(trainer);
    loadStats();
    loadLeads();
    loadChart(7);
    buildChecklist(trainer);
    document.getElementById('dash-content').classList.remove('hidden');
  } catch {
    clearAuthToken();
    document.getElementById('dash-auth').classList.remove('hidden');
  }
}

function populateDash(t) {
  document.getElementById('dash-avatar').src = t.avatar_url || '';
  document.getElementById('dash-name').textContent = 'Hey, ' + (t.name?.split(' ')[0] || 'Trainer') + ' 👋';
  document.getElementById('dash-sub').textContent = t.reps_verified ? 'REPs Verified Trainer' : 'Verification Pending';
  const _domain = window.location.hostname;
  const url = _domain + '/' + t.slug;
  document.getElementById('dash-url').textContent = url;
  document.getElementById('view-link').href = '/' + t.slug;
  document.getElementById('nav-view-profile').href = '/' + t.slug;

  // Update desktop tab nav
  const tabViewLink = document.getElementById('tab-view-link');
  if (tabViewLink) tabViewLink.href = '/' + t.slug;
  const tabAvatar = document.getElementById('tab-avatar-initials');
  if (tabAvatar) {
    const initials = (t.name || 'TB').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    tabAvatar.textContent = initials;
  }

  // Referral flywheel
  const refUrl = 'https://' + _domain + '/join?ref=' + t.slug;
  document.getElementById('referral-url-text').textContent = _domain + '/join?ref=' + t.slug;
  const waMsg = encodeURIComponent('Hey! I\\'m using ' + (window.__BRAND__?.name || 'TrainedBy') + ' to manage my PT business. Get your free verified profile here: ' + refUrl);
  document.getElementById('referral-wa-share').href = 'https://wa.me/?text=' + waMsg;
  const refCount = t.referral_count || 0;
  const refTarget = 4;
  const pct = Math.min(100, Math.round((refCount / refTarget) * 100));
  document.getElementById('flywheel-count-label').textContent = refCount + ' of ' + refTarget + ' referrals';
  document.getElementById('flywheel-pct-label').textContent = pct + '% to free Pro';
  document.getElementById('flywheel-fill').style.width = pct + '%';
  const steps = document.getElementById('flywheel-steps').children;
  for (let i = 0; i < steps.length; i++) {
    if (i < refCount) steps[i].classList.add('done');
  }
  if (refCount >= refTarget) {
    document.getElementById('flywheel-reward-text').textContent = '🎉 You\\'ve earned free Pro forever!';
  }

  // Income stream cards - unlock for Pro/Premium
  const isPro = t.plan === 'pro' || t.plan === 'premium';
  if (isPro) {
    document.getElementById('upgrade-banner').style.display = 'none';
    // Removed: affiliate/digital/referral cards no longer exist
    [].forEach(id => {
      const card = document.getElementById(id);
      card.classList.remove('locked');
      card.classList.add('active');
      const lock = card.querySelector('.income-stream-lock');
      if (lock) lock.remove();
      const val = card.querySelector('.income-stream-value');
      if (val) { val.textContent = 'Active'; val.classList.add('green'); }
    });
  }

  // Profile completeness widget
  if (typeof window.renderPC === 'function') window.renderPC(t);

  // Generate Plan - show for Pro trainers
  if (isPro) {
    const planSection = document.getElementById('generate-plan-section');
    if (planSection) planSection.style.display = 'block';
  }

  // AI Assistant settings - show for Pro trainers
  if (isPro) {
    const aiSection = document.getElementById('ai-settings-section');
    if (aiSection) {
      aiSection.style.display = 'block';
      // Set active channel
      const ch = t.assistant_channel || 'dashboard';
      selectChannel(ch, false); // false = don't save to DB
      // Show WhatsApp number
      const waEl = document.getElementById('wa-registered-number');
      if (waEl) waEl.textContent = t.whatsapp || 'Not set - add in Edit Profile';
      // Show Telegram linked state
      if (t.telegram_chat_id) {
        document.getElementById('tg-linked-state').style.display = 'block';
        document.getElementById('tg-unlinked-state').style.display = 'none';
        document.getElementById('tg-username').textContent = t.telegram_username ? '@' + t.telegram_username : 'Linked';
      }
    }
  }
}

// ── Generate Plan ───────────────────────────────────────────────────────────
let planFreq = 2;
let planDur = 4;

window.setPlanFreq = function(n) {
  planFreq = n;
  [2,3,4,5].forEach(v => {
    const btn = document.getElementById('plan-freq-' + v);
    if (btn) {
      btn.style.borderColor = v === n ? 'var(--brand)' : 'var(--border)';
      btn.style.color = v === n ? 'var(--text)' : 'var(--text-muted)';
    }
  });
};

window.setPlanDur = function(n) {
  planDur = n;
  [4,8,12].forEach(v => {
    const btn = document.getElementById('plan-dur-' + v);
    if (btn) {
      btn.style.borderColor = v === n ? 'var(--brand)' : 'var(--border)';
      btn.style.color = v === n ? 'var(--text)' : 'var(--text-muted)';
    }
  });
};

window.generatePlan = async function() {
  const goal = document.getElementById('plan-goal').value.trim();
  if (!goal) { showToast('Enter a client goal first'); return; }

  const btn = document.getElementById('generate-plan-btn');
  const result = document.getElementById('plan-result');
  btn.disabled = true;
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Generating...';
  result.style.display = 'none';

  try {
    const res = await fetch(EDGE_BASE + '/generate-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getAuthToken()
      },
      body: JSON.stringify({
        goal,
        sessions_per_week: planFreq,
        duration_weeks: planDur,
      })
    });
    const data = await res.json();
    if (data.plan) {
      result.style.display = 'block';
      result.innerHTML = '<pre style="white-space:pre-wrap;font-family:inherit;">' + data.plan + '</pre>';
      if (data.share_url) {
        result.innerHTML += '<a href="' + data.share_url + '" target="_blank" style="display:inline-block;margin-top:12px;color:var(--brand);font-size:12px;font-weight:700;">Share plan link →</a>';
      }
    } else {
      showToast('Could not generate plan - try again');
    }
  } catch {
    showToast('Error generating plan');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg> Generate Plan';
  }
};

async function loadStats() {
  try {
    const res = await fetch(EDGE_BASE + '/weekly-stats', {
      headers: { 'Authorization': 'Bearer ' + getAuthToken() }
    });
    const data = await res.json();
    document.getElementById('stat-leads').textContent = data.leads_this_week ?? '0';
    document.getElementById('stat-views').textContent = data.views_this_week ?? '0';
    document.getElementById('stat-wa-taps').textContent = data.wa_taps_this_week ?? '0';
    document.getElementById('stat-assess').textContent = data.assessments_this_week ?? '0';
    if (data.leads_change) {
      const el = document.getElementById('stat-leads-change');
      el.textContent = (data.leads_change > 0 ? '↑' : '↓') + ' ' + Math.abs(data.leads_change) + ' vs last week';
      el.className = 'stat-card-change ' + (data.leads_change > 0 ? 'up' : 'down');
    }
    // WHOOP-style actionable insight
    generateInsight(data);
  } catch { /* silently fail */ }
}

function generateInsight(data) {
  const views = data.views_this_week || 0;
  const leads = data.leads_this_week || 0;
  const waTaps = data.wa_taps_this_week || 0;
  const convRate = views > 0 ? (leads / views * 100).toFixed(1) : 0;
  let text = '';
  let action = '';
  if (views > 20 && leads === 0) {
    text = \`Your profile got <strong>\${views} views</strong> this week but 0 leads. Visitors are interested but not converting.\`;
    action = \`<a href="/edit" style="font-size:12px;font-weight:700;color:var(--brand);text-decoration:none;">→ Add a session package with a clear outcome to convert views into bookings</a>\`;
  } else if (leads > 0 && waTaps === 0) {
    text = \`You got <strong>\${leads} lead\${leads>1?'s':''}</strong> but no WhatsApp taps. Clients filled the form but didn't message you directly.\`;
    action = \`<a href="/edit" style="font-size:12px;font-weight:700;color:var(--brand);text-decoration:none;">→ Make sure your WhatsApp number is visible on your profile</a>\`;
  } else if (views > 0 && convRate > 0) {
    text = \`Your conversion rate is <strong>\${convRate}%</strong> this week (\${leads} lead\${leads>1?'s':''} from \${views} views). \${convRate >= 5 ? 'That\\'s above average - great work.' : 'Industry average is 5-8%. A results guarantee could double this.'}\`;
    action = convRate < 5 ? \`<a href="/edit" style="font-size:12px;font-weight:700;color:var(--brand);text-decoration:none;">→ Add a money-back guarantee to your packages</a>\` : '';
  } else if (views === 0) {
    text = 'Your profile has no views yet this week. Share your profile link to start getting traffic.';
    action = \`<button onclick="copyUrl()" style="font-size:12px;font-weight:700;color:var(--brand);background:none;border:none;cursor:pointer;padding:0;">→ Copy your profile link and share it now</button>\`;
  }
  if (text) {
    document.getElementById('insight-text').innerHTML = text;
    document.getElementById('insight-action').innerHTML = action;
    document.getElementById('insight-banner').style.display = 'block';
  }
}

async function loadLeads() {
  try {
    const { data, error } = await sb.from('leads')
      .select('*').eq('trainer_id', trainer.id)
      .order('created_at', { ascending: false }).limit(10);
    if (error || !data?.length) return;
    document.getElementById('leads-total-badge').textContent = data.length;
    const list = document.getElementById('leads-list');
    list.innerHTML = '';
    data.forEach(lead => {
      const initials = (lead.name || '?').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
      const timeAgo = formatTimeAgo(lead.created_at);
      const typeTag = lead.type === 'assessment' ? 'assessment' : lead.type === 'package' ? 'package' : 'booking';
      const typeLabel = lead.type === 'assessment' ? 'Assessment' : lead.type === 'package' ? 'Package' : 'Booking';
      const waMsg = encodeURIComponent(\`Hi \${lead.name}, I'm \${trainer.name} from \${window.__BRAND__?.name || 'TrainedBy'}. I saw your enquiry and would love to help you reach your fitness goals!\`);
      const waUrl = \`https://wa.me/\${(lead.phone || '').replace(/\\D/g,'')}?text=\${waMsg}\`;
      list.innerHTML += \`
        <div class="lead-item">
          <div class="lead-avatar">\${initials}</div>
          <div>
            <div class="lead-name">\${lead.name || 'Unknown'}</div>
            <div class="lead-meta">\${timeAgo} · \${lead.goal ? lead.goal.replace('_',' ') : 'No goal specified'}</div>
          </div>
          <div class="lead-actions">
            <span class="lead-type-tag \${typeTag}">\${typeLabel}</span>
            \${lead.phone ? \`<a href="\${waUrl}" class="lead-wa-btn" target="_blank" rel="noopener"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>\` : ''}
          </div>
        </div>\`;
    });
  } catch { /* silently fail */ }
}

function loadChart(days) {
  const bars = document.getElementById('chart-bars');
  const labels = document.getElementById('chart-labels');
  bars.innerHTML = ''; labels.innerHTML = '';
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today = new Date();
  const data = Array.from({length: days}, () => Math.floor(Math.random() * 40 + 5));
  const max = Math.max(...data);
  data.forEach((val, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (days - 1 - i));
    const isToday = i === days - 1;
    const pct = Math.max(8, Math.round((val / max) * 88));
    bars.innerHTML += \`<div class="chart-bar \${isToday ? 'today' : ''}" style="height:\${pct}%" title="\${val} views"></div>\`;
    if (days <= 7) labels.innerHTML += \`<div class="chart-label">\${dayNames[d.getDay()]}</div>\`;
    else if (i % 3 === 0) labels.innerHTML += \`<div class="chart-label" style="flex:3;">\${d.getDate()}/\${d.getMonth()+1}</div>\`;
  });
}

function buildChecklist(t) {
  const items = [
    { label: 'Profile photo added', sub: 'A photo increases leads by 5×', done: !!t.avatar_url, action: '/edit', actionLabel: 'Add' },
    { label: 'Bio written', sub: 'Tell clients what makes you different', done: !!(t.bio && t.bio.length > 30), action: '/edit', actionLabel: 'Write' },
    { label: 'REPs UAE verified', sub: 'Get the verified badge on your profile', done: !!t.reps_verified, action: '/edit', actionLabel: 'Verify' },
    { label: 'Session packages added', sub: 'Show clients your rates', done: !!(t.packages && t.packages.length > 0), action: '/edit', actionLabel: 'Add' },
    { label: 'Instagram connected', sub: 'Link your social media', done: !!t.instagram, action: '/edit', actionLabel: 'Connect' },
    { label: 'Profile shared', sub: 'Share your link on Instagram bio', done: false, action: null, actionLabel: null }
  ];
  const list = document.getElementById('checklist-list');
  const allDone = items.every(i => i.done);
  if (allDone) { document.getElementById('checklist-section').style.display = 'none'; return; }
  items.forEach(item => {
    list.innerHTML += \`
      <div class="checklist-item \${item.done ? 'done' : ''}">
        <div class="check-circle \${item.done ? 'done' : ''}">
          \${item.done ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : ''}
        </div>
        <div>
          <div class="checklist-text">\${item.label}</div>
          <div class="checklist-sub">\${item.sub}</div>
        </div>
        \${!item.done && item.action ? \`<a href="\${item.action}" class="checklist-action">\${item.actionLabel}</a>\` : ''}
      </div>\`;
  });
}

function copyUrl() {
  navigator.clipboard.writeText('https://' + window.location.hostname + '/' + trainer.slug).then(() => showToast('Link copied!', 'success'));
}
function copyReferral() {
  navigator.clipboard.writeText('https://' + window.location.hostname + '/join?ref=' + trainer.slug).then(() => showToast('Referral link copied!', 'success'));
}

async function startUpgrade() {
  try {
    const res = await fetch(EDGE_BASE + '/payment-router', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getAuthToken() },
      body: JSON.stringify({
        trainer_id: trainer.id,
        plan: 'pro',
        billing: 'monthly',
        success_url: location.origin + '/dashboard?upgraded=1',
        cancel_url: location.origin + '/dashboard',
      })
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || 'Could not start checkout.', 'error'); return; }
    if (data.provider === 'stripe' && data.checkout_url) {
      location.href = data.checkout_url;
    } else if (data.provider === 'razorpay') {
      await openRazorpay(data);
    } else {
      showToast('Could not start checkout. Please try again.', 'error');
    }
  } catch (err) {
    if (err && err.message && err.message.includes('razorpay')) {
      showToast('Payment provider unavailable. Please try again.', 'error');
    } else {
      showToast('Could not start checkout.', 'error');
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

function formatTimeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff/60) + 'm ago';
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
  return Math.floor(diff/86400) + 'd ago';
}

// Check for upgrade success
if (new URLSearchParams(location.search).get('upgraded') === '1') {
  showToast('Welcome to Pro! 🔥', 'success');
  history.replaceState({}, '', '/dashboard');
}

init();

// Handle Stripe Connect redirect params
(function handleStripeParam() {
  const params = new URLSearchParams(window.location.search);
  const stripeParam = params.get('stripe');
  if (!stripeParam) return;

  const token = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('tb_session='))?.slice('tb_session='.length);
  if (!token) return;

  const FUNCTIONS_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1';

  if (stripeParam === 'start') {
    // Initiate Stripe Connect
    fetch(\`\${FUNCTIONS_URL}/connect-stripe\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
      body: JSON.stringify({ trainer_id: trainer?.id }),
    })
    .then(r => r.json())
    .then(d => { if (d.url) window.location.href = d.url; })
    .catch(err => console.error('[connect-stripe]', err));
  }

  if (stripeParam === 'return') {
    // Verify onboarding completion
    fetch(\`\${FUNCTIONS_URL}/connect-stripe-return\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
      body: JSON.stringify({ trainer_id: trainer?.id }),
    })
    .then(r => r.json())
    .then(d => {
      if (d.onboarded) {
        // Clean URL and reload to show updated setup state
        window.history.replaceState({}, '', '/dashboard');
        window.location.reload();
      }
    })
    .catch(err => console.error('[connect-stripe-return]', err));
  }
})();

// ── Support Chatbot Widget ──────────────────────────────────────────────────────────
(function() {
  const SUPPORT_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1/support-agent';
  // ANON_KEY injected via define:vars from frontmatter

  const style = document.createElement('style');
  style.textContent = [
    '.tb-chat-btn{position:fixed;bottom:24px;right:20px;z-index:9999;width:52px;height:52px;border-radius:50%;background:#FF5C00;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(255,92,0,.4);transition:transform .2s,box-shadow .2s}',
    '.tb-chat-btn:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(255,92,0,.5)}',
    '.tb-chat-btn svg{width:24px;height:24px;fill:#fff}',
    '.tb-chat-window{position:fixed;bottom:88px;right:20px;z-index:9998;width:min(360px,calc(100vw - 40px));background:#111;border:1px solid rgba(255,255,255,.1);border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.6);display:none;flex-direction:column;font-family:Inter,sans-serif}',
    '.tb-chat-window.open{display:flex}',
    '.tb-chat-header{padding:14px 16px;background:#FF5C00;display:flex;align-items:center;justify-content:space-between}',
    '.tb-chat-header-title{font-weight:700;font-size:14px;color:#fff}',
    '.tb-chat-header-sub{font-size:11px;color:rgba(255,255,255,.75);margin-top:1px}',
    '.tb-chat-close{background:none;border:none;cursor:pointer;color:#fff;opacity:.7;padding:2px;line-height:1}',
    '.tb-chat-close:hover{opacity:1}',
    '.tb-chat-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;max-height:280px;min-height:120px}',
    '.tb-msg{max-width:85%;padding:10px 13px;border-radius:12px;font-size:13px;line-height:1.5}',
    '.tb-msg.bot{background:#1c1c1c;color:rgba(255,255,255,.9);border-bottom-left-radius:4px;align-self:flex-start}',
    '.tb-msg.user{background:#FF5C00;color:#fff;border-bottom-right-radius:4px;align-self:flex-end}',
    '.tb-msg.typing{opacity:.5;font-style:italic}',
    '.tb-chat-input-row{display:flex;gap:8px;padding:12px 16px;border-top:1px solid rgba(255,255,255,.08);background:#0a0a0a}',
    '.tb-chat-input{flex:1;background:#1c1c1c;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:9px 12px;color:#fff;font-size:13px;outline:none;font-family:inherit}',
    '.tb-chat-input:focus{border-color:rgba(255,92,0,.5)}',
    '.tb-chat-input::placeholder{color:rgba(255,255,255,.3)}',
    '.tb-chat-send{background:#FF5C00;border:none;border-radius:8px;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .2s}',
    '.tb-chat-send:hover{background:#e05200}',
    '.tb-chat-send svg{width:16px;height:16px;fill:#fff}',
    '.tb-chat-send:disabled{opacity:.4;cursor:not-allowed}'
  ].join('');
  document.head.appendChild(style);

  const btn = document.createElement('button');
  btn.className = 'tb-chat-btn';
  btn.title = 'Ask a question';
  btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';

  const win = document.createElement('div');
  win.className = 'tb-chat-window';
  const _bn = window.__BRAND__?.name || 'TrainedBy';
  win.innerHTML = '<div class="tb-chat-header"><div><div class="tb-chat-header-title">' + _bn + ' Support</div><div class="tb-chat-header-sub">Ask me anything about your account</div></div><button class="tb-chat-close" id="tb-close"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button></div><div class="tb-chat-messages" id="tb-msgs"><div class="tb-msg bot">Hey! Ask me anything about ' + _bn + ' - pricing, verification, referrals, or how features work.</div></div><div class="tb-chat-input-row"><input class="tb-chat-input" id="tb-input" placeholder="Ask a question..." maxlength="300"/><button class="tb-chat-send" id="tb-send"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button></div>';

  document.body.appendChild(btn);
  document.body.appendChild(win);

  let open = false, busy = false;

  btn.addEventListener('click', function() {
    open = !open;
    win.classList.toggle('open', open);
    if (open) document.getElementById('tb-input').focus();
  });
  document.getElementById('tb-close').addEventListener('click', function() {
    open = false; win.classList.remove('open');
  });

  async function sendQ() {
    const inp = document.getElementById('tb-input');
    const q = inp.value.trim();
    if (!q || busy) return;
    busy = true; inp.value = '';
    document.getElementById('tb-send').disabled = true;
    const msgs = document.getElementById('tb-msgs');
    msgs.innerHTML += '<div class="tb-msg user">' + q.replace(/</g,'&lt;') + '</div>';
    const typing = document.createElement('div');
    typing.className = 'tb-msg bot typing';
    typing.textContent = 'Thinking...';
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;
    try {
      const res = await fetch(SUPPORT_URL, {
        method: 'POST',
        headers: {'Content-Type':'application/json','Authorization':'Bearer '+ANON_KEY},
        body: JSON.stringify({question: q})
      });
      const data = await res.json();
      typing.className = 'tb-msg bot';
      typing.textContent = data.answer || 'Sorry, I could not find an answer to that.';
    } catch(e) {
      typing.className = 'tb-msg bot';
      typing.textContent = 'Connection error. Please try again.';
    }
    msgs.scrollTop = msgs.scrollHeight;
    busy = false;
    document.getElementById('tb-send').disabled = false;
    document.getElementById('tb-input').focus();
  }

  document.getElementById('tb-send').addEventListener('click', sendQ);
  document.getElementById('tb-input').addEventListener('keydown', function(e) { if(e.key==='Enter') sendQ(); });
})();

// ── Trainer AI Coach ─────────────────────────────────────────────────────────
(function() {
  const AI_URL = EDGE_BASE + '/trainer-assistant';
  let aiHistory = [];
  let aiBusy = false;
  let aiConversationId = 'default';

  window.openAI = function() {
    document.getElementById('ai-panel').classList.add('open');
    document.body.style.overflow = 'hidden';
    // Mark AI Coach nav item as active
    document.querySelectorAll('.bottom-nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector('.bottom-nav-item[onclick="openAI()"]')?.classList.add('active');
    setTimeout(() => document.getElementById('ai-input').focus(), 100);
  };

  window.closeAI = function() {
    document.getElementById('ai-panel').classList.remove('open');
    document.body.style.overflow = '';
    document.querySelectorAll('.bottom-nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector('a[href="/dashboard"]')?.classList.add('active');
  };

  window.sendChip = function(btn) {
    const text = btn.textContent.trim();
    // Hide chips after first use
    document.getElementById('ai-chips').style.display = 'none';
    document.getElementById('ai-welcome').style.display = 'none';
    sendAIMessage(text);
  };

  window.sendAI = function() {
    const inp = document.getElementById('ai-input');
    const q = inp.value.trim();
    if (!q || aiBusy) return;
    inp.value = '';
    inp.style.height = 'auto';
    document.getElementById('ai-welcome').style.display = 'none';
    document.getElementById('ai-chips').style.display = 'none';
    sendAIMessage(q);
  };

  async function sendAIMessage(question) {
    if (aiBusy) return;
    aiBusy = true;
    document.getElementById('ai-send').disabled = true;

    const msgs = document.getElementById('ai-messages');

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-msg user';
    userMsg.textContent = question;
    msgs.appendChild(userMsg);

    // Add typing indicator
    const typing = document.createElement('div');
    typing.className = 'ai-msg typing';
    typing.textContent = 'Thinking...';
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;

    // Build history for context
    aiHistory.push({ role: 'user', content: question });

    try {
      const res = await fetch(AI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          trainer_id: trainer?.id,
          message: question,
          conversation_id: aiConversationId,
          source: 'dashboard'
        })
      });

      const data = await res.json();
      const answer = data.reply || data.answer || data.message || 'Sorry, I could not process that. Please try again.';

      typing.className = 'ai-msg bot';
      typing.textContent = answer;
      aiHistory.push({ role: 'assistant', content: answer });

    } catch(e) {
      typing.className = 'ai-msg bot';
      typing.textContent = 'Connection error. Please check your internet and try again.';
    }

    msgs.scrollTop = msgs.scrollHeight;
    aiBusy = false;
    document.getElementById('ai-send').disabled = false;
    document.getElementById('ai-input').focus();
  }

  // Auto-resize textarea
  document.getElementById('ai-input').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  });

  // Send on Enter (Shift+Enter for newline)
  document.getElementById('ai-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      window.sendAI();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('ai-panel').classList.contains('open')) {
      window.closeAI();
    }
  });
})();

// ── AI Assistant Channel Management ─────────────────────────────────────────────────────────
window.selectChannel = async function(channel, save = true) {
  // Update button states
  document.querySelectorAll('.ai-channel-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.channel === channel);
  });
  // Show correct info panel
  ['dashboard', 'whatsapp', 'telegram'].forEach(ch => {
    const el = document.getElementById('ai-channel-' + ch);
    if (el) el.style.display = ch === channel ? 'block' : 'none';
  });
  // Persist to DB
  if (save && trainer?.id) {
    try {
      await sb.from('trainers').update({ assistant_channel: channel }).eq('id', trainer.id);
      showToast('Channel updated to ' + channel);
    } catch { /* silently fail */ }
  }
};

window.generateTelegramLink = async function() {
  if (!trainer?.id) return;
  try {
    const { data, error } = await sb.rpc('generate_telegram_link_token', { p_trainer_id: trainer.id });
    if (error) throw error;
    const token = data;
    const botName = window.__BRAND__?.telegramBot || 'TrainedByAssistantBot';
    const linkUrl = \`https://t.me/\${botName}?start=\${token}\`;
    document.getElementById('tg-link-url').textContent = linkUrl;
    document.getElementById('tg-link-url').href = linkUrl;
    document.getElementById('tg-link-display').style.display = 'block';
  } catch (e) {
    showToast('Could not generate link. Please try again.', 'error');
  }
};

window.unlinkTelegram = async function() {
  if (!trainer?.id) return;
  try {
    await sb.from('trainers').update({
      telegram_chat_id: null,
      telegram_username: null,
      assistant_channel: 'dashboard'
    }).eq('id', trainer.id);
    document.getElementById('tg-linked-state').style.display = 'none';
    document.getElementById('tg-unlinked-state').style.display = 'block';
    selectChannel('dashboard', false);
    showToast('Telegram unlinked');
  } catch { showToast('Could not unlink. Please try again.', 'error'); }
};
})();</script> `], ["    ", `<nav class="dash-tabs" id="dash-tabs" data-astro-cid-3nssi2tu> <div class="dash-tabs-inner" data-astro-cid-3nssi2tu> <a href="/" class="tabs-logo" data-astro-cid-3nssi2tu>TrainedBy</a> <div class="tabs-list" data-astro-cid-3nssi2tu> <a href="/dashboard" class="tab-item active" data-astro-cid-3nssi2tu>Overview</a> <a href="/edit" class="tab-item" data-astro-cid-3nssi2tu>Profile</a> <a href="/pricing" class="tab-item" data-astro-cid-3nssi2tu>Upgrade</a> </div> <div class="tabs-right" data-astro-cid-3nssi2tu> <a id="tab-view-link" href="#" class="tab-view-profile" data-astro-cid-3nssi2tu>View my profile →</a> <div class="tabs-avatar" id="tab-avatar-initials" data-astro-cid-3nssi2tu>TB</div> </div> </div> </nav> <div class="dash-wrap" data-astro-cid-3nssi2tu> <!-- Header --> <div class="dash-header" data-astro-cid-3nssi2tu> <a href="/" class="dash-logo" data-astro-cid-3nssi2tu> <svg width="26" height="26" viewBox="0 0 32 32" data-astro-cid-3nssi2tu><rect width="32" height="32" rx="8" fill="#1A1411" data-astro-cid-3nssi2tu></rect><text x="16" y="23" font-family="DM Sans,Arial,sans-serif" font-size="14" font-weight="800" text-anchor="middle" fill="white" data-astro-cid-3nssi2tu>TB</text></svg>
Dashboard
</a> <div class="header-nav" data-astro-cid-3nssi2tu> <a href="/edit" class="nav-edit" data-astro-cid-3nssi2tu>Edit</a> <a id="view-link" href="#" class="nav-view" data-astro-cid-3nssi2tu>View Profile</a> </div> </div> <!-- Loading --> <div id="dash-loading" style="text-align:center;padding:60px 0;" data-astro-cid-3nssi2tu> <div style="display:flex;align-items:center;justify-content:center;gap:8px;" data-astro-cid-3nssi2tu> <div style="width:8px;height:8px;border-radius:50%;background:var(--brand);animation:pulse 1.2s ease-in-out infinite;" data-astro-cid-3nssi2tu></div> <div style="width:8px;height:8px;border-radius:50%;background:var(--brand);animation:pulse 1.2s ease-in-out infinite;animation-delay:0.2s;" data-astro-cid-3nssi2tu></div> <div style="width:8px;height:8px;border-radius:50%;background:var(--brand);animation:pulse 1.2s ease-in-out infinite;animation-delay:0.4s;" data-astro-cid-3nssi2tu></div> </div> </div> <!-- Auth gate --> <div id="dash-auth" class="hidden" style="text-align:center;padding:60px 0;" data-astro-cid-3nssi2tu> <h2 style="font-family:'Manrope',sans-serif;font-size:20px;font-weight:800;margin-bottom:8px;" data-astro-cid-3nssi2tu>Sign in to view your dashboard</h2> <p style="font-size:14px;color:var(--text-muted);margin-bottom:24px;" data-astro-cid-3nssi2tu>Access your leads, analytics, and profile settings.</p> <a href="/edit" style="display:inline-block;padding:14px 28px;border-radius:12px;background:var(--brand);color:#fff;text-decoration:none;font-family:'Manrope',sans-serif;font-size:14px;font-weight:700;" data-astro-cid-3nssi2tu>Sign In →</a> </div> <!-- Dashboard content --> <div id="dash-content" class="hidden" data-astro-cid-3nssi2tu> <!-- Greeting --> <div class="trainer-greeting" data-astro-cid-3nssi2tu> <div class="greeting-row" data-astro-cid-3nssi2tu> <img id="dash-avatar" class="greeting-avatar" src="" alt="Avatar" data-astro-cid-3nssi2tu> <div data-astro-cid-3nssi2tu> <div class="greeting-name" id="dash-name" data-astro-cid-3nssi2tu>Loading...</div> <div class="greeting-sub" id="dash-sub" data-astro-cid-3nssi2tu>`, '</div> </div> </div> <div class="url-bar" data-astro-cid-3nssi2tu> <span class="url-bar-text" id="dash-url" data-astro-cid-3nssi2tu>...</span> <button class="url-copy-btn" onclick="copyUrl()" data-astro-cid-3nssi2tu>Copy Link</button> </div> </div> <!-- Profile Completeness Widget --> ', " <!-- Booking Setup Card (only shown when setup is incomplete) --> ", ' <!-- Stats --> <div class="stats-section" data-astro-cid-3nssi2tu> <div class="stats-section-title" data-astro-cid-3nssi2tu>This Week</div> <div class="stats-grid" data-astro-cid-3nssi2tu> <div class="stat-card brand-card" data-astro-cid-3nssi2tu> <div class="stat-card-icon" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-3nssi2tu><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" data-astro-cid-3nssi2tu></path><circle cx="9" cy="7" r="4" data-astro-cid-3nssi2tu></circle><path d="M23 21v-2a4 4 0 00-3-3.87" data-astro-cid-3nssi2tu></path><path d="M16 3.13a4 4 0 010 7.75" data-astro-cid-3nssi2tu></path></svg> </div> <div class="stat-card-value" id="stat-leads" data-astro-cid-3nssi2tu> - </div> <div class="stat-card-label" data-astro-cid-3nssi2tu>', '</div> <div class="stat-card-change up" id="stat-leads-change" data-astro-cid-3nssi2tu></div> </div> <div class="stat-card" data-astro-cid-3nssi2tu> <div class="stat-card-icon" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-3nssi2tu><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" data-astro-cid-3nssi2tu></path><circle cx="12" cy="12" r="3" data-astro-cid-3nssi2tu></circle></svg> </div> <div class="stat-card-value" id="stat-views" data-astro-cid-3nssi2tu> - </div> <div class="stat-card-label" data-astro-cid-3nssi2tu>', '</div> <div class="stat-card-change up" id="stat-views-change" data-astro-cid-3nssi2tu></div> </div> <div class="stat-card" data-astro-cid-3nssi2tu> <div class="stat-card-icon" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-3nssi2tu><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" data-astro-cid-3nssi2tu></path></svg> </div> <div class="stat-card-value" id="stat-wa-taps" data-astro-cid-3nssi2tu> - </div> <div class="stat-card-label" data-astro-cid-3nssi2tu>', '</div> <div class="stat-card-change up" id="stat-wa-change" data-astro-cid-3nssi2tu></div> </div> <div class="stat-card" data-astro-cid-3nssi2tu> <div class="stat-card-icon" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-3nssi2tu><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" data-astro-cid-3nssi2tu></polyline></svg> </div> <div class="stat-card-value" id="stat-assess" data-astro-cid-3nssi2tu> - </div> <div class="stat-card-label" data-astro-cid-3nssi2tu>Assessments</div> <div class="stat-card-change up" id="stat-assess-change" data-astro-cid-3nssi2tu></div> </div> </div> </div> <!-- WHOOP-style Actionable Insight Banner --> <div id="insight-banner" style="display:none;margin:16px 0;background:linear-gradient(135deg,rgba(255,92,0,0.10),rgba(255,92,0,0.04));border:1px solid rgba(255,92,0,0.25);border-radius:14px;padding:14px 16px;" data-astro-cid-3nssi2tu> <div style="display:flex;align-items:flex-start;gap:10px;" data-astro-cid-3nssi2tu> <div style="width:32px;height:32px;border-radius:8px;background:rgba(255,92,0,0.15);border:1px solid rgba(255,92,0,0.25);display:flex;align-items:center;justify-content:center;flex-shrink:0;" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF5C00" stroke-width="2.5" data-astro-cid-3nssi2tu><circle cx="12" cy="12" r="10" data-astro-cid-3nssi2tu></circle><line x1="12" y1="8" x2="12" y2="12" data-astro-cid-3nssi2tu></line><line x1="12" y1="16" x2="12.01" y2="16" data-astro-cid-3nssi2tu></line></svg> </div> <div data-astro-cid-3nssi2tu> <div style="font-size:11px;font-weight:700;color:rgba(255,92,0,0.9);letter-spacing:0.05em;text-transform:uppercase;margin-bottom:3px;" data-astro-cid-3nssi2tu>Insight</div> <div id="insight-text" style="font-size:13px;color:rgba(255,255,255,0.85);line-height:1.5;" data-astro-cid-3nssi2tu></div> <div id="insight-action" style="margin-top:8px;" data-astro-cid-3nssi2tu></div> </div> </div> </div> <!-- Views chart --> <div class="chart-section" data-astro-cid-3nssi2tu> <div class="chart-header" data-astro-cid-3nssi2tu> <span class="chart-title" data-astro-cid-3nssi2tu>', '</span> <select class="chart-period-select" onchange="loadChart(this.value)" data-astro-cid-3nssi2tu> <option value="7" data-astro-cid-3nssi2tu>Last 7 days</option> <option value="14" data-astro-cid-3nssi2tu>Last 14 days</option> <option value="30" data-astro-cid-3nssi2tu>Last 30 days</option> </select> </div> <div class="chart-area" data-astro-cid-3nssi2tu> <div class="chart-bars" id="chart-bars" data-astro-cid-3nssi2tu></div> </div> <div class="chart-labels" id="chart-labels" data-astro-cid-3nssi2tu></div> </div> <!-- Leads --> <div class="leads-section" data-astro-cid-3nssi2tu> <div class="leads-header" data-astro-cid-3nssi2tu> <span class="leads-title" data-astro-cid-3nssi2tu>', '</span> <span class="leads-count" id="leads-total-badge" data-astro-cid-3nssi2tu>0</span> </div> <div id="leads-list" data-astro-cid-3nssi2tu> <div class="empty-state" data-astro-cid-3nssi2tu> <div class="empty-state-icon" data-astro-cid-3nssi2tu> <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" data-astro-cid-3nssi2tu><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" data-astro-cid-3nssi2tu></path><circle cx="9" cy="7" r="4" data-astro-cid-3nssi2tu></circle><path d="M23 21v-2a4 4 0 00-3-3.87" data-astro-cid-3nssi2tu></path><path d="M16 3.13a4 4 0 010 7.75" data-astro-cid-3nssi2tu></path></svg> </div> <div class="empty-state-text" data-astro-cid-3nssi2tu>No leads yet - share your profile link to get started.</div> </div> </div> </div> <!-- Onboarding Checklist --> <div class="checklist-section" id="checklist-section" data-astro-cid-3nssi2tu> <div class="checklist-title" data-astro-cid-3nssi2tu>Getting Started</div> <div id="checklist-list" data-astro-cid-3nssi2tu></div> </div> <!-- Income Streams (launch version: sessions only) --> <div class="income-section" id="income-section" data-astro-cid-3nssi2tu> <div class="stats-section-title" style="margin-bottom:14px" data-astro-cid-3nssi2tu>Your Income</div> <div class="income-grid" id="income-grid" data-astro-cid-3nssi2tu> <div class="income-stream-card active" data-astro-cid-3nssi2tu> <div class="income-stream-icon" data-astro-cid-3nssi2tu>🏋️</div> <div class="income-stream-label" data-astro-cid-3nssi2tu>Sessions</div> <div class="income-stream-value" id="is-sessions" data-astro-cid-3nssi2tu>Active</div> <div class="income-stream-sub" data-astro-cid-3nssi2tu>Your core training income</div> </div> </div> </div> <!-- Bookings Section --> <div class="leads-section" id="bookings-section" data-astro-cid-3nssi2tu> <div class="stats-section-title" style="margin-bottom:14px" data-astro-cid-3nssi2tu>Your Bookings</div> ', ` </div> <!-- Generate Training Plan - Pro Feature Card --> <div class="checklist-section" id="generate-plan-section" style="display:none" data-astro-cid-3nssi2tu> <div class="checklist-title" style="display:flex;align-items:center;gap:8px;" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF5C00" stroke-width="2" data-astro-cid-3nssi2tu><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" data-astro-cid-3nssi2tu></path><polyline points="14 2 14 8 20 8" data-astro-cid-3nssi2tu></polyline><line x1="16" y1="13" x2="8" y2="13" data-astro-cid-3nssi2tu></line><line x1="16" y1="17" x2="8" y2="17" data-astro-cid-3nssi2tu></line><polyline points="10 9 9 9 8 9" data-astro-cid-3nssi2tu></polyline></svg>
Generate a Training Plan
</div> <div style="font-size:13px;color:var(--text-muted);margin-bottom:16px;line-height:1.6;" data-astro-cid-3nssi2tu>
Build a personalised training plan for a client in 30 seconds. Send it as a PDF or share the link directly.
</div> <div style="display:flex;flex-direction:column;gap:10px;" data-astro-cid-3nssi2tu> <div class="field" style="margin-bottom:0" data-astro-cid-3nssi2tu> <label style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.05em;" data-astro-cid-3nssi2tu>Client goal</label> <input type="text" id="plan-goal" placeholder="e.g. Lose 8kg in 12 weeks" style="background:var(--surface-3);border:1px solid var(--border);border-radius:10px;padding:10px 14px;color:var(--text);font-size:14px;width:100%;outline:none;font-family:'Inter',sans-serif;" data-astro-cid-3nssi2tu> </div> <div class="field" style="margin-bottom:0" data-astro-cid-3nssi2tu> <label style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.05em;" data-astro-cid-3nssi2tu>Sessions per week</label> <div style="display:flex;gap:8px;" data-astro-cid-3nssi2tu> <button class="toggle-pill active" id="plan-freq-2" onclick="setPlanFreq(2)" style="flex:1;padding:8px;border-radius:8px;background:var(--surface-3);border:1px solid var(--brand);color:var(--text);font-size:13px;font-weight:700;cursor:pointer;" data-astro-cid-3nssi2tu>2×</button> <button class="toggle-pill" id="plan-freq-3" onclick="setPlanFreq(3)" style="flex:1;padding:8px;border-radius:8px;background:var(--surface-3);border:1px solid var(--border);color:var(--text-muted);font-size:13px;font-weight:700;cursor:pointer;" data-astro-cid-3nssi2tu>3×</button> <button class="toggle-pill" id="plan-freq-4" onclick="setPlanFreq(4)" style="flex:1;padding:8px;border-radius:8px;background:var(--surface-3);border:1px solid var(--border);color:var(--text-muted);font-size:13px;font-weight:700;cursor:pointer;" data-astro-cid-3nssi2tu>4×</button> <button class="toggle-pill" id="plan-freq-5" onclick="setPlanFreq(5)" style="flex:1;padding:8px;border-radius:8px;background:var(--surface-3);border:1px solid var(--border);color:var(--text-muted);font-size:13px;font-weight:700;cursor:pointer;" data-astro-cid-3nssi2tu>5×</button> </div> </div> <div class="field" style="margin-bottom:0" data-astro-cid-3nssi2tu> <label style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.05em;" data-astro-cid-3nssi2tu>Duration</label> <div style="display:flex;gap:8px;" data-astro-cid-3nssi2tu> <button class="toggle-pill active" id="plan-dur-4" onclick="setPlanDur(4)" style="flex:1;padding:8px;border-radius:8px;background:var(--surface-3);border:1px solid var(--brand);color:var(--text);font-size:13px;font-weight:700;cursor:pointer;" data-astro-cid-3nssi2tu>4 wk</button> <button class="toggle-pill" id="plan-dur-8" onclick="setPlanDur(8)" style="flex:1;padding:8px;border-radius:8px;background:var(--surface-3);border:1px solid var(--border);color:var(--text-muted);font-size:13px;font-weight:700;cursor:pointer;" data-astro-cid-3nssi2tu>8 wk</button> <button class="toggle-pill" id="plan-dur-12" onclick="setPlanDur(12)" style="flex:1;padding:8px;border-radius:8px;background:var(--surface-3);border:1px solid var(--border);color:var(--text-muted);font-size:13px;font-weight:700;cursor:pointer;" data-astro-cid-3nssi2tu>12 wk</button> </div> </div> <button id="generate-plan-btn" onclick="generatePlan()" style="background:var(--brand);color:#fff;border:none;border-radius:12px;padding:12px 20px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-astro-cid-3nssi2tu><polygon points="5 3 19 12 5 21 5 3" data-astro-cid-3nssi2tu></polygon></svg>
Generate Plan
</button> <div id="plan-result" style="display:none;background:var(--surface-3);border:1px solid var(--border);border-radius:12px;padding:14px;font-size:13px;color:var(--text-muted);line-height:1.6;" data-astro-cid-3nssi2tu></div> </div> </div> <!-- AI Assistant Channel Settings (Pro only) --> <div class="checklist-section" id="ai-settings-section" style="display:none" data-astro-cid-3nssi2tu> <div class="checklist-title" data-astro-cid-3nssi2tu>`, '</div> <div style="font-size:13px;color:var(--text-muted);margin-bottom:16px;" data-astro-cid-3nssi2tu>', `</div> <!-- Channel selector --> <div style="display:flex;gap:10px;margin-bottom:20px;" id="ai-channel-selector" data-astro-cid-3nssi2tu> <button class="ai-channel-btn active" data-channel="dashboard" onclick="selectChannel('dashboard')" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-3nssi2tu><rect x="3" y="3" width="7" height="7" data-astro-cid-3nssi2tu></rect><rect x="14" y="3" width="7" height="7" data-astro-cid-3nssi2tu></rect><rect x="14" y="14" width="7" height="7" data-astro-cid-3nssi2tu></rect><rect x="3" y="14" width="7" height="7" data-astro-cid-3nssi2tu></rect></svg> `, ` </button> <button class="ai-channel-btn" data-channel="whatsapp" onclick="selectChannel('whatsapp')" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-3nssi2tu><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" data-astro-cid-3nssi2tu></path></svg> `, ` </button> <button class="ai-channel-btn" data-channel="telegram" onclick="selectChannel('telegram')" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-3nssi2tu><line x1="22" y1="2" x2="11" y2="13" data-astro-cid-3nssi2tu></line><polygon points="22 2 15 22 11 13 2 9 22 2" data-astro-cid-3nssi2tu></polygon></svg> `, ' </button> </div> <!-- Dashboard info --> <div id="ai-channel-dashboard" class="ai-channel-info" data-astro-cid-3nssi2tu> <p style="font-size:13px;color:var(--text-muted);" data-astro-cid-3nssi2tu>Your AI assistant is available in the AI Coach tab below. Tap it to start a conversation.</p> </div> <!-- WhatsApp setup --> <div id="ai-channel-whatsapp" class="ai-channel-info" style="display:none" data-astro-cid-3nssi2tu> <p style="font-size:13px;color:var(--text-muted);margin-bottom:12px;" data-astro-cid-3nssi2tu>Your AI assistant will reply to messages sent to the platform WhatsApp number from your registered WhatsApp number.</p> <div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:12px;font-size:13px;" data-astro-cid-3nssi2tu> <div style="color:rgba(255,255,255,0.5);margin-bottom:4px;" data-astro-cid-3nssi2tu>Your registered number</div> <div id="wa-registered-number" style="color:rgba(255,255,255,0.9);font-weight:600;" data-astro-cid-3nssi2tu>Loading...</div> </div> <p style="font-size:12px;color:rgba(255,255,255,0.35);margin-top:10px;" data-astro-cid-3nssi2tu>To change your number, update it in Edit Profile.</p> </div> <!-- Telegram setup --> <div id="ai-channel-telegram" class="ai-channel-info" style="display:none" data-astro-cid-3nssi2tu> <p style="font-size:13px;color:var(--text-muted);margin-bottom:12px;" data-astro-cid-3nssi2tu>Link your Telegram account to talk to your AI assistant there.</p> <div id="tg-linked-state" style="display:none;background:rgba(255,255,255,0.05);border-radius:10px;padding:12px;font-size:13px;" data-astro-cid-3nssi2tu> <div style="color:rgba(255,255,255,0.5);margin-bottom:4px;" data-astro-cid-3nssi2tu>Linked account</div> <div id="tg-username" style="color:rgba(255,255,255,0.9);font-weight:600;" data-astro-cid-3nssi2tu></div> <button onclick="unlinkTelegram()" style="margin-top:10px;font-size:12px;color:rgba(255,92,0,0.8);background:none;border:none;cursor:pointer;padding:0;" data-astro-cid-3nssi2tu>Unlink</button> </div> <div id="tg-unlinked-state" data-astro-cid-3nssi2tu> <button class="btn-primary" onclick="generateTelegramLink()" style="width:100%;margin-top:0;" data-astro-cid-3nssi2tu>\nGenerate Telegram Link\n</button> <div id="tg-link-display" style="display:none;margin-top:12px;background:rgba(255,255,255,0.05);border-radius:10px;padding:12px;" data-astro-cid-3nssi2tu> <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:6px;" data-astro-cid-3nssi2tu>Open this link on your phone:</div> <a id="tg-link-url" href="#" target="_blank" style="font-size:13px;color:#FF5C00;word-break:break-all;" data-astro-cid-3nssi2tu></a> <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:8px;" data-astro-cid-3nssi2tu>Link expires in 10 minutes. Tap it to open Telegram and complete the connection.</div> </div> </div> </div> </div> </div><!-- /dash-content --> </div>  <div class="ai-panel" id="ai-panel" data-astro-cid-3nssi2tu> <div class="ai-panel-header" data-astro-cid-3nssi2tu> <div class="ai-panel-title" data-astro-cid-3nssi2tu> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF5C00" stroke-width="2" data-astro-cid-3nssi2tu><path d="M12 2a10 10 0 110 20A10 10 0 0112 2z" data-astro-cid-3nssi2tu></path><path d="M12 6v6l4 2" data-astro-cid-3nssi2tu></path></svg> ', ` <span class="ai-panel-badge" data-astro-cid-3nssi2tu>Beta</span> </div> <button class="ai-panel-close" onclick="closeAI()" data-astro-cid-3nssi2tu>Done</button> </div> <div class="ai-messages" id="ai-messages" data-astro-cid-3nssi2tu> <div class="ai-welcome" id="ai-welcome" data-astro-cid-3nssi2tu> <div class="ai-welcome-icon" data-astro-cid-3nssi2tu> <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF5C00" stroke-width="1.8" data-astro-cid-3nssi2tu><circle cx="12" cy="12" r="10" data-astro-cid-3nssi2tu></circle><path d="M12 8v4l3 3" data-astro-cid-3nssi2tu></path></svg> </div> <div class="ai-welcome-title" data-astro-cid-3nssi2tu>Hey, I'm your AI coach</div> <div class="ai-welcome-sub" data-astro-cid-3nssi2tu>I know your profile, your market, and your goals. Ask me anything - from writing your bio to building a 12-week programme.</div> </div> </div> <div class="ai-quick-prompts" id="ai-chips" data-astro-cid-3nssi2tu> <button class="ai-chip" onclick="sendChip(this)" data-astro-cid-3nssi2tu>Write my bio</button> <button class="ai-chip" onclick="sendChip(this)" data-astro-cid-3nssi2tu>Build a 12-week plan</button> <button class="ai-chip" onclick="sendChip(this)" data-astro-cid-3nssi2tu>How to get more leads</button> <button class="ai-chip" onclick="sendChip(this)" data-astro-cid-3nssi2tu>Price my packages</button> <button class="ai-chip" onclick="sendChip(this)" data-astro-cid-3nssi2tu>Write a client email</button> <button class="ai-chip" onclick="sendChip(this)" data-astro-cid-3nssi2tu>Nutrition advice</button> </div> <div class="ai-input-row" data-astro-cid-3nssi2tu> <textarea class="ai-input" id="ai-input" placeholder="{t(locale, 'dash.ai_placeholder')}" rows="1" data-astro-cid-3nssi2tu></textarea> <button class="ai-send" id="ai-send" onclick="sendAI()" data-astro-cid-3nssi2tu> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-astro-cid-3nssi2tu><line x1="22" y1="2" x2="11" y2="13" data-astro-cid-3nssi2tu></line><polygon points="22 2 15 22 11 13 2 9 22 2" data-astro-cid-3nssi2tu></polygon></svg> </button> </div> </div>  <nav class="bottom-nav" data-astro-cid-3nssi2tu> <a href="/dashboard" class="bottom-nav-item active" data-astro-cid-3nssi2tu> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" data-astro-cid-3nssi2tu><rect x="3" y="3" width="7" height="7" data-astro-cid-3nssi2tu></rect><rect x="14" y="3" width="7" height="7" data-astro-cid-3nssi2tu></rect><rect x="14" y="14" width="7" height="7" data-astro-cid-3nssi2tu></rect><rect x="3" y="14" width="7" height="7" data-astro-cid-3nssi2tu></rect></svg> <span data-astro-cid-3nssi2tu>`, '</span> </a> <a href="/edit" class="bottom-nav-item" data-astro-cid-3nssi2tu> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" data-astro-cid-3nssi2tu><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" data-astro-cid-3nssi2tu></path><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" data-astro-cid-3nssi2tu></path></svg> <span data-astro-cid-3nssi2tu>', '</span> </a> <button class="bottom-nav-item" onclick="openAI()" style="background:none;border:none;cursor:pointer;" data-astro-cid-3nssi2tu> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" data-astro-cid-3nssi2tu><circle cx="12" cy="12" r="10" data-astro-cid-3nssi2tu></circle><path d="M12 8v4l3 3" data-astro-cid-3nssi2tu></path></svg> <span data-astro-cid-3nssi2tu>', '</span> </button> <a id="nav-view-profile" href="#" class="bottom-nav-item" data-astro-cid-3nssi2tu> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" data-astro-cid-3nssi2tu><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" data-astro-cid-3nssi2tu></path><circle cx="12" cy="12" r="3" data-astro-cid-3nssi2tu></circle></svg> <span data-astro-cid-3nssi2tu>', '</span> </a> <a href="/pricing" class="bottom-nav-item" data-astro-cid-3nssi2tu> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" data-astro-cid-3nssi2tu><line x1="12" y1="1" x2="12" y2="23" data-astro-cid-3nssi2tu></line><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" data-astro-cid-3nssi2tu></path></svg> <span data-astro-cid-3nssi2tu>', '</span> </a> </nav>  <div class="toast" id="toast" data-astro-cid-3nssi2tu></div> <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.min.js" crossorigin="anonymous"></script> <script>(function(){', `
const SUPABASE_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co';
const EDGE_BASE = SUPABASE_URL + '/functions/v1';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.renderPC = function() {}; // widget now server-rendered

let trainer = null;

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = 'toast' + (type ? ' ' + type : '');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== AUTH HELPERS =====
function getAuthToken() {
  const cookies = document.cookie.split(';').map(c => c.trim());
  for (const c of cookies) {
    if (c.startsWith('tb_session=')) return c.slice('tb_session='.length);
  }
  return localStorage.getItem('tb_edit_token');
}
function clearAuthToken() {
  localStorage.removeItem('tb_edit_token');
  document.cookie = 'tb_session=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Strict';
}

async function init() {
  const token = getAuthToken();
  document.getElementById('dash-loading').style.display = 'none';
  if (!token) { document.getElementById('dash-auth').classList.remove('hidden'); return; }

  try {
    const res = await fetch(EDGE_BASE + '/verify-magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token })
    });
    const data = await res.json();
    if (!res.ok || !data.trainer) throw new Error();
    trainer = data.trainer;
    populateDash(trainer);
    loadStats();
    loadLeads();
    loadChart(7);
    buildChecklist(trainer);
    document.getElementById('dash-content').classList.remove('hidden');
  } catch {
    clearAuthToken();
    document.getElementById('dash-auth').classList.remove('hidden');
  }
}

function populateDash(t) {
  document.getElementById('dash-avatar').src = t.avatar_url || '';
  document.getElementById('dash-name').textContent = 'Hey, ' + (t.name?.split(' ')[0] || 'Trainer') + ' 👋';
  document.getElementById('dash-sub').textContent = t.reps_verified ? 'REPs Verified Trainer' : 'Verification Pending';
  const _domain = window.location.hostname;
  const url = _domain + '/' + t.slug;
  document.getElementById('dash-url').textContent = url;
  document.getElementById('view-link').href = '/' + t.slug;
  document.getElementById('nav-view-profile').href = '/' + t.slug;

  // Update desktop tab nav
  const tabViewLink = document.getElementById('tab-view-link');
  if (tabViewLink) tabViewLink.href = '/' + t.slug;
  const tabAvatar = document.getElementById('tab-avatar-initials');
  if (tabAvatar) {
    const initials = (t.name || 'TB').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    tabAvatar.textContent = initials;
  }

  // Referral flywheel
  const refUrl = 'https://' + _domain + '/join?ref=' + t.slug;
  document.getElementById('referral-url-text').textContent = _domain + '/join?ref=' + t.slug;
  const waMsg = encodeURIComponent('Hey! I\\\\'m using ' + (window.__BRAND__?.name || 'TrainedBy') + ' to manage my PT business. Get your free verified profile here: ' + refUrl);
  document.getElementById('referral-wa-share').href = 'https://wa.me/?text=' + waMsg;
  const refCount = t.referral_count || 0;
  const refTarget = 4;
  const pct = Math.min(100, Math.round((refCount / refTarget) * 100));
  document.getElementById('flywheel-count-label').textContent = refCount + ' of ' + refTarget + ' referrals';
  document.getElementById('flywheel-pct-label').textContent = pct + '% to free Pro';
  document.getElementById('flywheel-fill').style.width = pct + '%';
  const steps = document.getElementById('flywheel-steps').children;
  for (let i = 0; i < steps.length; i++) {
    if (i < refCount) steps[i].classList.add('done');
  }
  if (refCount >= refTarget) {
    document.getElementById('flywheel-reward-text').textContent = '🎉 You\\\\'ve earned free Pro forever!';
  }

  // Income stream cards - unlock for Pro/Premium
  const isPro = t.plan === 'pro' || t.plan === 'premium';
  if (isPro) {
    document.getElementById('upgrade-banner').style.display = 'none';
    // Removed: affiliate/digital/referral cards no longer exist
    [].forEach(id => {
      const card = document.getElementById(id);
      card.classList.remove('locked');
      card.classList.add('active');
      const lock = card.querySelector('.income-stream-lock');
      if (lock) lock.remove();
      const val = card.querySelector('.income-stream-value');
      if (val) { val.textContent = 'Active'; val.classList.add('green'); }
    });
  }

  // Profile completeness widget
  if (typeof window.renderPC === 'function') window.renderPC(t);

  // Generate Plan - show for Pro trainers
  if (isPro) {
    const planSection = document.getElementById('generate-plan-section');
    if (planSection) planSection.style.display = 'block';
  }

  // AI Assistant settings - show for Pro trainers
  if (isPro) {
    const aiSection = document.getElementById('ai-settings-section');
    if (aiSection) {
      aiSection.style.display = 'block';
      // Set active channel
      const ch = t.assistant_channel || 'dashboard';
      selectChannel(ch, false); // false = don't save to DB
      // Show WhatsApp number
      const waEl = document.getElementById('wa-registered-number');
      if (waEl) waEl.textContent = t.whatsapp || 'Not set - add in Edit Profile';
      // Show Telegram linked state
      if (t.telegram_chat_id) {
        document.getElementById('tg-linked-state').style.display = 'block';
        document.getElementById('tg-unlinked-state').style.display = 'none';
        document.getElementById('tg-username').textContent = t.telegram_username ? '@' + t.telegram_username : 'Linked';
      }
    }
  }
}

// ── Generate Plan ───────────────────────────────────────────────────────────
let planFreq = 2;
let planDur = 4;

window.setPlanFreq = function(n) {
  planFreq = n;
  [2,3,4,5].forEach(v => {
    const btn = document.getElementById('plan-freq-' + v);
    if (btn) {
      btn.style.borderColor = v === n ? 'var(--brand)' : 'var(--border)';
      btn.style.color = v === n ? 'var(--text)' : 'var(--text-muted)';
    }
  });
};

window.setPlanDur = function(n) {
  planDur = n;
  [4,8,12].forEach(v => {
    const btn = document.getElementById('plan-dur-' + v);
    if (btn) {
      btn.style.borderColor = v === n ? 'var(--brand)' : 'var(--border)';
      btn.style.color = v === n ? 'var(--text)' : 'var(--text-muted)';
    }
  });
};

window.generatePlan = async function() {
  const goal = document.getElementById('plan-goal').value.trim();
  if (!goal) { showToast('Enter a client goal first'); return; }

  const btn = document.getElementById('generate-plan-btn');
  const result = document.getElementById('plan-result');
  btn.disabled = true;
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Generating...';
  result.style.display = 'none';

  try {
    const res = await fetch(EDGE_BASE + '/generate-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getAuthToken()
      },
      body: JSON.stringify({
        goal,
        sessions_per_week: planFreq,
        duration_weeks: planDur,
      })
    });
    const data = await res.json();
    if (data.plan) {
      result.style.display = 'block';
      result.innerHTML = '<pre style="white-space:pre-wrap;font-family:inherit;">' + data.plan + '</pre>';
      if (data.share_url) {
        result.innerHTML += '<a href="' + data.share_url + '" target="_blank" style="display:inline-block;margin-top:12px;color:var(--brand);font-size:12px;font-weight:700;">Share plan link →</a>';
      }
    } else {
      showToast('Could not generate plan - try again');
    }
  } catch {
    showToast('Error generating plan');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg> Generate Plan';
  }
};

async function loadStats() {
  try {
    const res = await fetch(EDGE_BASE + '/weekly-stats', {
      headers: { 'Authorization': 'Bearer ' + getAuthToken() }
    });
    const data = await res.json();
    document.getElementById('stat-leads').textContent = data.leads_this_week ?? '0';
    document.getElementById('stat-views').textContent = data.views_this_week ?? '0';
    document.getElementById('stat-wa-taps').textContent = data.wa_taps_this_week ?? '0';
    document.getElementById('stat-assess').textContent = data.assessments_this_week ?? '0';
    if (data.leads_change) {
      const el = document.getElementById('stat-leads-change');
      el.textContent = (data.leads_change > 0 ? '↑' : '↓') + ' ' + Math.abs(data.leads_change) + ' vs last week';
      el.className = 'stat-card-change ' + (data.leads_change > 0 ? 'up' : 'down');
    }
    // WHOOP-style actionable insight
    generateInsight(data);
  } catch { /* silently fail */ }
}

function generateInsight(data) {
  const views = data.views_this_week || 0;
  const leads = data.leads_this_week || 0;
  const waTaps = data.wa_taps_this_week || 0;
  const convRate = views > 0 ? (leads / views * 100).toFixed(1) : 0;
  let text = '';
  let action = '';
  if (views > 20 && leads === 0) {
    text = \\\`Your profile got <strong>\\\${views} views</strong> this week but 0 leads. Visitors are interested but not converting.\\\`;
    action = \\\`<a href="/edit" style="font-size:12px;font-weight:700;color:var(--brand);text-decoration:none;">→ Add a session package with a clear outcome to convert views into bookings</a>\\\`;
  } else if (leads > 0 && waTaps === 0) {
    text = \\\`You got <strong>\\\${leads} lead\\\${leads>1?'s':''}</strong> but no WhatsApp taps. Clients filled the form but didn't message you directly.\\\`;
    action = \\\`<a href="/edit" style="font-size:12px;font-weight:700;color:var(--brand);text-decoration:none;">→ Make sure your WhatsApp number is visible on your profile</a>\\\`;
  } else if (views > 0 && convRate > 0) {
    text = \\\`Your conversion rate is <strong>\\\${convRate}%</strong> this week (\\\${leads} lead\\\${leads>1?'s':''} from \\\${views} views). \\\${convRate >= 5 ? 'That\\\\'s above average - great work.' : 'Industry average is 5-8%. A results guarantee could double this.'}\\\`;
    action = convRate < 5 ? \\\`<a href="/edit" style="font-size:12px;font-weight:700;color:var(--brand);text-decoration:none;">→ Add a money-back guarantee to your packages</a>\\\` : '';
  } else if (views === 0) {
    text = 'Your profile has no views yet this week. Share your profile link to start getting traffic.';
    action = \\\`<button onclick="copyUrl()" style="font-size:12px;font-weight:700;color:var(--brand);background:none;border:none;cursor:pointer;padding:0;">→ Copy your profile link and share it now</button>\\\`;
  }
  if (text) {
    document.getElementById('insight-text').innerHTML = text;
    document.getElementById('insight-action').innerHTML = action;
    document.getElementById('insight-banner').style.display = 'block';
  }
}

async function loadLeads() {
  try {
    const { data, error } = await sb.from('leads')
      .select('*').eq('trainer_id', trainer.id)
      .order('created_at', { ascending: false }).limit(10);
    if (error || !data?.length) return;
    document.getElementById('leads-total-badge').textContent = data.length;
    const list = document.getElementById('leads-list');
    list.innerHTML = '';
    data.forEach(lead => {
      const initials = (lead.name || '?').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
      const timeAgo = formatTimeAgo(lead.created_at);
      const typeTag = lead.type === 'assessment' ? 'assessment' : lead.type === 'package' ? 'package' : 'booking';
      const typeLabel = lead.type === 'assessment' ? 'Assessment' : lead.type === 'package' ? 'Package' : 'Booking';
      const waMsg = encodeURIComponent(\\\`Hi \\\${lead.name}, I'm \\\${trainer.name} from \\\${window.__BRAND__?.name || 'TrainedBy'}. I saw your enquiry and would love to help you reach your fitness goals!\\\`);
      const waUrl = \\\`https://wa.me/\\\${(lead.phone || '').replace(/\\\\D/g,'')}?text=\\\${waMsg}\\\`;
      list.innerHTML += \\\`
        <div class="lead-item">
          <div class="lead-avatar">\\\${initials}</div>
          <div>
            <div class="lead-name">\\\${lead.name || 'Unknown'}</div>
            <div class="lead-meta">\\\${timeAgo} · \\\${lead.goal ? lead.goal.replace('_',' ') : 'No goal specified'}</div>
          </div>
          <div class="lead-actions">
            <span class="lead-type-tag \\\${typeTag}">\\\${typeLabel}</span>
            \\\${lead.phone ? \\\`<a href="\\\${waUrl}" class="lead-wa-btn" target="_blank" rel="noopener"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>\\\` : ''}
          </div>
        </div>\\\`;
    });
  } catch { /* silently fail */ }
}

function loadChart(days) {
  const bars = document.getElementById('chart-bars');
  const labels = document.getElementById('chart-labels');
  bars.innerHTML = ''; labels.innerHTML = '';
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today = new Date();
  const data = Array.from({length: days}, () => Math.floor(Math.random() * 40 + 5));
  const max = Math.max(...data);
  data.forEach((val, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (days - 1 - i));
    const isToday = i === days - 1;
    const pct = Math.max(8, Math.round((val / max) * 88));
    bars.innerHTML += \\\`<div class="chart-bar \\\${isToday ? 'today' : ''}" style="height:\\\${pct}%" title="\\\${val} views"></div>\\\`;
    if (days <= 7) labels.innerHTML += \\\`<div class="chart-label">\\\${dayNames[d.getDay()]}</div>\\\`;
    else if (i % 3 === 0) labels.innerHTML += \\\`<div class="chart-label" style="flex:3;">\\\${d.getDate()}/\\\${d.getMonth()+1}</div>\\\`;
  });
}

function buildChecklist(t) {
  const items = [
    { label: 'Profile photo added', sub: 'A photo increases leads by 5×', done: !!t.avatar_url, action: '/edit', actionLabel: 'Add' },
    { label: 'Bio written', sub: 'Tell clients what makes you different', done: !!(t.bio && t.bio.length > 30), action: '/edit', actionLabel: 'Write' },
    { label: 'REPs UAE verified', sub: 'Get the verified badge on your profile', done: !!t.reps_verified, action: '/edit', actionLabel: 'Verify' },
    { label: 'Session packages added', sub: 'Show clients your rates', done: !!(t.packages && t.packages.length > 0), action: '/edit', actionLabel: 'Add' },
    { label: 'Instagram connected', sub: 'Link your social media', done: !!t.instagram, action: '/edit', actionLabel: 'Connect' },
    { label: 'Profile shared', sub: 'Share your link on Instagram bio', done: false, action: null, actionLabel: null }
  ];
  const list = document.getElementById('checklist-list');
  const allDone = items.every(i => i.done);
  if (allDone) { document.getElementById('checklist-section').style.display = 'none'; return; }
  items.forEach(item => {
    list.innerHTML += \\\`
      <div class="checklist-item \\\${item.done ? 'done' : ''}">
        <div class="check-circle \\\${item.done ? 'done' : ''}">
          \\\${item.done ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : ''}
        </div>
        <div>
          <div class="checklist-text">\\\${item.label}</div>
          <div class="checklist-sub">\\\${item.sub}</div>
        </div>
        \\\${!item.done && item.action ? \\\`<a href="\\\${item.action}" class="checklist-action">\\\${item.actionLabel}</a>\\\` : ''}
      </div>\\\`;
  });
}

function copyUrl() {
  navigator.clipboard.writeText('https://' + window.location.hostname + '/' + trainer.slug).then(() => showToast('Link copied!', 'success'));
}
function copyReferral() {
  navigator.clipboard.writeText('https://' + window.location.hostname + '/join?ref=' + trainer.slug).then(() => showToast('Referral link copied!', 'success'));
}

async function startUpgrade() {
  try {
    const res = await fetch(EDGE_BASE + '/payment-router', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getAuthToken() },
      body: JSON.stringify({
        trainer_id: trainer.id,
        plan: 'pro',
        billing: 'monthly',
        success_url: location.origin + '/dashboard?upgraded=1',
        cancel_url: location.origin + '/dashboard',
      })
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || 'Could not start checkout.', 'error'); return; }
    if (data.provider === 'stripe' && data.checkout_url) {
      location.href = data.checkout_url;
    } else if (data.provider === 'razorpay') {
      await openRazorpay(data);
    } else {
      showToast('Could not start checkout. Please try again.', 'error');
    }
  } catch (err) {
    if (err && err.message && err.message.includes('razorpay')) {
      showToast('Payment provider unavailable. Please try again.', 'error');
    } else {
      showToast('Could not start checkout.', 'error');
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

function formatTimeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff/60) + 'm ago';
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
  return Math.floor(diff/86400) + 'd ago';
}

// Check for upgrade success
if (new URLSearchParams(location.search).get('upgraded') === '1') {
  showToast('Welcome to Pro! 🔥', 'success');
  history.replaceState({}, '', '/dashboard');
}

init();

// Handle Stripe Connect redirect params
(function handleStripeParam() {
  const params = new URLSearchParams(window.location.search);
  const stripeParam = params.get('stripe');
  if (!stripeParam) return;

  const token = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('tb_session='))?.slice('tb_session='.length);
  if (!token) return;

  const FUNCTIONS_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1';

  if (stripeParam === 'start') {
    // Initiate Stripe Connect
    fetch(\\\`\\\${FUNCTIONS_URL}/connect-stripe\\\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': \\\`Bearer \\\${token}\\\` },
      body: JSON.stringify({ trainer_id: trainer?.id }),
    })
    .then(r => r.json())
    .then(d => { if (d.url) window.location.href = d.url; })
    .catch(err => console.error('[connect-stripe]', err));
  }

  if (stripeParam === 'return') {
    // Verify onboarding completion
    fetch(\\\`\\\${FUNCTIONS_URL}/connect-stripe-return\\\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': \\\`Bearer \\\${token}\\\` },
      body: JSON.stringify({ trainer_id: trainer?.id }),
    })
    .then(r => r.json())
    .then(d => {
      if (d.onboarded) {
        // Clean URL and reload to show updated setup state
        window.history.replaceState({}, '', '/dashboard');
        window.location.reload();
      }
    })
    .catch(err => console.error('[connect-stripe-return]', err));
  }
})();

// ── Support Chatbot Widget ──────────────────────────────────────────────────────────
(function() {
  const SUPPORT_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1/support-agent';
  // ANON_KEY injected via define:vars from frontmatter

  const style = document.createElement('style');
  style.textContent = [
    '.tb-chat-btn{position:fixed;bottom:24px;right:20px;z-index:9999;width:52px;height:52px;border-radius:50%;background:#FF5C00;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(255,92,0,.4);transition:transform .2s,box-shadow .2s}',
    '.tb-chat-btn:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(255,92,0,.5)}',
    '.tb-chat-btn svg{width:24px;height:24px;fill:#fff}',
    '.tb-chat-window{position:fixed;bottom:88px;right:20px;z-index:9998;width:min(360px,calc(100vw - 40px));background:#111;border:1px solid rgba(255,255,255,.1);border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.6);display:none;flex-direction:column;font-family:Inter,sans-serif}',
    '.tb-chat-window.open{display:flex}',
    '.tb-chat-header{padding:14px 16px;background:#FF5C00;display:flex;align-items:center;justify-content:space-between}',
    '.tb-chat-header-title{font-weight:700;font-size:14px;color:#fff}',
    '.tb-chat-header-sub{font-size:11px;color:rgba(255,255,255,.75);margin-top:1px}',
    '.tb-chat-close{background:none;border:none;cursor:pointer;color:#fff;opacity:.7;padding:2px;line-height:1}',
    '.tb-chat-close:hover{opacity:1}',
    '.tb-chat-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;max-height:280px;min-height:120px}',
    '.tb-msg{max-width:85%;padding:10px 13px;border-radius:12px;font-size:13px;line-height:1.5}',
    '.tb-msg.bot{background:#1c1c1c;color:rgba(255,255,255,.9);border-bottom-left-radius:4px;align-self:flex-start}',
    '.tb-msg.user{background:#FF5C00;color:#fff;border-bottom-right-radius:4px;align-self:flex-end}',
    '.tb-msg.typing{opacity:.5;font-style:italic}',
    '.tb-chat-input-row{display:flex;gap:8px;padding:12px 16px;border-top:1px solid rgba(255,255,255,.08);background:#0a0a0a}',
    '.tb-chat-input{flex:1;background:#1c1c1c;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:9px 12px;color:#fff;font-size:13px;outline:none;font-family:inherit}',
    '.tb-chat-input:focus{border-color:rgba(255,92,0,.5)}',
    '.tb-chat-input::placeholder{color:rgba(255,255,255,.3)}',
    '.tb-chat-send{background:#FF5C00;border:none;border-radius:8px;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .2s}',
    '.tb-chat-send:hover{background:#e05200}',
    '.tb-chat-send svg{width:16px;height:16px;fill:#fff}',
    '.tb-chat-send:disabled{opacity:.4;cursor:not-allowed}'
  ].join('');
  document.head.appendChild(style);

  const btn = document.createElement('button');
  btn.className = 'tb-chat-btn';
  btn.title = 'Ask a question';
  btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';

  const win = document.createElement('div');
  win.className = 'tb-chat-window';
  const _bn = window.__BRAND__?.name || 'TrainedBy';
  win.innerHTML = '<div class="tb-chat-header"><div><div class="tb-chat-header-title">' + _bn + ' Support</div><div class="tb-chat-header-sub">Ask me anything about your account</div></div><button class="tb-chat-close" id="tb-close"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button></div><div class="tb-chat-messages" id="tb-msgs"><div class="tb-msg bot">Hey! Ask me anything about ' + _bn + ' - pricing, verification, referrals, or how features work.</div></div><div class="tb-chat-input-row"><input class="tb-chat-input" id="tb-input" placeholder="Ask a question..." maxlength="300"/><button class="tb-chat-send" id="tb-send"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button></div>';

  document.body.appendChild(btn);
  document.body.appendChild(win);

  let open = false, busy = false;

  btn.addEventListener('click', function() {
    open = !open;
    win.classList.toggle('open', open);
    if (open) document.getElementById('tb-input').focus();
  });
  document.getElementById('tb-close').addEventListener('click', function() {
    open = false; win.classList.remove('open');
  });

  async function sendQ() {
    const inp = document.getElementById('tb-input');
    const q = inp.value.trim();
    if (!q || busy) return;
    busy = true; inp.value = '';
    document.getElementById('tb-send').disabled = true;
    const msgs = document.getElementById('tb-msgs');
    msgs.innerHTML += '<div class="tb-msg user">' + q.replace(/</g,'&lt;') + '</div>';
    const typing = document.createElement('div');
    typing.className = 'tb-msg bot typing';
    typing.textContent = 'Thinking...';
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;
    try {
      const res = await fetch(SUPPORT_URL, {
        method: 'POST',
        headers: {'Content-Type':'application/json','Authorization':'Bearer '+ANON_KEY},
        body: JSON.stringify({question: q})
      });
      const data = await res.json();
      typing.className = 'tb-msg bot';
      typing.textContent = data.answer || 'Sorry, I could not find an answer to that.';
    } catch(e) {
      typing.className = 'tb-msg bot';
      typing.textContent = 'Connection error. Please try again.';
    }
    msgs.scrollTop = msgs.scrollHeight;
    busy = false;
    document.getElementById('tb-send').disabled = false;
    document.getElementById('tb-input').focus();
  }

  document.getElementById('tb-send').addEventListener('click', sendQ);
  document.getElementById('tb-input').addEventListener('keydown', function(e) { if(e.key==='Enter') sendQ(); });
})();

// ── Trainer AI Coach ─────────────────────────────────────────────────────────
(function() {
  const AI_URL = EDGE_BASE + '/trainer-assistant';
  let aiHistory = [];
  let aiBusy = false;
  let aiConversationId = 'default';

  window.openAI = function() {
    document.getElementById('ai-panel').classList.add('open');
    document.body.style.overflow = 'hidden';
    // Mark AI Coach nav item as active
    document.querySelectorAll('.bottom-nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector('.bottom-nav-item[onclick="openAI()"]')?.classList.add('active');
    setTimeout(() => document.getElementById('ai-input').focus(), 100);
  };

  window.closeAI = function() {
    document.getElementById('ai-panel').classList.remove('open');
    document.body.style.overflow = '';
    document.querySelectorAll('.bottom-nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector('a[href="/dashboard"]')?.classList.add('active');
  };

  window.sendChip = function(btn) {
    const text = btn.textContent.trim();
    // Hide chips after first use
    document.getElementById('ai-chips').style.display = 'none';
    document.getElementById('ai-welcome').style.display = 'none';
    sendAIMessage(text);
  };

  window.sendAI = function() {
    const inp = document.getElementById('ai-input');
    const q = inp.value.trim();
    if (!q || aiBusy) return;
    inp.value = '';
    inp.style.height = 'auto';
    document.getElementById('ai-welcome').style.display = 'none';
    document.getElementById('ai-chips').style.display = 'none';
    sendAIMessage(q);
  };

  async function sendAIMessage(question) {
    if (aiBusy) return;
    aiBusy = true;
    document.getElementById('ai-send').disabled = true;

    const msgs = document.getElementById('ai-messages');

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-msg user';
    userMsg.textContent = question;
    msgs.appendChild(userMsg);

    // Add typing indicator
    const typing = document.createElement('div');
    typing.className = 'ai-msg typing';
    typing.textContent = 'Thinking...';
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;

    // Build history for context
    aiHistory.push({ role: 'user', content: question });

    try {
      const res = await fetch(AI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          trainer_id: trainer?.id,
          message: question,
          conversation_id: aiConversationId,
          source: 'dashboard'
        })
      });

      const data = await res.json();
      const answer = data.reply || data.answer || data.message || 'Sorry, I could not process that. Please try again.';

      typing.className = 'ai-msg bot';
      typing.textContent = answer;
      aiHistory.push({ role: 'assistant', content: answer });

    } catch(e) {
      typing.className = 'ai-msg bot';
      typing.textContent = 'Connection error. Please check your internet and try again.';
    }

    msgs.scrollTop = msgs.scrollHeight;
    aiBusy = false;
    document.getElementById('ai-send').disabled = false;
    document.getElementById('ai-input').focus();
  }

  // Auto-resize textarea
  document.getElementById('ai-input').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  });

  // Send on Enter (Shift+Enter for newline)
  document.getElementById('ai-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      window.sendAI();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('ai-panel').classList.contains('open')) {
      window.closeAI();
    }
  });
})();

// ── AI Assistant Channel Management ─────────────────────────────────────────────────────────
window.selectChannel = async function(channel, save = true) {
  // Update button states
  document.querySelectorAll('.ai-channel-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.channel === channel);
  });
  // Show correct info panel
  ['dashboard', 'whatsapp', 'telegram'].forEach(ch => {
    const el = document.getElementById('ai-channel-' + ch);
    if (el) el.style.display = ch === channel ? 'block' : 'none';
  });
  // Persist to DB
  if (save && trainer?.id) {
    try {
      await sb.from('trainers').update({ assistant_channel: channel }).eq('id', trainer.id);
      showToast('Channel updated to ' + channel);
    } catch { /* silently fail */ }
  }
};

window.generateTelegramLink = async function() {
  if (!trainer?.id) return;
  try {
    const { data, error } = await sb.rpc('generate_telegram_link_token', { p_trainer_id: trainer.id });
    if (error) throw error;
    const token = data;
    const botName = window.__BRAND__?.telegramBot || 'TrainedByAssistantBot';
    const linkUrl = \\\`https://t.me/\\\${botName}?start=\\\${token}\\\`;
    document.getElementById('tg-link-url').textContent = linkUrl;
    document.getElementById('tg-link-url').href = linkUrl;
    document.getElementById('tg-link-display').style.display = 'block';
  } catch (e) {
    showToast('Could not generate link. Please try again.', 'error');
  }
};

window.unlinkTelegram = async function() {
  if (!trainer?.id) return;
  try {
    await sb.from('trainers').update({
      telegram_chat_id: null,
      telegram_username: null,
      assistant_channel: 'dashboard'
    }).eq('id', trainer.id);
    document.getElementById('tg-linked-state').style.display = 'none';
    document.getElementById('tg-unlinked-state').style.display = 'block';
    selectChannel('dashboard', false);
    showToast('Telegram unlinked');
  } catch { showToast('Could not unlink. Please try again.', 'error'); }
};
})();</script> `])), maybeRenderHead(), market.brandName, renderComponent($$result2, "ProfileCompleteness", $$ProfileCompleteness, { "score": ssrScore, "fields": ssrFields, "plan": ssrPlan, "slug": ssrSlug, "data-astro-cid-3nssi2tu": true }), !bookingReady && renderTemplate`<div style="background:rgba(255,92,0,0.06);border:1px solid rgba(255,92,0,0.18);border-radius:14px;padding:16px 18px;margin-bottom:20px;" data-astro-cid-3nssi2tu> <div style="font-size:13px;font-weight:700;color:rgba(255,255,255,0.9);margin-bottom:4px;" data-astro-cid-3nssi2tu>Finish setup to accept bookings</div> <div style="font-size:12px;color:rgba(255,255,255,0.45);margin-bottom:14px;" data-astro-cid-3nssi2tu>Complete these steps to go live.</div> <div style="display:flex;flex-direction:column;gap:10px;" data-astro-cid-3nssi2tu> ${bookingSetupSteps.map((step, i) => renderTemplate`<a${addAttribute(step.action, "href")}${addAttribute(`display:flex;align-items:center;gap:10px;text-decoration:none;opacity:${i > 0 && !bookingSetupSteps[i - 1].done ? "0.4" : "1"};pointer-events:${i > 0 && !bookingSetupSteps[i - 1].done ? "none" : "auto"};`, "style")} data-astro-cid-3nssi2tu> <div${addAttribute(`width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:${step.done ? "#4CAF50" : "rgba(255,255,255,0.08)"};border:1.5px solid ${step.done ? "#4CAF50" : "rgba(255,255,255,0.15)"};`, "style")} data-astro-cid-3nssi2tu> ${step.done ? renderTemplate`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" data-astro-cid-3nssi2tu><polyline points="20 6 9 17 4 12" data-astro-cid-3nssi2tu></polyline></svg>` : renderTemplate`<span style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.5);" data-astro-cid-3nssi2tu>${i + 1}</span>`} </div> <span${addAttribute(`font-size:13px;font-weight:500;color:${step.done ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.85)"};text-decoration:${step.done ? "line-through" : "none"};`, "style")} data-astro-cid-3nssi2tu>${step.label}</span> ${!step.done && renderTemplate`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" style="margin-left:auto;" data-astro-cid-3nssi2tu><path d="M9 18l6-6-6-6" data-astro-cid-3nssi2tu></path></svg>`} </a>`)} </div> </div>`, t(locale, "dash.stats_leads"), t(locale, "dash.stats_views"), t(locale, "dash.stats_wa"), t(locale, "dash.stats_views"), t(locale, "dash.stats_leads"), bookings.length === 0 ? renderTemplate`<p style="font-size:13px;color:var(--text-muted);line-height:1.6" data-astro-cid-3nssi2tu>No bookings yet. Share your booking link with clients to get started.</p>` : renderTemplate`<div data-astro-cid-3nssi2tu> ${bookings.map((b) => {
    const d = new Date(b.scheduled_at);
    const isPast = d < /* @__PURE__ */ new Date();
    const isUpcoming = !isPast && b.status === "confirmed";
    const statusColor = b.status === "confirmed" || b.status === "completed" ? "var(--reps)" : b.status === "cancelled" || b.status === "refunded" ? "var(--danger)" : "var(--text-faint)";
    const statusBg = b.status === "confirmed" || b.status === "completed" ? "var(--reps-dim)" : b.status === "cancelled" || b.status === "refunded" ? "var(--danger-dim)" : "rgba(255,255,255,0.05)";
    return renderTemplate`<div style="background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:14px 16px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px" data-astro-cid-3nssi2tu> <div data-astro-cid-3nssi2tu> <div style="font-size:13px;font-weight:600" data-astro-cid-3nssi2tu>${b.consumer_name}</div> <div style="font-size:12px;color:var(--text-muted);margin-top:2px" data-astro-cid-3nssi2tu> ${b.session_type?.name ?? "Session"} · ${d.toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" })} at ${d.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" })} </div> <div style="font-size:12px;color:var(--text-muted);margin-top:2px" data-astro-cid-3nssi2tu> ${market.currencySymbol}${(b.amount_cents / 100).toFixed(2)} · ${b.duration_min} min
</div> </div> <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0" data-astro-cid-3nssi2tu> <span${addAttribute(`font-size:10px;font-weight:700;padding:3px 8px;border-radius:4px;background:${statusBg};color:${statusColor}`, "style")} data-astro-cid-3nssi2tu> ${b.status.toUpperCase()} </span> ${isUpcoming && renderTemplate`<span style="font-size:11px;color:var(--text-muted)" data-astro-cid-3nssi2tu>Contact client to cancel</span>`} </div> </div>`;
  })} </div>`, t(locale, "dash.channel_title"), t(locale, "dash.channel_sub"), t(locale, "dash.channel_dashboard"), t(locale, "dash.channel_whatsapp"), t(locale, "dash.channel_telegram"), t(locale, "dash.ai_title"), t(locale, "dash.channel_dashboard"), t(locale, "nav_edit"), t(locale, "dash.ai_title"), t(locale, "profile_verified_badge").replace("✓ ", ""), t(locale, "pricing.pro_name"), defineScriptVars({ SUPABASE_ANON_KEY, ANON_KEY })), "head": async ($$result2) => renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "slot": "head" }, { "default": async ($$result3) => renderTemplate` <meta name="color-scheme" content="light"> <meta name="theme-color" content="#FFFFFF"> <meta name="apple-mobile-web-app-status-bar-style" content="default"> <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;1,9..40,400&display=swap" rel="stylesheet">  ` })}` })}`;
}, "/Users/bobanpepic/trainedby/src/pages/dashboard.astro", void 0);
const $$file = "/Users/bobanpepic/trainedby/src/pages/dashboard.astro";
const $$url = "/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Dashboard,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
