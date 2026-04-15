import { g as getMarket, $ as $$Base } from './Base_glshNjsF.mjs';
import { c as createComponent } from './astro-component_QCe02764.mjs';
import { r as renderTemplate, m as maybeRenderHead, h as renderComponent } from './ssr-function_qCRG1Hg9.mjs';

var __freeze$1 = Object.freeze;
var __defProp$1 = Object.defineProperty;
var __template$1 = (cooked, raw) => __freeze$1(__defProp$1(cooked, "raw", { value: __freeze$1(raw || cooked.slice()) }));
var _a$1;
const $$ProfileCompleteness = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a$1 || (_a$1 = __template$1(["", `<div id="profile-completeness" class="pc-widget hidden" data-astro-cid-nf3zlqki> <div class="pc-header" data-astro-cid-nf3zlqki> <div class="pc-ring-wrap" data-astro-cid-nf3zlqki> <svg class="pc-ring" viewBox="0 0 44 44" fill="none" data-astro-cid-nf3zlqki> <circle cx="22" cy="22" r="18" stroke="rgba(255,255,255,0.08)" stroke-width="4" data-astro-cid-nf3zlqki></circle> <circle id="pc-ring-fill" cx="22" cy="22" r="18" stroke="#FF5C00" stroke-width="4" stroke-linecap="round" stroke-dasharray="113.1" stroke-dashoffset="113.1" transform="rotate(-90 22 22)" style="transition: stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" data-astro-cid-nf3zlqki></circle> </svg> <span id="pc-pct" class="pc-pct-label" data-astro-cid-nf3zlqki>0%</span> </div> <div class="pc-title-block" data-astro-cid-nf3zlqki> <div class="pc-title" data-astro-cid-nf3zlqki>Profile Strength</div> <div id="pc-status" class="pc-status" data-astro-cid-nf3zlqki>Loading...</div> </div> <button class="pc-toggle" onclick="togglePCDetails()" aria-label="Toggle details" data-astro-cid-nf3zlqki> <svg id="pc-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-astro-cid-nf3zlqki> <path d="M6 9l6 6 6-6" data-astro-cid-nf3zlqki></path> </svg> </button> </div> <div id="pc-details" class="pc-details hidden" data-astro-cid-nf3zlqki> <div id="pc-items" class="pc-items" data-astro-cid-nf3zlqki></div> <div id="pc-upgrade-nudge" class="pc-upgrade-nudge hidden" data-astro-cid-nf3zlqki> <span class="pc-nudge-text" data-astro-cid-nf3zlqki>Upgrade to Pro to unlock digital product sales</span> <a href="/pricing" class="pc-nudge-btn" data-astro-cid-nf3zlqki>Upgrade →</a> </div> </div> </div>  <script>
const PC_ITEMS = [
  { key: 'avatar_url',    label: 'Profile photo',           pts: 20, action: '/edit' },
  { key: 'bio',           label: 'Bio (30+ characters)',     pts: 20, action: '/edit', check: t => t.bio && t.bio.length >= 30 },
  { key: 'reps_verified', label: 'Verification badge',       pts: 15, action: '/edit' },
  { key: 'specialties',   label: 'Specialties',              pts: 10, action: '/edit', check: t => t.specialties && t.specialties.length > 0 },
  { key: 'city',          label: 'City / location',          pts: 10, action: '/edit' },
  { key: 'instagram',     label: 'Instagram handle',         pts: 10, action: '/edit' },
  { key: 'session_packages', label: 'Session packages',      pts: 15, action: '/edit', check: t => t.session_packages && t.session_packages.length > 0 },
];

function computePC(t) {
  let score = 0;
  const items = PC_ITEMS.map(item => {
    const done = item.check ? item.check(t) : !!t[item.key];
    if (done) score += item.pts;
    return { ...item, done };
  });
  return { score: Math.min(100, score), items };
}

function renderPC(trainer) {
  const widget = document.getElementById('profile-completeness');
  if (!widget) return;

  const { score, items } = computePC(trainer);

  // Show widget
  widget.classList.remove('hidden');

  // Ring animation
  const circumference = 113.1;
  const offset = circumference - (score / 100) * circumference;
  const ring = document.getElementById('pc-ring-fill');
  if (ring) {
    setTimeout(() => { ring.style.strokeDashoffset = offset; }, 100);
  }

  // Percentage
  const pctEl = document.getElementById('pc-pct');
  if (pctEl) pctEl.textContent = score + '%';

  // Status label
  const statusEl = document.getElementById('pc-status');
  if (statusEl) {
    if (score >= 90) statusEl.textContent = 'Elite — you\\'re maximising visibility';
    else if (score >= 70) statusEl.textContent = 'Strong — a few items left';
    else if (score >= 40) statusEl.textContent = 'Building — keep going';
    else statusEl.textContent = 'Just started — complete your profile';
  }

  // Items list
  const itemsEl = document.getElementById('pc-items');
  if (itemsEl) {
    itemsEl.innerHTML = '';
    items.forEach(item => {
      const el = document.createElement('a');
      el.href = item.done ? '#' : item.action;
      el.className = 'pc-item' + (item.done ? ' done' : '');
      el.innerHTML = \`
        <div class="pc-check">
          <svg class="pc-check-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          <span class="pc-check-empty" style="width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.2)"></span>
        </div>
        <span class="pc-item-label">\${item.label}</span>
        <span class="pc-item-pts">\${item.done ? '✓' : '+' + item.pts + 'pts'}</span>
      \`;
      if (item.done) el.onclick = e => e.preventDefault();
      itemsEl.appendChild(el);
    });
  }

  // Upgrade nudge for free plan trainers
  const nudge = document.getElementById('pc-upgrade-nudge');
  if (nudge && trainer.plan === 'free' && score >= 70) {
    nudge.classList.remove('hidden');
  }
}

function togglePCDetails() {
  const details = document.getElementById('pc-details');
  const chevron = document.getElementById('pc-chevron');
  if (!details) return;
  const isHidden = details.classList.toggle('hidden');
  if (chevron) {
    chevron.style.transform = isHidden ? '' : 'rotate(180deg)';
  }
}

// Expose globally so dashboard.js can call renderPC(trainer)
window.renderPC = renderPC;
<\/script>`], ["", `<div id="profile-completeness" class="pc-widget hidden" data-astro-cid-nf3zlqki> <div class="pc-header" data-astro-cid-nf3zlqki> <div class="pc-ring-wrap" data-astro-cid-nf3zlqki> <svg class="pc-ring" viewBox="0 0 44 44" fill="none" data-astro-cid-nf3zlqki> <circle cx="22" cy="22" r="18" stroke="rgba(255,255,255,0.08)" stroke-width="4" data-astro-cid-nf3zlqki></circle> <circle id="pc-ring-fill" cx="22" cy="22" r="18" stroke="#FF5C00" stroke-width="4" stroke-linecap="round" stroke-dasharray="113.1" stroke-dashoffset="113.1" transform="rotate(-90 22 22)" style="transition: stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" data-astro-cid-nf3zlqki></circle> </svg> <span id="pc-pct" class="pc-pct-label" data-astro-cid-nf3zlqki>0%</span> </div> <div class="pc-title-block" data-astro-cid-nf3zlqki> <div class="pc-title" data-astro-cid-nf3zlqki>Profile Strength</div> <div id="pc-status" class="pc-status" data-astro-cid-nf3zlqki>Loading...</div> </div> <button class="pc-toggle" onclick="togglePCDetails()" aria-label="Toggle details" data-astro-cid-nf3zlqki> <svg id="pc-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-astro-cid-nf3zlqki> <path d="M6 9l6 6 6-6" data-astro-cid-nf3zlqki></path> </svg> </button> </div> <div id="pc-details" class="pc-details hidden" data-astro-cid-nf3zlqki> <div id="pc-items" class="pc-items" data-astro-cid-nf3zlqki></div> <div id="pc-upgrade-nudge" class="pc-upgrade-nudge hidden" data-astro-cid-nf3zlqki> <span class="pc-nudge-text" data-astro-cid-nf3zlqki>Upgrade to Pro to unlock digital product sales</span> <a href="/pricing" class="pc-nudge-btn" data-astro-cid-nf3zlqki>Upgrade →</a> </div> </div> </div>  <script>
const PC_ITEMS = [
  { key: 'avatar_url',    label: 'Profile photo',           pts: 20, action: '/edit' },
  { key: 'bio',           label: 'Bio (30+ characters)',     pts: 20, action: '/edit', check: t => t.bio && t.bio.length >= 30 },
  { key: 'reps_verified', label: 'Verification badge',       pts: 15, action: '/edit' },
  { key: 'specialties',   label: 'Specialties',              pts: 10, action: '/edit', check: t => t.specialties && t.specialties.length > 0 },
  { key: 'city',          label: 'City / location',          pts: 10, action: '/edit' },
  { key: 'instagram',     label: 'Instagram handle',         pts: 10, action: '/edit' },
  { key: 'session_packages', label: 'Session packages',      pts: 15, action: '/edit', check: t => t.session_packages && t.session_packages.length > 0 },
];

function computePC(t) {
  let score = 0;
  const items = PC_ITEMS.map(item => {
    const done = item.check ? item.check(t) : !!t[item.key];
    if (done) score += item.pts;
    return { ...item, done };
  });
  return { score: Math.min(100, score), items };
}

function renderPC(trainer) {
  const widget = document.getElementById('profile-completeness');
  if (!widget) return;

  const { score, items } = computePC(trainer);

  // Show widget
  widget.classList.remove('hidden');

  // Ring animation
  const circumference = 113.1;
  const offset = circumference - (score / 100) * circumference;
  const ring = document.getElementById('pc-ring-fill');
  if (ring) {
    setTimeout(() => { ring.style.strokeDashoffset = offset; }, 100);
  }

  // Percentage
  const pctEl = document.getElementById('pc-pct');
  if (pctEl) pctEl.textContent = score + '%';

  // Status label
  const statusEl = document.getElementById('pc-status');
  if (statusEl) {
    if (score >= 90) statusEl.textContent = 'Elite — you\\\\'re maximising visibility';
    else if (score >= 70) statusEl.textContent = 'Strong — a few items left';
    else if (score >= 40) statusEl.textContent = 'Building — keep going';
    else statusEl.textContent = 'Just started — complete your profile';
  }

  // Items list
  const itemsEl = document.getElementById('pc-items');
  if (itemsEl) {
    itemsEl.innerHTML = '';
    items.forEach(item => {
      const el = document.createElement('a');
      el.href = item.done ? '#' : item.action;
      el.className = 'pc-item' + (item.done ? ' done' : '');
      el.innerHTML = \\\`
        <div class="pc-check">
          <svg class="pc-check-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          <span class="pc-check-empty" style="width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.2)"></span>
        </div>
        <span class="pc-item-label">\\\${item.label}</span>
        <span class="pc-item-pts">\\\${item.done ? '✓' : '+' + item.pts + 'pts'}</span>
      \\\`;
      if (item.done) el.onclick = e => e.preventDefault();
      itemsEl.appendChild(el);
    });
  }

  // Upgrade nudge for free plan trainers
  const nudge = document.getElementById('pc-upgrade-nudge');
  if (nudge && trainer.plan === 'free' && score >= 70) {
    nudge.classList.remove('hidden');
  }
}

function togglePCDetails() {
  const details = document.getElementById('pc-details');
  const chevron = document.getElementById('pc-chevron');
  if (!details) return;
  const isHidden = details.classList.toggle('hidden');
  if (chevron) {
    chevron.style.transform = isHidden ? '' : 'rotate(180deg)';
  }
}

// Expose globally so dashboard.js can call renderPC(trainer)
window.renderPC = renderPC;
<\/script>`])), maybeRenderHead());
}, "/home/ubuntu/trainedby2/src/components/ProfileCompleteness.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Dashboard = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Dashboard;
  const market = getMarket(Astro2.url.hostname);
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": `Dashboard — ${market.brandName}`, "description": `Your ${market.brandName} trainer dashboard. Manage leads, analytics, digital products, and affiliate income.`, "data-astro-cid-3nssi2tu": true }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template(["  ", `<div class="dash-wrap" data-astro-cid-3nssi2tu> <!-- Header --> <div class="dash-header" data-astro-cid-3nssi2tu> <a href="/" class="dash-logo" data-astro-cid-3nssi2tu> <svg width="26" height="26" viewBox="0 0 32 32" data-astro-cid-3nssi2tu><rect width="32" height="32" rx="8" fill="#FF5C00" data-astro-cid-3nssi2tu></rect><text x="16" y="23" font-family="Manrope,Arial,sans-serif" font-size="14" font-weight="800" text-anchor="middle" fill="white" data-astro-cid-3nssi2tu>TB</text></svg>
Dashboard
</a> <div class="header-nav" data-astro-cid-3nssi2tu> <a href="/edit" class="nav-edit" data-astro-cid-3nssi2tu>Edit</a> <a id="view-link" href="#" class="nav-view" data-astro-cid-3nssi2tu>View Profile</a> </div> </div> <!-- Loading --> <div id="dash-loading" style="text-align:center;padding:60px 0;" data-astro-cid-3nssi2tu> <div style="display:flex;align-items:center;justify-content:center;gap:8px;" data-astro-cid-3nssi2tu> <div style="width:8px;height:8px;border-radius:50%;background:var(--brand);animation:pulse 1.2s ease-in-out infinite;" data-astro-cid-3nssi2tu></div> <div style="width:8px;height:8px;border-radius:50%;background:var(--brand);animation:pulse 1.2s ease-in-out infinite;animation-delay:0.2s;" data-astro-cid-3nssi2tu></div> <div style="width:8px;height:8px;border-radius:50%;background:var(--brand);animation:pulse 1.2s ease-in-out infinite;animation-delay:0.4s;" data-astro-cid-3nssi2tu></div> </div> </div> <!-- Auth gate --> <div id="dash-auth" class="hidden" style="text-align:center;padding:60px 0;" data-astro-cid-3nssi2tu> <h2 style="font-family:'Manrope',sans-serif;font-size:20px;font-weight:800;margin-bottom:8px;" data-astro-cid-3nssi2tu>Sign in to view your dashboard</h2> <p style="font-size:14px;color:var(--text-muted);margin-bottom:24px;" data-astro-cid-3nssi2tu>Access your leads, analytics, and profile settings.</p> <a href="/edit" style="display:inline-block;padding:14px 28px;border-radius:12px;background:var(--brand);color:#fff;text-decoration:none;font-family:'Manrope',sans-serif;font-size:14px;font-weight:700;" data-astro-cid-3nssi2tu>Sign In →</a> </div> <!-- Dashboard content --> <div id="dash-content" class="hidden" data-astro-cid-3nssi2tu> <!-- Greeting --> <div class="trainer-greeting" data-astro-cid-3nssi2tu> <div class="greeting-row" data-astro-cid-3nssi2tu> <img id="dash-avatar" class="greeting-avatar" src="" alt="Avatar" data-astro-cid-3nssi2tu> <div data-astro-cid-3nssi2tu> <div class="greeting-name" id="dash-name" data-astro-cid-3nssi2tu>Loading...</div> <div class="greeting-sub" id="dash-sub" data-astro-cid-3nssi2tu>`, '</div> </div> </div> <div class="url-bar" data-astro-cid-3nssi2tu> <span class="url-bar-text" id="dash-url" data-astro-cid-3nssi2tu>...</span> <button class="url-copy-btn" onclick="copyUrl()" data-astro-cid-3nssi2tu>Copy Link</button> </div> </div> <!-- Profile Completeness Widget --> ', ` <!-- Stats --> <div class="stats-section" data-astro-cid-3nssi2tu> <div class="stats-section-title" data-astro-cid-3nssi2tu>This Week</div> <div class="stats-grid" data-astro-cid-3nssi2tu> <div class="stat-card brand-card" data-astro-cid-3nssi2tu> <div class="stat-card-icon" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-3nssi2tu><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" data-astro-cid-3nssi2tu></path><circle cx="9" cy="7" r="4" data-astro-cid-3nssi2tu></circle><path d="M23 21v-2a4 4 0 00-3-3.87" data-astro-cid-3nssi2tu></path><path d="M16 3.13a4 4 0 010 7.75" data-astro-cid-3nssi2tu></path></svg> </div> <div class="stat-card-value" id="stat-leads" data-astro-cid-3nssi2tu>—</div> <div class="stat-card-label" data-astro-cid-3nssi2tu>New Leads</div> <div class="stat-card-change up" id="stat-leads-change" data-astro-cid-3nssi2tu></div> </div> <div class="stat-card" data-astro-cid-3nssi2tu> <div class="stat-card-icon" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-3nssi2tu><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" data-astro-cid-3nssi2tu></path><circle cx="12" cy="12" r="3" data-astro-cid-3nssi2tu></circle></svg> </div> <div class="stat-card-value" id="stat-views" data-astro-cid-3nssi2tu>—</div> <div class="stat-card-label" data-astro-cid-3nssi2tu>Profile Views</div> <div class="stat-card-change up" id="stat-views-change" data-astro-cid-3nssi2tu></div> </div> <div class="stat-card" data-astro-cid-3nssi2tu> <div class="stat-card-icon" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-3nssi2tu><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" data-astro-cid-3nssi2tu></path></svg> </div> <div class="stat-card-value" id="stat-wa-taps" data-astro-cid-3nssi2tu>—</div> <div class="stat-card-label" data-astro-cid-3nssi2tu>WhatsApp Taps</div> <div class="stat-card-change up" id="stat-wa-change" data-astro-cid-3nssi2tu></div> </div> <div class="stat-card" data-astro-cid-3nssi2tu> <div class="stat-card-icon" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-3nssi2tu><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" data-astro-cid-3nssi2tu></polyline></svg> </div> <div class="stat-card-value" id="stat-assess" data-astro-cid-3nssi2tu>—</div> <div class="stat-card-label" data-astro-cid-3nssi2tu>Assessments</div> <div class="stat-card-change up" id="stat-assess-change" data-astro-cid-3nssi2tu></div> </div> </div> </div> <!-- WHOOP-style Actionable Insight Banner --> <div id="insight-banner" style="display:none;margin:16px 0;background:linear-gradient(135deg,rgba(255,92,0,0.10),rgba(255,92,0,0.04));border:1px solid rgba(255,92,0,0.25);border-radius:14px;padding:14px 16px;" data-astro-cid-3nssi2tu> <div style="display:flex;align-items:flex-start;gap:10px;" data-astro-cid-3nssi2tu> <div style="width:32px;height:32px;border-radius:8px;background:rgba(255,92,0,0.15);border:1px solid rgba(255,92,0,0.25);display:flex;align-items:center;justify-content:center;flex-shrink:0;" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF5C00" stroke-width="2.5" data-astro-cid-3nssi2tu><circle cx="12" cy="12" r="10" data-astro-cid-3nssi2tu></circle><line x1="12" y1="8" x2="12" y2="12" data-astro-cid-3nssi2tu></line><line x1="12" y1="16" x2="12.01" y2="16" data-astro-cid-3nssi2tu></line></svg> </div> <div data-astro-cid-3nssi2tu> <div style="font-size:11px;font-weight:700;color:rgba(255,92,0,0.9);letter-spacing:0.05em;text-transform:uppercase;margin-bottom:3px;" data-astro-cid-3nssi2tu>Insight</div> <div id="insight-text" style="font-size:13px;color:rgba(255,255,255,0.85);line-height:1.5;" data-astro-cid-3nssi2tu></div> <div id="insight-action" style="margin-top:8px;" data-astro-cid-3nssi2tu></div> </div> </div> </div> <!-- Views chart --> <div class="chart-section" data-astro-cid-3nssi2tu> <div class="chart-header" data-astro-cid-3nssi2tu> <span class="chart-title" data-astro-cid-3nssi2tu>Profile Views</span> <select class="chart-period-select" onchange="loadChart(this.value)" data-astro-cid-3nssi2tu> <option value="7" data-astro-cid-3nssi2tu>Last 7 days</option> <option value="14" data-astro-cid-3nssi2tu>Last 14 days</option> <option value="30" data-astro-cid-3nssi2tu>Last 30 days</option> </select> </div> <div class="chart-area" data-astro-cid-3nssi2tu> <div class="chart-bars" id="chart-bars" data-astro-cid-3nssi2tu></div> </div> <div class="chart-labels" id="chart-labels" data-astro-cid-3nssi2tu></div> </div> <!-- Leads --> <div class="leads-section" data-astro-cid-3nssi2tu> <div class="leads-header" data-astro-cid-3nssi2tu> <span class="leads-title" data-astro-cid-3nssi2tu>Recent Leads</span> <span class="leads-count" id="leads-total-badge" data-astro-cid-3nssi2tu>0</span> </div> <div id="leads-list" data-astro-cid-3nssi2tu> <div class="empty-state" data-astro-cid-3nssi2tu> <div class="empty-state-icon" data-astro-cid-3nssi2tu> <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" data-astro-cid-3nssi2tu><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" data-astro-cid-3nssi2tu></path><circle cx="9" cy="7" r="4" data-astro-cid-3nssi2tu></circle><path d="M23 21v-2a4 4 0 00-3-3.87" data-astro-cid-3nssi2tu></path><path d="M16 3.13a4 4 0 010 7.75" data-astro-cid-3nssi2tu></path></svg> </div> <div class="empty-state-text" data-astro-cid-3nssi2tu>No leads yet — share your profile link to get started.</div> </div> </div> </div> <!-- Onboarding Checklist --> <div class="checklist-section" id="checklist-section" data-astro-cid-3nssi2tu> <div class="checklist-title" data-astro-cid-3nssi2tu>Getting Started</div> <div id="checklist-list" data-astro-cid-3nssi2tu></div> </div> <!-- Income Streams --> <div class="income-section" id="income-section" data-astro-cid-3nssi2tu> <div class="stats-section-title" style="margin-bottom:14px" data-astro-cid-3nssi2tu>Your Income Streams</div> <div class="income-grid" id="income-grid" data-astro-cid-3nssi2tu> <div class="income-stream-card active" data-astro-cid-3nssi2tu> <div class="income-stream-icon" data-astro-cid-3nssi2tu>🏋️</div> <div class="income-stream-label" data-astro-cid-3nssi2tu>Sessions</div> <div class="income-stream-value" id="is-sessions" data-astro-cid-3nssi2tu>Active</div> <div class="income-stream-sub" data-astro-cid-3nssi2tu>Your core training income</div> </div> <div class="income-stream-card locked" id="is-affiliate-card" data-astro-cid-3nssi2tu> <div class="income-stream-lock" data-astro-cid-3nssi2tu> <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2.5" data-astro-cid-3nssi2tu><rect x="3" y="11" width="18" height="11" rx="2" data-astro-cid-3nssi2tu></rect><path d="M7 11V7a5 5 0 0110 0v4" data-astro-cid-3nssi2tu></path></svg> </div> <div class="income-stream-icon" data-astro-cid-3nssi2tu>💰</div> <div class="income-stream-label" data-astro-cid-3nssi2tu>Affiliate Vault</div> <div class="income-stream-value" data-astro-cid-3nssi2tu>Locked</div> <div class="income-stream-sub" data-astro-cid-3nssi2tu>Gymshark, ZEROFAT &amp; more</div> </div> <div class="income-stream-card locked" id="is-digital-card" data-astro-cid-3nssi2tu> <div class="income-stream-lock" data-astro-cid-3nssi2tu> <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2.5" data-astro-cid-3nssi2tu><rect x="3" y="11" width="18" height="11" rx="2" data-astro-cid-3nssi2tu></rect><path d="M7 11V7a5 5 0 0110 0v4" data-astro-cid-3nssi2tu></path></svg> </div> <div class="income-stream-icon" data-astro-cid-3nssi2tu>📦</div> <div class="income-stream-label" data-astro-cid-3nssi2tu>Digital Products</div> <div class="income-stream-value" data-astro-cid-3nssi2tu>Locked</div> <div class="income-stream-sub" data-astro-cid-3nssi2tu>PDFs, plans &amp; courses</div> </div> <div class="income-stream-card locked" id="is-referral-card" data-astro-cid-3nssi2tu> <div class="income-stream-lock" data-astro-cid-3nssi2tu> <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2.5" data-astro-cid-3nssi2tu><rect x="3" y="11" width="18" height="11" rx="2" data-astro-cid-3nssi2tu></rect><path d="M7 11V7a5 5 0 0110 0v4" data-astro-cid-3nssi2tu></path></svg> </div> <div class="income-stream-icon" data-astro-cid-3nssi2tu>🔗</div> <div class="income-stream-label" data-astro-cid-3nssi2tu>Referral Income</div> <div class="income-stream-value" data-astro-cid-3nssi2tu>Locked</div> <div class="income-stream-sub" data-astro-cid-3nssi2tu>Earn from trainer referrals</div> </div> </div> </div> <!-- Upgrade Banner --> <div class="upgrade-banner" id="upgrade-banner" data-astro-cid-3nssi2tu> <div class="upgrade-title" data-astro-cid-3nssi2tu>🔓 Unlock 3 More Income Streams</div> <div class="upgrade-sub" data-astro-cid-3nssi2tu>Pro trainers earn an average of <strong style="color:#fff" data-astro-cid-3nssi2tu>6,200 AED/month</strong> in passive income from affiliates and digital products — on top of their sessions.</div> <div class="upgrade-features" data-astro-cid-3nssi2tu> <div class="upgrade-feature" data-astro-cid-3nssi2tu> <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF5C00" data-astro-cid-3nssi2tu><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-3nssi2tu></path></svg> <strong style="color:#FF5C00" data-astro-cid-3nssi2tu>Master Affiliate Vault</strong> — Gymshark, ZEROFAT, MyProtein
</div> <div class="upgrade-feature" data-astro-cid-3nssi2tu> <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF5C00" data-astro-cid-3nssi2tu><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-3nssi2tu></path></svg> <strong style="color:#FF5C00" data-astro-cid-3nssi2tu>Digital Product Hub</strong> — sell PDFs, plans &amp; courses
</div> <div class="upgrade-feature" data-astro-cid-3nssi2tu> <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF5C00" data-astro-cid-3nssi2tu><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-3nssi2tu></path></svg> <strong style="color:#FF5C00" data-astro-cid-3nssi2tu>Grand Slam Offer Builder</strong> — AI-powered outcome cards
</div> <div class="upgrade-feature" data-astro-cid-3nssi2tu> <svg width="14" height="14" viewBox="0 0 24 24" fill="#00C853" data-astro-cid-3nssi2tu><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-3nssi2tu></path></svg>
WhatsApp lead notifications + analytics
</div> </div> <button class="upgrade-btn" onclick="startUpgrade()" data-astro-cid-3nssi2tu>🔓 Unlock Passive Income — AED 99/mo</button> <div style="text-align:center;font-size:11px;color:var(--text-muted);margin-top:10px" data-astro-cid-3nssi2tu>🛡 ROI Guarantee: 1,000 AED in 30 days or full refund</div> </div> <!-- Referral Flywheel --> <div class="referral-section" data-astro-cid-3nssi2tu> <div class="referral-card" data-astro-cid-3nssi2tu> <div class="referral-title" data-astro-cid-3nssi2tu>🔄 The Referral Flywheel</div> <div class="referral-sub" data-astro-cid-3nssi2tu>Refer 4 trainers to Pro and your subscription is <strong style="color:#fff" data-astro-cid-3nssi2tu>free forever</strong>. Each referral earns you 1 free month.</div> <div class="flywheel-reward" data-astro-cid-3nssi2tu> <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" data-astro-cid-3nssi2tu><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" data-astro-cid-3nssi2tu></path></svg> <span id="flywheel-reward-text" data-astro-cid-3nssi2tu>Refer 4 trainers = free Pro forever</span> </div> <div class="flywheel-progress" data-astro-cid-3nssi2tu> <div class="flywheel-label" data-astro-cid-3nssi2tu> <span id="flywheel-count-label" data-astro-cid-3nssi2tu>0 of 4 referrals</span> <span id="flywheel-pct-label" data-astro-cid-3nssi2tu>0% to free Pro</span> </div> <div class="flywheel-bar" data-astro-cid-3nssi2tu><div class="flywheel-fill" id="flywheel-fill" style="width:0%" data-astro-cid-3nssi2tu></div></div> <div class="flywheel-steps" id="flywheel-steps" data-astro-cid-3nssi2tu> <div class="flywheel-step" data-astro-cid-3nssi2tu></div> <div class="flywheel-step" data-astro-cid-3nssi2tu></div> <div class="flywheel-step" data-astro-cid-3nssi2tu></div> <div class="flywheel-step" data-astro-cid-3nssi2tu></div> </div> </div> <div class="referral-url" data-astro-cid-3nssi2tu> <span class="referral-url-text" id="referral-url-text" data-astro-cid-3nssi2tu>loading...</span> <button class="url-copy-btn" onclick="copyReferral()" data-astro-cid-3nssi2tu>Copy</button> </div> <div class="referral-share-btns" data-astro-cid-3nssi2tu> <a id="referral-wa-share" href="#" class="referral-share-btn" target="_blank" data-astro-cid-3nssi2tu> <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" data-astro-cid-3nssi2tu><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" data-astro-cid-3nssi2tu></path></svg>
Share on WhatsApp
</a> <button class="referral-share-btn" onclick="copyReferral()" data-astro-cid-3nssi2tu> <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-3nssi2tu><rect x="9" y="9" width="13" height="13" rx="2" data-astro-cid-3nssi2tu></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" data-astro-cid-3nssi2tu></path></svg>
Copy Link
</button> </div> </div> </div> </div><!-- /dash-content --> </div>  <div class="ai-panel" id="ai-panel" data-astro-cid-3nssi2tu> <div class="ai-panel-header" data-astro-cid-3nssi2tu> <div class="ai-panel-title" data-astro-cid-3nssi2tu> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF5C00" stroke-width="2" data-astro-cid-3nssi2tu><path d="M12 2a10 10 0 110 20A10 10 0 0112 2z" data-astro-cid-3nssi2tu></path><path d="M12 6v6l4 2" data-astro-cid-3nssi2tu></path></svg>
Your AI Coach
<span class="ai-panel-badge" data-astro-cid-3nssi2tu>Beta</span> </div> <button class="ai-panel-close" onclick="closeAI()" data-astro-cid-3nssi2tu>Done</button> </div> <div class="ai-messages" id="ai-messages" data-astro-cid-3nssi2tu> <div class="ai-welcome" id="ai-welcome" data-astro-cid-3nssi2tu> <div class="ai-welcome-icon" data-astro-cid-3nssi2tu> <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF5C00" stroke-width="1.8" data-astro-cid-3nssi2tu><circle cx="12" cy="12" r="10" data-astro-cid-3nssi2tu></circle><path d="M12 8v4l3 3" data-astro-cid-3nssi2tu></path></svg> </div> <div class="ai-welcome-title" data-astro-cid-3nssi2tu>Hey, I'm your AI coach</div> <div class="ai-welcome-sub" data-astro-cid-3nssi2tu>I know your profile, your market, and your goals. Ask me anything — from writing your bio to building a 12-week programme.</div> </div> </div> <div class="ai-quick-prompts" id="ai-chips" data-astro-cid-3nssi2tu> <button class="ai-chip" onclick="sendChip(this)" data-astro-cid-3nssi2tu>Write my bio</button> <button class="ai-chip" onclick="sendChip(this)" data-astro-cid-3nssi2tu>Build a 12-week plan</button> <button class="ai-chip" onclick="sendChip(this)" data-astro-cid-3nssi2tu>How to get more leads</button> <button class="ai-chip" onclick="sendChip(this)" data-astro-cid-3nssi2tu>Price my packages</button> <button class="ai-chip" onclick="sendChip(this)" data-astro-cid-3nssi2tu>Write a client email</button> <button class="ai-chip" onclick="sendChip(this)" data-astro-cid-3nssi2tu>Nutrition advice</button> </div> <div class="ai-input-row" data-astro-cid-3nssi2tu> <textarea class="ai-input" id="ai-input" placeholder="Ask your AI coach anything..." rows="1" data-astro-cid-3nssi2tu></textarea> <button class="ai-send" id="ai-send" onclick="sendAI()" data-astro-cid-3nssi2tu> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-astro-cid-3nssi2tu><line x1="22" y1="2" x2="11" y2="13" data-astro-cid-3nssi2tu></line><polygon points="22 2 15 22 11 13 2 9 22 2" data-astro-cid-3nssi2tu></polygon></svg> </button> </div> </div>  <nav class="bottom-nav" data-astro-cid-3nssi2tu> <a href="/dashboard" class="bottom-nav-item active" data-astro-cid-3nssi2tu> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" data-astro-cid-3nssi2tu><rect x="3" y="3" width="7" height="7" data-astro-cid-3nssi2tu></rect><rect x="14" y="3" width="7" height="7" data-astro-cid-3nssi2tu></rect><rect x="14" y="14" width="7" height="7" data-astro-cid-3nssi2tu></rect><rect x="3" y="14" width="7" height="7" data-astro-cid-3nssi2tu></rect></svg> <span data-astro-cid-3nssi2tu>Dashboard</span> </a> <a href="/edit" class="bottom-nav-item" data-astro-cid-3nssi2tu> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" data-astro-cid-3nssi2tu><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" data-astro-cid-3nssi2tu></path><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" data-astro-cid-3nssi2tu></path></svg> <span data-astro-cid-3nssi2tu>Edit</span> </a> <button class="bottom-nav-item" onclick="openAI()" style="background:none;border:none;cursor:pointer;" data-astro-cid-3nssi2tu> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" data-astro-cid-3nssi2tu><circle cx="12" cy="12" r="10" data-astro-cid-3nssi2tu></circle><path d="M12 8v4l3 3" data-astro-cid-3nssi2tu></path></svg> <span data-astro-cid-3nssi2tu>AI Coach</span> </button> <a id="nav-view-profile" href="#" class="bottom-nav-item" data-astro-cid-3nssi2tu> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" data-astro-cid-3nssi2tu><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" data-astro-cid-3nssi2tu></path><circle cx="12" cy="12" r="3" data-astro-cid-3nssi2tu></circle></svg> <span data-astro-cid-3nssi2tu>Profile</span> </a> <a href="/pricing" class="bottom-nav-item" data-astro-cid-3nssi2tu> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" data-astro-cid-3nssi2tu><line x1="12" y1="1" x2="12" y2="23" data-astro-cid-3nssi2tu></line><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" data-astro-cid-3nssi2tu></path></svg> <span data-astro-cid-3nssi2tu>Upgrade</span> </a> </nav>  <div class="toast" id="toast" data-astro-cid-3nssi2tu></div> <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.min.js" crossorigin="anonymous"><\/script> <script>
const SUPABASE_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo';
const EDGE_BASE = SUPABASE_URL + '/functions/v1';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

  // Referral flywheel
  const refUrl = 'https://' + _domain + '/join?ref=' + t.slug;
  document.getElementById('referral-url-text').textContent = _domain + '/join?ref=' + t.slug;
  const waMsg = encodeURIComponent('Hey! I\\'m using ' + (window.__BRAND__?.name || 'TrainedBy') + ' to manage my PT business and earn passive income from affiliates. Get your free profile here: ' + refUrl);
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

  // Income stream cards — unlock for Pro/Premium
  const isPro = t.plan === 'pro' || t.plan === 'premium';
  if (isPro) {
    document.getElementById('upgrade-banner').style.display = 'none';
    ['is-affiliate-card','is-digital-card','is-referral-card'].forEach(id => {
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
}

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
    action = \`<a href="/edit" style="font-size:12px;font-weight:700;color:var(--brand);text-decoration:none;">→ Add a Grand Slam Offer with a guarantee to convert views into bookings</a>\`;
  } else if (leads > 0 && waTaps === 0) {
    text = \`You got <strong>\${leads} lead\${leads>1?'s':''}</strong> but no WhatsApp taps. Clients filled the form but didn't message you directly.\`;
    action = \`<a href="/edit" style="font-size:12px;font-weight:700;color:var(--brand);text-decoration:none;">→ Make sure your WhatsApp number is visible on your profile</a>\`;
  } else if (views > 0 && convRate > 0) {
    text = \`Your conversion rate is <strong>\${convRate}%</strong> this week (\${leads} lead\${leads>1?'s':''} from \${views} views). \${convRate >= 5 ? 'That\\'s above average — great work.' : 'Industry average is 5–8%. A results guarantee could double this.'}\`;
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
    const res = await fetch(EDGE_BASE + '/create-checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getAuthToken() },
      body: JSON.stringify({ trainer_id: trainer.id, plan: 'pro', success_url: location.origin + '/dashboard?upgraded=1', cancel_url: location.origin + '/dashboard' })
    });
    const data = await res.json();
    if (data.url) location.href = data.url;
    else showToast('Could not start checkout. Please try again.', 'error');
  } catch { showToast('Could not start checkout.', 'error'); }
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

// ── Support Chatbot Widget ──────────────────────────────────────────────────────────
(function() {
  const SUPPORT_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1/support-agent';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo';

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
  win.innerHTML = '<div class="tb-chat-header"><div><div class="tb-chat-header-title">' + _bn + ' Support</div><div class="tb-chat-header-sub">Ask me anything about your account</div></div><button class="tb-chat-close" id="tb-close"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button></div><div class="tb-chat-messages" id="tb-msgs"><div class="tb-msg bot">Hey! Ask me anything about ' + _bn + ' — pricing, verification, referrals, or how features work.</div></div><div class="tb-chat-input-row"><input class="tb-chat-input" id="tb-input" placeholder="Ask a question..." maxlength="300"/><button class="tb-chat-send" id="tb-send"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button></div>';

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
  const AI_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1/trainer-assistant';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo';
  let aiHistory = [];
  let aiBusy = false;

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
      const token = (function() {
        const cookies = document.cookie.split(';').map(c => c.trim());
        for (const c of cookies) { if (c.startsWith('tb_session=')) return c.slice('tb_session='.length); }
        return localStorage.getItem('tb_edit_token');
      })();

      const res = await fetch(AI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + ANON_KEY
        },
        body: JSON.stringify({
          message: question,
          history: aiHistory.slice(-10), // last 10 turns for context
          token: token,
          locale: window.__LOCALE__ || 'en'
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
<\/script> `], ["  ", `<div class="dash-wrap" data-astro-cid-3nssi2tu> <!-- Header --> <div class="dash-header" data-astro-cid-3nssi2tu> <a href="/" class="dash-logo" data-astro-cid-3nssi2tu> <svg width="26" height="26" viewBox="0 0 32 32" data-astro-cid-3nssi2tu><rect width="32" height="32" rx="8" fill="#FF5C00" data-astro-cid-3nssi2tu></rect><text x="16" y="23" font-family="Manrope,Arial,sans-serif" font-size="14" font-weight="800" text-anchor="middle" fill="white" data-astro-cid-3nssi2tu>TB</text></svg>
Dashboard
</a> <div class="header-nav" data-astro-cid-3nssi2tu> <a href="/edit" class="nav-edit" data-astro-cid-3nssi2tu>Edit</a> <a id="view-link" href="#" class="nav-view" data-astro-cid-3nssi2tu>View Profile</a> </div> </div> <!-- Loading --> <div id="dash-loading" style="text-align:center;padding:60px 0;" data-astro-cid-3nssi2tu> <div style="display:flex;align-items:center;justify-content:center;gap:8px;" data-astro-cid-3nssi2tu> <div style="width:8px;height:8px;border-radius:50%;background:var(--brand);animation:pulse 1.2s ease-in-out infinite;" data-astro-cid-3nssi2tu></div> <div style="width:8px;height:8px;border-radius:50%;background:var(--brand);animation:pulse 1.2s ease-in-out infinite;animation-delay:0.2s;" data-astro-cid-3nssi2tu></div> <div style="width:8px;height:8px;border-radius:50%;background:var(--brand);animation:pulse 1.2s ease-in-out infinite;animation-delay:0.4s;" data-astro-cid-3nssi2tu></div> </div> </div> <!-- Auth gate --> <div id="dash-auth" class="hidden" style="text-align:center;padding:60px 0;" data-astro-cid-3nssi2tu> <h2 style="font-family:'Manrope',sans-serif;font-size:20px;font-weight:800;margin-bottom:8px;" data-astro-cid-3nssi2tu>Sign in to view your dashboard</h2> <p style="font-size:14px;color:var(--text-muted);margin-bottom:24px;" data-astro-cid-3nssi2tu>Access your leads, analytics, and profile settings.</p> <a href="/edit" style="display:inline-block;padding:14px 28px;border-radius:12px;background:var(--brand);color:#fff;text-decoration:none;font-family:'Manrope',sans-serif;font-size:14px;font-weight:700;" data-astro-cid-3nssi2tu>Sign In →</a> </div> <!-- Dashboard content --> <div id="dash-content" class="hidden" data-astro-cid-3nssi2tu> <!-- Greeting --> <div class="trainer-greeting" data-astro-cid-3nssi2tu> <div class="greeting-row" data-astro-cid-3nssi2tu> <img id="dash-avatar" class="greeting-avatar" src="" alt="Avatar" data-astro-cid-3nssi2tu> <div data-astro-cid-3nssi2tu> <div class="greeting-name" id="dash-name" data-astro-cid-3nssi2tu>Loading...</div> <div class="greeting-sub" id="dash-sub" data-astro-cid-3nssi2tu>`, '</div> </div> </div> <div class="url-bar" data-astro-cid-3nssi2tu> <span class="url-bar-text" id="dash-url" data-astro-cid-3nssi2tu>...</span> <button class="url-copy-btn" onclick="copyUrl()" data-astro-cid-3nssi2tu>Copy Link</button> </div> </div> <!-- Profile Completeness Widget --> ', ` <!-- Stats --> <div class="stats-section" data-astro-cid-3nssi2tu> <div class="stats-section-title" data-astro-cid-3nssi2tu>This Week</div> <div class="stats-grid" data-astro-cid-3nssi2tu> <div class="stat-card brand-card" data-astro-cid-3nssi2tu> <div class="stat-card-icon" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-3nssi2tu><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" data-astro-cid-3nssi2tu></path><circle cx="9" cy="7" r="4" data-astro-cid-3nssi2tu></circle><path d="M23 21v-2a4 4 0 00-3-3.87" data-astro-cid-3nssi2tu></path><path d="M16 3.13a4 4 0 010 7.75" data-astro-cid-3nssi2tu></path></svg> </div> <div class="stat-card-value" id="stat-leads" data-astro-cid-3nssi2tu>—</div> <div class="stat-card-label" data-astro-cid-3nssi2tu>New Leads</div> <div class="stat-card-change up" id="stat-leads-change" data-astro-cid-3nssi2tu></div> </div> <div class="stat-card" data-astro-cid-3nssi2tu> <div class="stat-card-icon" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-3nssi2tu><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" data-astro-cid-3nssi2tu></path><circle cx="12" cy="12" r="3" data-astro-cid-3nssi2tu></circle></svg> </div> <div class="stat-card-value" id="stat-views" data-astro-cid-3nssi2tu>—</div> <div class="stat-card-label" data-astro-cid-3nssi2tu>Profile Views</div> <div class="stat-card-change up" id="stat-views-change" data-astro-cid-3nssi2tu></div> </div> <div class="stat-card" data-astro-cid-3nssi2tu> <div class="stat-card-icon" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-3nssi2tu><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" data-astro-cid-3nssi2tu></path></svg> </div> <div class="stat-card-value" id="stat-wa-taps" data-astro-cid-3nssi2tu>—</div> <div class="stat-card-label" data-astro-cid-3nssi2tu>WhatsApp Taps</div> <div class="stat-card-change up" id="stat-wa-change" data-astro-cid-3nssi2tu></div> </div> <div class="stat-card" data-astro-cid-3nssi2tu> <div class="stat-card-icon" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-3nssi2tu><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" data-astro-cid-3nssi2tu></polyline></svg> </div> <div class="stat-card-value" id="stat-assess" data-astro-cid-3nssi2tu>—</div> <div class="stat-card-label" data-astro-cid-3nssi2tu>Assessments</div> <div class="stat-card-change up" id="stat-assess-change" data-astro-cid-3nssi2tu></div> </div> </div> </div> <!-- WHOOP-style Actionable Insight Banner --> <div id="insight-banner" style="display:none;margin:16px 0;background:linear-gradient(135deg,rgba(255,92,0,0.10),rgba(255,92,0,0.04));border:1px solid rgba(255,92,0,0.25);border-radius:14px;padding:14px 16px;" data-astro-cid-3nssi2tu> <div style="display:flex;align-items:flex-start;gap:10px;" data-astro-cid-3nssi2tu> <div style="width:32px;height:32px;border-radius:8px;background:rgba(255,92,0,0.15);border:1px solid rgba(255,92,0,0.25);display:flex;align-items:center;justify-content:center;flex-shrink:0;" data-astro-cid-3nssi2tu> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF5C00" stroke-width="2.5" data-astro-cid-3nssi2tu><circle cx="12" cy="12" r="10" data-astro-cid-3nssi2tu></circle><line x1="12" y1="8" x2="12" y2="12" data-astro-cid-3nssi2tu></line><line x1="12" y1="16" x2="12.01" y2="16" data-astro-cid-3nssi2tu></line></svg> </div> <div data-astro-cid-3nssi2tu> <div style="font-size:11px;font-weight:700;color:rgba(255,92,0,0.9);letter-spacing:0.05em;text-transform:uppercase;margin-bottom:3px;" data-astro-cid-3nssi2tu>Insight</div> <div id="insight-text" style="font-size:13px;color:rgba(255,255,255,0.85);line-height:1.5;" data-astro-cid-3nssi2tu></div> <div id="insight-action" style="margin-top:8px;" data-astro-cid-3nssi2tu></div> </div> </div> </div> <!-- Views chart --> <div class="chart-section" data-astro-cid-3nssi2tu> <div class="chart-header" data-astro-cid-3nssi2tu> <span class="chart-title" data-astro-cid-3nssi2tu>Profile Views</span> <select class="chart-period-select" onchange="loadChart(this.value)" data-astro-cid-3nssi2tu> <option value="7" data-astro-cid-3nssi2tu>Last 7 days</option> <option value="14" data-astro-cid-3nssi2tu>Last 14 days</option> <option value="30" data-astro-cid-3nssi2tu>Last 30 days</option> </select> </div> <div class="chart-area" data-astro-cid-3nssi2tu> <div class="chart-bars" id="chart-bars" data-astro-cid-3nssi2tu></div> </div> <div class="chart-labels" id="chart-labels" data-astro-cid-3nssi2tu></div> </div> <!-- Leads --> <div class="leads-section" data-astro-cid-3nssi2tu> <div class="leads-header" data-astro-cid-3nssi2tu> <span class="leads-title" data-astro-cid-3nssi2tu>Recent Leads</span> <span class="leads-count" id="leads-total-badge" data-astro-cid-3nssi2tu>0</span> </div> <div id="leads-list" data-astro-cid-3nssi2tu> <div class="empty-state" data-astro-cid-3nssi2tu> <div class="empty-state-icon" data-astro-cid-3nssi2tu> <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" data-astro-cid-3nssi2tu><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" data-astro-cid-3nssi2tu></path><circle cx="9" cy="7" r="4" data-astro-cid-3nssi2tu></circle><path d="M23 21v-2a4 4 0 00-3-3.87" data-astro-cid-3nssi2tu></path><path d="M16 3.13a4 4 0 010 7.75" data-astro-cid-3nssi2tu></path></svg> </div> <div class="empty-state-text" data-astro-cid-3nssi2tu>No leads yet — share your profile link to get started.</div> </div> </div> </div> <!-- Onboarding Checklist --> <div class="checklist-section" id="checklist-section" data-astro-cid-3nssi2tu> <div class="checklist-title" data-astro-cid-3nssi2tu>Getting Started</div> <div id="checklist-list" data-astro-cid-3nssi2tu></div> </div> <!-- Income Streams --> <div class="income-section" id="income-section" data-astro-cid-3nssi2tu> <div class="stats-section-title" style="margin-bottom:14px" data-astro-cid-3nssi2tu>Your Income Streams</div> <div class="income-grid" id="income-grid" data-astro-cid-3nssi2tu> <div class="income-stream-card active" data-astro-cid-3nssi2tu> <div class="income-stream-icon" data-astro-cid-3nssi2tu>🏋️</div> <div class="income-stream-label" data-astro-cid-3nssi2tu>Sessions</div> <div class="income-stream-value" id="is-sessions" data-astro-cid-3nssi2tu>Active</div> <div class="income-stream-sub" data-astro-cid-3nssi2tu>Your core training income</div> </div> <div class="income-stream-card locked" id="is-affiliate-card" data-astro-cid-3nssi2tu> <div class="income-stream-lock" data-astro-cid-3nssi2tu> <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2.5" data-astro-cid-3nssi2tu><rect x="3" y="11" width="18" height="11" rx="2" data-astro-cid-3nssi2tu></rect><path d="M7 11V7a5 5 0 0110 0v4" data-astro-cid-3nssi2tu></path></svg> </div> <div class="income-stream-icon" data-astro-cid-3nssi2tu>💰</div> <div class="income-stream-label" data-astro-cid-3nssi2tu>Affiliate Vault</div> <div class="income-stream-value" data-astro-cid-3nssi2tu>Locked</div> <div class="income-stream-sub" data-astro-cid-3nssi2tu>Gymshark, ZEROFAT &amp; more</div> </div> <div class="income-stream-card locked" id="is-digital-card" data-astro-cid-3nssi2tu> <div class="income-stream-lock" data-astro-cid-3nssi2tu> <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2.5" data-astro-cid-3nssi2tu><rect x="3" y="11" width="18" height="11" rx="2" data-astro-cid-3nssi2tu></rect><path d="M7 11V7a5 5 0 0110 0v4" data-astro-cid-3nssi2tu></path></svg> </div> <div class="income-stream-icon" data-astro-cid-3nssi2tu>📦</div> <div class="income-stream-label" data-astro-cid-3nssi2tu>Digital Products</div> <div class="income-stream-value" data-astro-cid-3nssi2tu>Locked</div> <div class="income-stream-sub" data-astro-cid-3nssi2tu>PDFs, plans &amp; courses</div> </div> <div class="income-stream-card locked" id="is-referral-card" data-astro-cid-3nssi2tu> <div class="income-stream-lock" data-astro-cid-3nssi2tu> <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2.5" data-astro-cid-3nssi2tu><rect x="3" y="11" width="18" height="11" rx="2" data-astro-cid-3nssi2tu></rect><path d="M7 11V7a5 5 0 0110 0v4" data-astro-cid-3nssi2tu></path></svg> </div> <div class="income-stream-icon" data-astro-cid-3nssi2tu>🔗</div> <div class="income-stream-label" data-astro-cid-3nssi2tu>Referral Income</div> <div class="income-stream-value" data-astro-cid-3nssi2tu>Locked</div> <div class="income-stream-sub" data-astro-cid-3nssi2tu>Earn from trainer referrals</div> </div> </div> </div> <!-- Upgrade Banner --> <div class="upgrade-banner" id="upgrade-banner" data-astro-cid-3nssi2tu> <div class="upgrade-title" data-astro-cid-3nssi2tu>🔓 Unlock 3 More Income Streams</div> <div class="upgrade-sub" data-astro-cid-3nssi2tu>Pro trainers earn an average of <strong style="color:#fff" data-astro-cid-3nssi2tu>6,200 AED/month</strong> in passive income from affiliates and digital products — on top of their sessions.</div> <div class="upgrade-features" data-astro-cid-3nssi2tu> <div class="upgrade-feature" data-astro-cid-3nssi2tu> <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF5C00" data-astro-cid-3nssi2tu><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-3nssi2tu></path></svg> <strong style="color:#FF5C00" data-astro-cid-3nssi2tu>Master Affiliate Vault</strong> — Gymshark, ZEROFAT, MyProtein
</div> <div class="upgrade-feature" data-astro-cid-3nssi2tu> <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF5C00" data-astro-cid-3nssi2tu><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-3nssi2tu></path></svg> <strong style="color:#FF5C00" data-astro-cid-3nssi2tu>Digital Product Hub</strong> — sell PDFs, plans &amp; courses
</div> <div class="upgrade-feature" data-astro-cid-3nssi2tu> <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF5C00" data-astro-cid-3nssi2tu><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-3nssi2tu></path></svg> <strong style="color:#FF5C00" data-astro-cid-3nssi2tu>Grand Slam Offer Builder</strong> — AI-powered outcome cards
</div> <div class="upgrade-feature" data-astro-cid-3nssi2tu> <svg width="14" height="14" viewBox="0 0 24 24" fill="#00C853" data-astro-cid-3nssi2tu><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" data-astro-cid-3nssi2tu></path></svg>
WhatsApp lead notifications + analytics
</div> </div> <button class="upgrade-btn" onclick="startUpgrade()" data-astro-cid-3nssi2tu>🔓 Unlock Passive Income — AED 99/mo</button> <div style="text-align:center;font-size:11px;color:var(--text-muted);margin-top:10px" data-astro-cid-3nssi2tu>🛡 ROI Guarantee: 1,000 AED in 30 days or full refund</div> </div> <!-- Referral Flywheel --> <div class="referral-section" data-astro-cid-3nssi2tu> <div class="referral-card" data-astro-cid-3nssi2tu> <div class="referral-title" data-astro-cid-3nssi2tu>🔄 The Referral Flywheel</div> <div class="referral-sub" data-astro-cid-3nssi2tu>Refer 4 trainers to Pro and your subscription is <strong style="color:#fff" data-astro-cid-3nssi2tu>free forever</strong>. Each referral earns you 1 free month.</div> <div class="flywheel-reward" data-astro-cid-3nssi2tu> <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" data-astro-cid-3nssi2tu><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" data-astro-cid-3nssi2tu></path></svg> <span id="flywheel-reward-text" data-astro-cid-3nssi2tu>Refer 4 trainers = free Pro forever</span> </div> <div class="flywheel-progress" data-astro-cid-3nssi2tu> <div class="flywheel-label" data-astro-cid-3nssi2tu> <span id="flywheel-count-label" data-astro-cid-3nssi2tu>0 of 4 referrals</span> <span id="flywheel-pct-label" data-astro-cid-3nssi2tu>0% to free Pro</span> </div> <div class="flywheel-bar" data-astro-cid-3nssi2tu><div class="flywheel-fill" id="flywheel-fill" style="width:0%" data-astro-cid-3nssi2tu></div></div> <div class="flywheel-steps" id="flywheel-steps" data-astro-cid-3nssi2tu> <div class="flywheel-step" data-astro-cid-3nssi2tu></div> <div class="flywheel-step" data-astro-cid-3nssi2tu></div> <div class="flywheel-step" data-astro-cid-3nssi2tu></div> <div class="flywheel-step" data-astro-cid-3nssi2tu></div> </div> </div> <div class="referral-url" data-astro-cid-3nssi2tu> <span class="referral-url-text" id="referral-url-text" data-astro-cid-3nssi2tu>loading...</span> <button class="url-copy-btn" onclick="copyReferral()" data-astro-cid-3nssi2tu>Copy</button> </div> <div class="referral-share-btns" data-astro-cid-3nssi2tu> <a id="referral-wa-share" href="#" class="referral-share-btn" target="_blank" data-astro-cid-3nssi2tu> <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" data-astro-cid-3nssi2tu><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" data-astro-cid-3nssi2tu></path></svg>
Share on WhatsApp
</a> <button class="referral-share-btn" onclick="copyReferral()" data-astro-cid-3nssi2tu> <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-3nssi2tu><rect x="9" y="9" width="13" height="13" rx="2" data-astro-cid-3nssi2tu></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" data-astro-cid-3nssi2tu></path></svg>
Copy Link
</button> </div> </div> </div> </div><!-- /dash-content --> </div>  <div class="ai-panel" id="ai-panel" data-astro-cid-3nssi2tu> <div class="ai-panel-header" data-astro-cid-3nssi2tu> <div class="ai-panel-title" data-astro-cid-3nssi2tu> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF5C00" stroke-width="2" data-astro-cid-3nssi2tu><path d="M12 2a10 10 0 110 20A10 10 0 0112 2z" data-astro-cid-3nssi2tu></path><path d="M12 6v6l4 2" data-astro-cid-3nssi2tu></path></svg>
Your AI Coach
<span class="ai-panel-badge" data-astro-cid-3nssi2tu>Beta</span> </div> <button class="ai-panel-close" onclick="closeAI()" data-astro-cid-3nssi2tu>Done</button> </div> <div class="ai-messages" id="ai-messages" data-astro-cid-3nssi2tu> <div class="ai-welcome" id="ai-welcome" data-astro-cid-3nssi2tu> <div class="ai-welcome-icon" data-astro-cid-3nssi2tu> <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF5C00" stroke-width="1.8" data-astro-cid-3nssi2tu><circle cx="12" cy="12" r="10" data-astro-cid-3nssi2tu></circle><path d="M12 8v4l3 3" data-astro-cid-3nssi2tu></path></svg> </div> <div class="ai-welcome-title" data-astro-cid-3nssi2tu>Hey, I'm your AI coach</div> <div class="ai-welcome-sub" data-astro-cid-3nssi2tu>I know your profile, your market, and your goals. Ask me anything — from writing your bio to building a 12-week programme.</div> </div> </div> <div class="ai-quick-prompts" id="ai-chips" data-astro-cid-3nssi2tu> <button class="ai-chip" onclick="sendChip(this)" data-astro-cid-3nssi2tu>Write my bio</button> <button class="ai-chip" onclick="sendChip(this)" data-astro-cid-3nssi2tu>Build a 12-week plan</button> <button class="ai-chip" onclick="sendChip(this)" data-astro-cid-3nssi2tu>How to get more leads</button> <button class="ai-chip" onclick="sendChip(this)" data-astro-cid-3nssi2tu>Price my packages</button> <button class="ai-chip" onclick="sendChip(this)" data-astro-cid-3nssi2tu>Write a client email</button> <button class="ai-chip" onclick="sendChip(this)" data-astro-cid-3nssi2tu>Nutrition advice</button> </div> <div class="ai-input-row" data-astro-cid-3nssi2tu> <textarea class="ai-input" id="ai-input" placeholder="Ask your AI coach anything..." rows="1" data-astro-cid-3nssi2tu></textarea> <button class="ai-send" id="ai-send" onclick="sendAI()" data-astro-cid-3nssi2tu> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-astro-cid-3nssi2tu><line x1="22" y1="2" x2="11" y2="13" data-astro-cid-3nssi2tu></line><polygon points="22 2 15 22 11 13 2 9 22 2" data-astro-cid-3nssi2tu></polygon></svg> </button> </div> </div>  <nav class="bottom-nav" data-astro-cid-3nssi2tu> <a href="/dashboard" class="bottom-nav-item active" data-astro-cid-3nssi2tu> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" data-astro-cid-3nssi2tu><rect x="3" y="3" width="7" height="7" data-astro-cid-3nssi2tu></rect><rect x="14" y="3" width="7" height="7" data-astro-cid-3nssi2tu></rect><rect x="14" y="14" width="7" height="7" data-astro-cid-3nssi2tu></rect><rect x="3" y="14" width="7" height="7" data-astro-cid-3nssi2tu></rect></svg> <span data-astro-cid-3nssi2tu>Dashboard</span> </a> <a href="/edit" class="bottom-nav-item" data-astro-cid-3nssi2tu> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" data-astro-cid-3nssi2tu><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" data-astro-cid-3nssi2tu></path><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" data-astro-cid-3nssi2tu></path></svg> <span data-astro-cid-3nssi2tu>Edit</span> </a> <button class="bottom-nav-item" onclick="openAI()" style="background:none;border:none;cursor:pointer;" data-astro-cid-3nssi2tu> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" data-astro-cid-3nssi2tu><circle cx="12" cy="12" r="10" data-astro-cid-3nssi2tu></circle><path d="M12 8v4l3 3" data-astro-cid-3nssi2tu></path></svg> <span data-astro-cid-3nssi2tu>AI Coach</span> </button> <a id="nav-view-profile" href="#" class="bottom-nav-item" data-astro-cid-3nssi2tu> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" data-astro-cid-3nssi2tu><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" data-astro-cid-3nssi2tu></path><circle cx="12" cy="12" r="3" data-astro-cid-3nssi2tu></circle></svg> <span data-astro-cid-3nssi2tu>Profile</span> </a> <a href="/pricing" class="bottom-nav-item" data-astro-cid-3nssi2tu> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" data-astro-cid-3nssi2tu><line x1="12" y1="1" x2="12" y2="23" data-astro-cid-3nssi2tu></line><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" data-astro-cid-3nssi2tu></path></svg> <span data-astro-cid-3nssi2tu>Upgrade</span> </a> </nav>  <div class="toast" id="toast" data-astro-cid-3nssi2tu></div> <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.min.js" crossorigin="anonymous"><\/script> <script>
const SUPABASE_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo';
const EDGE_BASE = SUPABASE_URL + '/functions/v1';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

  // Referral flywheel
  const refUrl = 'https://' + _domain + '/join?ref=' + t.slug;
  document.getElementById('referral-url-text').textContent = _domain + '/join?ref=' + t.slug;
  const waMsg = encodeURIComponent('Hey! I\\\\'m using ' + (window.__BRAND__?.name || 'TrainedBy') + ' to manage my PT business and earn passive income from affiliates. Get your free profile here: ' + refUrl);
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

  // Income stream cards — unlock for Pro/Premium
  const isPro = t.plan === 'pro' || t.plan === 'premium';
  if (isPro) {
    document.getElementById('upgrade-banner').style.display = 'none';
    ['is-affiliate-card','is-digital-card','is-referral-card'].forEach(id => {
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
}

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
    action = \\\`<a href="/edit" style="font-size:12px;font-weight:700;color:var(--brand);text-decoration:none;">→ Add a Grand Slam Offer with a guarantee to convert views into bookings</a>\\\`;
  } else if (leads > 0 && waTaps === 0) {
    text = \\\`You got <strong>\\\${leads} lead\\\${leads>1?'s':''}</strong> but no WhatsApp taps. Clients filled the form but didn't message you directly.\\\`;
    action = \\\`<a href="/edit" style="font-size:12px;font-weight:700;color:var(--brand);text-decoration:none;">→ Make sure your WhatsApp number is visible on your profile</a>\\\`;
  } else if (views > 0 && convRate > 0) {
    text = \\\`Your conversion rate is <strong>\\\${convRate}%</strong> this week (\\\${leads} lead\\\${leads>1?'s':''} from \\\${views} views). \\\${convRate >= 5 ? 'That\\\\'s above average — great work.' : 'Industry average is 5–8%. A results guarantee could double this.'}\\\`;
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
    const res = await fetch(EDGE_BASE + '/create-checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getAuthToken() },
      body: JSON.stringify({ trainer_id: trainer.id, plan: 'pro', success_url: location.origin + '/dashboard?upgraded=1', cancel_url: location.origin + '/dashboard' })
    });
    const data = await res.json();
    if (data.url) location.href = data.url;
    else showToast('Could not start checkout. Please try again.', 'error');
  } catch { showToast('Could not start checkout.', 'error'); }
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

// ── Support Chatbot Widget ──────────────────────────────────────────────────────────
(function() {
  const SUPPORT_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1/support-agent';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo';

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
  win.innerHTML = '<div class="tb-chat-header"><div><div class="tb-chat-header-title">' + _bn + ' Support</div><div class="tb-chat-header-sub">Ask me anything about your account</div></div><button class="tb-chat-close" id="tb-close"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button></div><div class="tb-chat-messages" id="tb-msgs"><div class="tb-msg bot">Hey! Ask me anything about ' + _bn + ' — pricing, verification, referrals, or how features work.</div></div><div class="tb-chat-input-row"><input class="tb-chat-input" id="tb-input" placeholder="Ask a question..." maxlength="300"/><button class="tb-chat-send" id="tb-send"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button></div>';

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
  const AI_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1/trainer-assistant';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo';
  let aiHistory = [];
  let aiBusy = false;

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
      const token = (function() {
        const cookies = document.cookie.split(';').map(c => c.trim());
        for (const c of cookies) { if (c.startsWith('tb_session=')) return c.slice('tb_session='.length); }
        return localStorage.getItem('tb_edit_token');
      })();

      const res = await fetch(AI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + ANON_KEY
        },
        body: JSON.stringify({
          message: question,
          history: aiHistory.slice(-10), // last 10 turns for context
          token: token,
          locale: window.__LOCALE__ || 'en'
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
<\/script> `])), maybeRenderHead(), market.brandName, renderComponent($$result2, "ProfileCompleteness", $$ProfileCompleteness, { "data-astro-cid-3nssi2tu": true })) })}`;
}, "/home/ubuntu/trainedby2/src/pages/dashboard.astro", void 0);

const $$file = "/home/ubuntu/trainedby2/src/pages/dashboard.astro";
const $$url = "/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Dashboard,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
