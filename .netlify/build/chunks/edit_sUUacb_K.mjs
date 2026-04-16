import { g as getMarket, $ as $$Base } from './Base_FjIho6vc.mjs';
import { c as createComponent } from './astro-component_B9z2_ibQ.mjs';
import { h as renderComponent, r as renderTemplate, m as maybeRenderHead } from './ssr-function__udbY6MT.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Edit = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Edit;
  const market = getMarket(Astro2.url.hostname);
  const brandName = market.brandName;
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": `Edit Profile  -  ${brandName}`, "description": `Edit your ${brandName} trainer profile, packages, and settings.`, "data-astro-cid-crkt4yyk": true }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template(["  ", `<div class="edit-wrap" data-astro-cid-crkt4yyk> <!-- Header --> <div class="edit-header" data-astro-cid-crkt4yyk> <a href="/" class="edit-logo" data-astro-cid-crkt4yyk> <svg width="26" height="26" viewBox="0 0 32 32" data-astro-cid-crkt4yyk><rect width="32" height="32" rx="8" fill="#FF5C00" data-astro-cid-crkt4yyk></rect><text x="16" y="23" font-family="Manrope,Arial,sans-serif" font-size="14" font-weight="800" text-anchor="middle" fill="white" data-astro-cid-crkt4yyk>TB</text></svg>
Edit Profile
</a> <div class="header-actions" data-astro-cid-crkt4yyk> <a id="view-profile-link" href="#" class="header-btn header-btn-ghost" style="text-decoration:none;" data-astro-cid-crkt4yyk>View</a> <button id="save-btn" class="header-btn header-btn-brand" onclick="saveAll()" data-astro-cid-crkt4yyk>Save</button> </div> </div> <!-- ===== AUTH GATE ===== --> <div id="auth-gate" data-astro-cid-crkt4yyk> <div class="auth-gate" data-astro-cid-crkt4yyk> <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" style="margin-bottom:20px;" data-astro-cid-crkt4yyk><rect x="3" y="11" width="18" height="11" rx="2" ry="2" data-astro-cid-crkt4yyk></rect><path d="M7 11V7a5 5 0 0110 0v4" data-astro-cid-crkt4yyk></path></svg> <h2 data-astro-cid-crkt4yyk>Sign in to edit</h2> <p data-astro-cid-crkt4yyk>Enter your email to receive a magic link  -  no password needed.</p> <input class="auth-field" type="email" id="auth-email" placeholder="your@email.com" autocomplete="email" data-astro-cid-crkt4yyk> <div id="auth-error" style="display:none;font-size:12px;color:#ff5555;margin-bottom:10px;max-width:340px;" data-astro-cid-crkt4yyk></div> <button class="auth-btn" id="auth-btn" onclick="sendMagicLink()" data-astro-cid-crkt4yyk>Send Magic Link</button> <div class="auth-hint" data-astro-cid-crkt4yyk>Check your inbox  -  link expires in 15 minutes.</div> </div> <div id="auth-sent" class="hidden" style="text-align:center;padding:40px 0;" data-astro-cid-crkt4yyk> <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="1.5" style="margin-bottom:16px;" data-astro-cid-crkt4yyk><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" data-astro-cid-crkt4yyk></path><polyline points="22,6 12,13 2,6" data-astro-cid-crkt4yyk></polyline></svg> <h2 style="font-family:'Manrope',sans-serif;font-size:20px;font-weight:800;margin-bottom:8px;" data-astro-cid-crkt4yyk>Check your inbox</h2> <p style="font-size:14px;color:var(--text-muted);max-width:280px;margin:0 auto;" data-astro-cid-crkt4yyk>We sent a magic link to <strong id="auth-sent-email" style="color:var(--brand);" data-astro-cid-crkt4yyk></strong>. Click it to sign in.</p> </div> </div> <!-- ===== EDIT FORM (shown after auth) ===== --> <div id="edit-form" class="hidden" data-astro-cid-crkt4yyk> <!-- Section: Profile Photo --> <div class="edit-section" data-astro-cid-crkt4yyk> <div class="section-heading" data-astro-cid-crkt4yyk>Profile Photo</div> <div class="section-sub" data-astro-cid-crkt4yyk>Your photo appears on your public profile and in search results.</div> <div class="avatar-editor" data-astro-cid-crkt4yyk> <div class="avatar-edit-circle" id="avatar-circle" data-astro-cid-crkt4yyk> <img id="avatar-img" src="" alt="Avatar" data-astro-cid-crkt4yyk> <div class="avatar-edit-overlay" data-astro-cid-crkt4yyk> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" data-astro-cid-crkt4yyk><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" data-astro-cid-crkt4yyk></path><circle cx="12" cy="13" r="4" data-astro-cid-crkt4yyk></circle></svg> </div> <input type="file" accept="image/*" onchange="changeAvatar(this)" data-astro-cid-crkt4yyk> </div> <div data-astro-cid-crkt4yyk> <div style="font-size:13px;font-weight:600;margin-bottom:4px;" data-astro-cid-crkt4yyk>Change photo</div> <div style="font-size:11px;color:var(--text-muted);" data-astro-cid-crkt4yyk>JPG or PNG, at least 400×400px</div> <div id="avatar-upload-status" style="font-size:11px;color:var(--brand);margin-top:4px;display:none;" data-astro-cid-crkt4yyk>Uploading...</div> </div> </div> </div> <!-- Section: Basic Info --> <div class="edit-section" data-astro-cid-crkt4yyk> <div class="section-heading" data-astro-cid-crkt4yyk>Basic Info</div> <div class="section-sub" data-astro-cid-crkt4yyk>Your name, title, and bio are the first things clients see.</div> <div class="field" data-astro-cid-crkt4yyk> <label data-astro-cid-crkt4yyk>Full Name</label> <input type="text" id="e-name" placeholder="Your full name" autocomplete="name" data-astro-cid-crkt4yyk> </div> <div class="field" data-astro-cid-crkt4yyk> <label data-astro-cid-crkt4yyk>Title / Role</label> <input type="text" id="e-title" placeholder="e.g. Strength & Conditioning Coach" maxlength="60" data-astro-cid-crkt4yyk> </div> <div class="field" data-astro-cid-crkt4yyk> <label style="display:flex;align-items:center;justify-content:space-between;" data-astro-cid-crkt4yyk>Bio <button type="button" onclick="generateAIBio()" style="background:var(--brand-dim);border:1px solid var(--brand-border);color:var(--brand);font-size:11px;font-weight:700;padding:4px 10px;border-radius:8px;cursor:pointer;font-family:'Manrope',sans-serif;" id="ai-bio-btn" data-astro-cid-crkt4yyk>✦ Write with AI</button></label> <textarea id="e-bio" maxlength="400" oninput="document.getElementById('bio-count').textContent=this.value.length" data-astro-cid-crkt4yyk></textarea> <div class="field-hint" data-astro-cid-crkt4yyk><span id="bio-count" data-astro-cid-crkt4yyk>0</span>/400 characters</div> </div> <div style="display:flex;gap:12px;" data-astro-cid-crkt4yyk> <div class="field" style="flex:1;" data-astro-cid-crkt4yyk> <label data-astro-cid-crkt4yyk>Years Experience</label> <input type="number" id="e-exp" min="0" max="50" inputmode="numeric" data-astro-cid-crkt4yyk> </div> <div class="field" style="flex:1;" data-astro-cid-crkt4yyk> <label data-astro-cid-crkt4yyk>Clients Trained</label> <input type="number" id="e-clients" min="0" inputmode="numeric" data-astro-cid-crkt4yyk> </div> </div> </div> <!-- Section: Specialties --> <div class="edit-section" data-astro-cid-crkt4yyk> <div class="section-heading" data-astro-cid-crkt4yyk>Specialties</div> <div class="section-sub" data-astro-cid-crkt4yyk>Select all that apply  -  shown as pills on your profile.</div> <div class="toggle-row" id="spec-row" data-astro-cid-crkt4yyk> <div class="toggle-pill" onclick="togglePill(this,'spec','Strength')" data-astro-cid-crkt4yyk>Strength</div> <div class="toggle-pill" onclick="togglePill(this,'spec','Fat Loss')" data-astro-cid-crkt4yyk>Fat Loss</div> <div class="toggle-pill" onclick="togglePill(this,'spec','Muscle Gain')" data-astro-cid-crkt4yyk>Muscle Gain</div> <div class="toggle-pill" onclick="togglePill(this,'spec','HIIT')" data-astro-cid-crkt4yyk>HIIT</div> <div class="toggle-pill" onclick="togglePill(this,'spec','Cardio')" data-astro-cid-crkt4yyk>Cardio</div> <div class="toggle-pill" onclick="togglePill(this,'spec','Yoga')" data-astro-cid-crkt4yyk>Yoga</div> <div class="toggle-pill" onclick="togglePill(this,'spec','Pilates')" data-astro-cid-crkt4yyk>Pilates</div> <div class="toggle-pill" onclick="togglePill(this,'spec','CrossFit')" data-astro-cid-crkt4yyk>CrossFit</div> <div class="toggle-pill" onclick="togglePill(this,'spec','Boxing')" data-astro-cid-crkt4yyk>Boxing</div> <div class="toggle-pill" onclick="togglePill(this,'spec','Nutrition')" data-astro-cid-crkt4yyk>Nutrition</div> <div class="toggle-pill" onclick="togglePill(this,'spec','Rehabilitation')" data-astro-cid-crkt4yyk>Rehabilitation</div> <div class="toggle-pill" onclick="togglePill(this,'spec','Sport Specific')" data-astro-cid-crkt4yyk>Sport Specific</div> </div> </div> <!-- Section: Availability --> <div class="edit-section" data-astro-cid-crkt4yyk> <div class="section-heading" data-astro-cid-crkt4yyk>Availability</div> <div class="section-sub" data-astro-cid-crkt4yyk>Let clients know if you're taking new clients.</div> <div class="avail-toggle" onclick="toggleAvailability()" data-astro-cid-crkt4yyk> <div data-astro-cid-crkt4yyk> <div class="avail-label" data-astro-cid-crkt4yyk>Accepting New Clients</div> <div class="avail-sub" id="avail-sub-text" data-astro-cid-crkt4yyk>Currently showing as available</div> </div> <div class="switch" id="avail-switch" data-astro-cid-crkt4yyk> <div class="switch-knob" data-astro-cid-crkt4yyk></div> </div> </div> </div> <!-- Section: Session Packages --> <div class="edit-section" data-astro-cid-crkt4yyk> <div class="section-heading" data-astro-cid-crkt4yyk>Session Packages</div> <div class="section-sub" data-astro-cid-crkt4yyk>Clients see these on your profile. Add up to 5 packages.</div> <div id="packages-edit-list" data-astro-cid-crkt4yyk></div> <button onclick="addEditPackage()" style="width:100%;padding:12px;border-radius:10px;background:transparent;border:1px dashed var(--border);color:var(--text-muted);font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor='var(--brand)';this.style.color='var(--brand)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text-muted)'" data-astro-cid-crkt4yyk>
+ Add Package
</button> </div> <!-- Section: Transformation Gallery --> <div class="edit-section" data-astro-cid-crkt4yyk> <div class="section-heading" data-astro-cid-crkt4yyk>Transformation Gallery</div> <div class="section-sub" data-astro-cid-crkt4yyk>Before/after photos build trust. Add up to 9 images.</div> <div class="gallery-grid-edit" id="gallery-edit-grid" data-astro-cid-crkt4yyk> <div class="gallery-add" data-astro-cid-crkt4yyk> <input type="file" accept="image/*" multiple onchange="addGalleryImages(this)" data-astro-cid-crkt4yyk> <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" data-astro-cid-crkt4yyk><line x1="12" y1="5" x2="12" y2="19" data-astro-cid-crkt4yyk></line><line x1="5" y1="12" x2="19" y2="12" data-astro-cid-crkt4yyk></line></svg> <span style="font-size:10px;color:var(--text-faint);margin-top:4px;" data-astro-cid-crkt4yyk>Add</span> </div> </div> </div> <!-- Section: Training Modes --> <div class="edit-section" data-astro-cid-crkt4yyk> <div class="section-heading" data-astro-cid-crkt4yyk>Training Modes</div> <div class="section-sub" data-astro-cid-crkt4yyk>Let clients know how you can train them.</div> <div style="display:flex;gap:8px;flex-wrap:wrap;" id="mode-row" data-astro-cid-crkt4yyk> <button type="button" class="toggle-pill" onclick="togglePill(this,'modes','in-person')" data-astro-cid-crkt4yyk>In-Person</button> <button type="button" class="toggle-pill" onclick="togglePill(this,'modes','online')" data-astro-cid-crkt4yyk>Online</button> <button type="button" class="toggle-pill" onclick="togglePill(this,'modes','hybrid')" data-astro-cid-crkt4yyk>Hybrid</button> </div> </div> <!-- Section: Video Intro --> <div class="edit-section" data-astro-cid-crkt4yyk> <div class="section-heading" data-astro-cid-crkt4yyk>Video Intro</div> <div class="section-sub" data-astro-cid-crkt4yyk>Add a short intro video  -  YouTube or Instagram Reel link. Clients who watch a video are 3× more likely to book.</div> <div class="field" data-astro-cid-crkt4yyk> <label data-astro-cid-crkt4yyk>Video URL</label> <input type="url" id="e-video-intro" placeholder="https://youtube.com/shorts/... or https://instagram.com/reel/..." data-astro-cid-crkt4yyk> <div class="field-hint" data-astro-cid-crkt4yyk>YouTube Shorts or Instagram Reels work best (under 60 seconds)</div> </div> </div> <!-- Section: Social Links --> <div class="edit-section" data-astro-cid-crkt4yyk> <div class="section-heading" data-astro-cid-crkt4yyk>Social Links</div> <div class="section-sub" data-astro-cid-crkt4yyk>Connect your social media to your profile.</div> <div class="field" data-astro-cid-crkt4yyk> <label data-astro-cid-crkt4yyk>Instagram</label> <div style="display:flex;align-items:center;background:var(--surface-2);border:1px solid var(--border);border-radius:12px;overflow:hidden;transition:border-color 0.2s;" id="ig-wrap" data-astro-cid-crkt4yyk> <span style="padding:13px 0 13px 15px;font-size:14px;color:var(--text-faint);" data-astro-cid-crkt4yyk>@</span> <input type="text" id="e-instagram" placeholder="yourhandle" style="border:none;background:transparent;padding:13px 15px 13px 6px;font-size:14px;flex:1;min-width:0;color:var(--text);outline:none;" onfocus="document.getElementById('ig-wrap').style.borderColor='var(--brand)'" onblur="document.getElementById('ig-wrap').style.borderColor='var(--border)'" data-astro-cid-crkt4yyk> </div> </div> <div class="field" data-astro-cid-crkt4yyk> <label data-astro-cid-crkt4yyk>TikTok</label> <div style="display:flex;align-items:center;background:var(--surface-2);border:1px solid var(--border);border-radius:12px;overflow:hidden;transition:border-color 0.2s;" id="tt-wrap" data-astro-cid-crkt4yyk> <span style="padding:13px 0 13px 15px;font-size:14px;color:var(--text-faint);" data-astro-cid-crkt4yyk>@</span> <input type="text" id="e-tiktok" placeholder="yourhandle" style="border:none;background:transparent;padding:13px 15px 13px 6px;font-size:14px;flex:1;min-width:0;color:var(--text);outline:none;" onfocus="document.getElementById('tt-wrap').style.borderColor='var(--brand)'" onblur="document.getElementById('tt-wrap').style.borderColor='var(--border)'" data-astro-cid-crkt4yyk> </div> </div> <div class="field" data-astro-cid-crkt4yyk> <label data-astro-cid-crkt4yyk>YouTube</label> <input type="url" id="e-youtube" placeholder="https://youtube.com/@yourchannel" data-astro-cid-crkt4yyk> </div> </div> <!-- Section: REPs Verification --> <div class="edit-section" data-astro-cid-crkt4yyk> <div class="section-heading" data-astro-cid-crkt4yyk>REPs UAE Verification</div> <div class="section-sub" data-astro-cid-crkt4yyk>Your verified badge builds client trust.</div> <div id="reps-verified-card" class="hidden" style="background:var(--reps-dim);border:1px solid var(--reps-border);border-radius:12px;padding:14px;display:flex;align-items:center;gap:12px;margin-bottom:14px;" data-astro-cid-crkt4yyk> <svg width="24" height="24" viewBox="0 0 24 24" fill="#00C853" data-astro-cid-crkt4yyk><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" data-astro-cid-crkt4yyk></path></svg> <div data-astro-cid-crkt4yyk> <div style="font-size:13px;font-weight:700;color:var(--reps);" data-astro-cid-crkt4yyk>REPs UAE Verified</div> <div id="reps-number-display" style="font-size:11px;color:var(--text-muted);" data-astro-cid-crkt4yyk></div> </div> </div> <div id="reps-unverified-card" data-astro-cid-crkt4yyk> <div class="field" data-astro-cid-crkt4yyk> <label data-astro-cid-crkt4yyk>REPs UAE Number</label> <input type="text" id="e-reps" placeholder="REP-12345" style="font-family:'Manrope',sans-serif;font-weight:700;font-size:15px;letter-spacing:0.05em;" data-astro-cid-crkt4yyk> <div class="field-hint" data-astro-cid-crkt4yyk>Find your number at repsuae.com/searcht</div> </div> <button onclick="submitRepsVerification()" style="padding:12px 20px;border-radius:10px;background:var(--reps-dim);border:1px solid var(--reps-border);color:var(--reps);font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;" data-astro-cid-crkt4yyk>
Submit for Verification
</button> </div> </div> <!-- Section: Danger Zone --> <div class="edit-section" data-astro-cid-crkt4yyk> <div class="section-heading" style="color:#ff5555;" data-astro-cid-crkt4yyk>Danger Zone</div> <div class="section-sub" data-astro-cid-crkt4yyk>These actions are permanent and cannot be undone.</div> <div class="danger-zone" data-astro-cid-crkt4yyk> <div class="danger-title" data-astro-cid-crkt4yyk>Delete Profile</div> <div class="danger-sub" data-astro-cid-crkt4yyk>Permanently removes your profile, all leads, and data. Your URL becomes available again.</div> <button class="danger-btn" onclick="confirmDelete()" data-astro-cid-crkt4yyk>Delete My Profile</button> </div> </div> </div><!-- /edit-form --> </div>  <div class="toast" id="toast" data-astro-cid-crkt4yyk></div> <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.min.js" crossorigin="anonymous"><\/script> <script>
const SUPABASE_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo';
const EDGE_BASE = SUPABASE_URL + '/functions/v1';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let trainer = null;
let availOn = true;
const specs = new Set();
const modes = new Set(['in-person']);
const galleryImages = [];

// ===== TOAST =====
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = 'toast' + (type ? ' ' + type : '');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== AUTH =====
async function sendMagicLink() {
  const email = document.getElementById('auth-email').value.trim();
  const err = document.getElementById('auth-error');
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
    err.textContent = 'Please enter a valid email.'; err.style.display = 'block'; return;
  }
  const btn = document.getElementById('auth-btn');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
  try {
    const res = await fetch(EDGE_BASE + '/send-magic-link', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, redirect: location.origin + '/edit' })
    });
    if (!res.ok) throw new Error();
    document.getElementById('auth-sent-email').textContent = email;
    document.getElementById('auth-gate').querySelector('.auth-gate').classList.add('hidden');
    document.getElementById('auth-sent').classList.remove('hidden');
  } catch {
    err.textContent = 'Could not send magic link. Please try again.'; err.style.display = 'block';
    btn.disabled = false; btn.textContent = 'Send Magic Link';
  }
}

// ===== AUTH HELPERS =====
// Reads the tb_session HttpOnly cookie (set by verify-magic-link edge function).
// Falls back to localStorage for backward compatibility during migration.
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

// ===== INIT =====
async function init() {
  const params = new URLSearchParams(location.search);
  const urlToken = params.get('token');
  const token = urlToken || getAuthToken();
  if (!token) return; // show auth gate

  try {
    const res = await fetch(EDGE_BASE + '/verify-magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // receive HttpOnly Set-Cookie from edge function
      body: JSON.stringify({ token })
    });
    const data = await res.json();
    if (!res.ok || !data.trainer) throw new Error();
    // Store in localStorage as fallback only when arriving from a URL token
    if (urlToken) localStorage.setItem('tb_edit_token', token);
    if (urlToken) history.replaceState({}, '', '/edit');
    trainer = data.trainer;
    populateForm(trainer);
    document.getElementById('auth-gate').classList.add('hidden');
    document.getElementById('edit-form').classList.remove('hidden');
    document.getElementById('view-profile-link').href = '/' + trainer.slug;
  } catch {
    clearAuthToken();
  }
}

function populateForm(t) {
  document.getElementById('e-name').value = t.name || '';
  document.getElementById('e-title').value = t.title || '';
  document.getElementById('e-bio').value = t.bio || '';
  document.getElementById('bio-count').textContent = (t.bio || '').length;
  document.getElementById('e-exp').value = t.years_experience || '';
  document.getElementById('e-clients').value = t.clients_trained || '';
  document.getElementById('e-instagram').value = t.instagram || '';
  document.getElementById('e-tiktok').value = t.tiktok || '';
  document.getElementById('e-youtube').value = t.youtube || '';
  document.getElementById('e-reps').value = t.reps_number || '';

  // Avatar
  if (t.avatar_url) document.getElementById('avatar-img').src = t.avatar_url;

  // Availability
  availOn = t.accepting_clients !== false;
  updateAvailSwitch();

  // Specialties
  if (t.specialties) {
    t.specialties.forEach(s => specs.add(s));
    document.querySelectorAll('#spec-row .toggle-pill').forEach(p => {
      if (specs.has(p.textContent.trim())) p.classList.add('active');
    });
  }

  // Training modes
  if (t.training_modes) {
    t.training_modes.forEach(m => modes.add(m));
    document.querySelectorAll('#mode-row .toggle-pill').forEach(p => {
      const val = p.textContent.trim().toLowerCase().replace(' ', '-');
      if (modes.has(val)) p.classList.add('active');
    });
  }

  // Video intro
  if (t.video_intro_url) document.getElementById('e-video-intro').value = t.video_intro_url;

  // REPs
  if (t.reps_verified) {
    document.getElementById('reps-verified-card').classList.remove('hidden');
    document.getElementById('reps-number-display').textContent = 'Registration: ' + (t.reps_number || '');
    document.getElementById('reps-unverified-card').style.display = 'none';
  }

  // Packages
  if (t.packages) t.packages.forEach(p => addEditPackage(p));

  // Gallery
  if (t.gallery_urls) {
    t.gallery_urls.forEach(url => addGalleryItem(url));
  }
}

// ===== AVAILABILITY =====
function toggleAvailability() {
  availOn = !availOn;
  updateAvailSwitch();
}
function updateAvailSwitch() {
  const sw = document.getElementById('avail-switch');
  const sub = document.getElementById('avail-sub-text');
  if (availOn) {
    sw.classList.add('on');
    sub.textContent = 'Currently showing as available';
  } else {
    sw.classList.remove('on');
    sub.textContent = 'Currently showing as fully booked';
  }
}

// ===== SPECIALTIES & MODES =====
function togglePill(el, group, val) {
  el.classList.toggle('active');
  const set = group === 'modes' ? modes : specs;
  if (el.classList.contains('active')) set.add(val);
  else set.delete(val);
}

// ===== AI BIO WRITER =====
async function generateAIBio() {
  const btn = document.getElementById('ai-bio-btn');
  btn.disabled = true; btn.textContent = '✦ Writing...';
  try {
    const res = await fetch(EDGE_BASE + '/ai-bio-writer', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('e-name').value.trim() || trainer?.full_name,
        specialties: Array.from(specs),
        certifications: trainer?.certifications || [],
        years_experience: parseInt(document.getElementById('e-exp').value) || trainer?.years_experience,
        training_modes: Array.from(modes),
        city: trainer?.city || 'Dubai'
      })
    });
    const data = await res.json();
    if (data.bio) {
      document.getElementById('e-bio').value = data.bio;
      document.getElementById('bio-count').textContent = data.bio.length;
      showToast('AI bio generated! Edit it to make it yours.', 'success');
    } else throw new Error();
  } catch { showToast('AI bio generation failed. Try again.', 'error'); }
  finally { btn.disabled = false; btn.textContent = '✦ Write with AI'; }
}

// ===== PACKAGES =====
function addEditPackage(pkg = null) {
  const list = document.getElementById('packages-edit-list');
  if (list.children.length >= 5) { showToast('Maximum 5 packages on free plan', 'error'); return; }
  const id = 'pkg-' + Date.now();
  const div = document.createElement('div');
  div.className = 'package-card'; div.id = id;
  div.innerHTML = \`
    <div class="package-card-header">
      <span style="font-size:12px;font-weight:700;color:var(--text-muted);">Package</span>
      <div class="package-delete" onclick="document.getElementById('\${id}').remove()">×</div>
    </div>
    <div style="display:flex;gap:10px;margin-bottom:10px;">
      <div style="flex:2;"><div style="font-size:10px;color:var(--text-faint);font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:5px;">Name</div>
      <input type="text" placeholder="e.g. Monthly Pack" value="\${pkg?.name || ''}" style="width:100%;padding:10px 12px;background:var(--surface-3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;outline:none;"></div>
      <div style="flex:1;"><div style="font-size:10px;color:var(--text-faint);font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:5px;">AED</div>
      <input type="number" placeholder="350" value="\${pkg?.price || ''}" inputmode="numeric" style="width:100%;padding:10px 12px;background:var(--surface-3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;outline:none;font-family:'Manrope',sans-serif;font-weight:700;"></div>
    </div>
    <div style="display:flex;gap:10px;">
      <div style="flex:1;"><div style="font-size:10px;color:var(--text-faint);font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:5px;">Duration</div>
      <select style="width:100%;padding:10px 12px;background:var(--surface-3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;outline:none;">
        <option value="30min" \${pkg?.duration==='30min'?'selected':''}>30 min</option>
        <option value="45min" \${pkg?.duration==='45min'?'selected':''}>45 min</option>
        <option value="60min" \${!pkg?.duration||pkg?.duration==='60min'?'selected':''}>60 min</option>
        <option value="90min" \${pkg?.duration==='90min'?'selected':''}>90 min</option>
      </select></div>
      <div style="flex:1;"><div style="font-size:10px;color:var(--text-faint);font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:5px;">Sessions</div>
      <select style="width:100%;padding:10px 12px;background:var(--surface-3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;outline:none;">
        <option value="1" \${pkg?.sessions===1?'selected':''}>1 session</option>
        <option value="4" \${pkg?.sessions===4?'selected':''}>4 sessions</option>
        <option value="8" \${pkg?.sessions===8?'selected':''}>8 sessions</option>
        <option value="12" \${!pkg?.sessions||pkg?.sessions===12?'selected':''}>12 sessions</option>
        <option value="20" \${pkg?.sessions===20?'selected':''}>20 sessions</option>
      </select></div>
    </div>\`;
  list.appendChild(div);
}

function collectEditPackages() {
  return Array.from(document.querySelectorAll('.package-card')).map(card => {
    const inputs = card.querySelectorAll('input');
    const selects = card.querySelectorAll('select');
    return {
      name: inputs[0]?.value.trim(),
      price: parseFloat(inputs[1]?.value),
      duration: selects[0]?.value,
      sessions: parseInt(selects[1]?.value)
    };
  }).filter(p => p.name && p.price);
}

// ===== AVATAR CHANGE =====
async function changeAvatar(input) {
  if (!input.files[0]) return;
  const file = input.files[0];
  const status = document.getElementById('avatar-upload-status');
  status.style.display = 'block'; status.textContent = 'Uploading...';
  const reader = new FileReader();
  reader.onload = async e => {
    document.getElementById('avatar-img').src = e.target.result;
    try {
      const res = await fetch(EDGE_BASE + '/upload-image', {
        method: 'POST', headers: { 'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getAuthToken() },
        body: JSON.stringify({ base64: e.target.result, type: 'avatar', trainer_id: trainer.id })
      });
      const data = await res.json();
      if (data.url) { trainer.avatar_url = data.url; status.textContent = 'Saved!'; }
      else throw new Error();
    } catch { status.textContent = 'Upload failed'; status.style.color = '#ff5555'; }
    setTimeout(() => status.style.display = 'none', 2000);
  };
  reader.readAsDataURL(file);
}

// ===== GALLERY =====
function addGalleryImages(input) {
  Array.from(input.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = e => addGalleryItem(e.target.result, true);
    reader.readAsDataURL(file);
  });
}
function addGalleryItem(src, isNew = false) {
  if (galleryImages.length >= 9) return;
  galleryImages.push({ src, isNew });
  const grid = document.getElementById('gallery-edit-grid');
  const addBtn = grid.querySelector('.gallery-add');
  const item = document.createElement('div');
  item.className = 'gallery-item-edit';
  item.innerHTML = \`<img src="\${src}" alt="Gallery"><div class="gallery-item-delete" onclick="removeGalleryItem(this,'\${src}')">×</div>\`;
  grid.insertBefore(item, addBtn);
}
function removeGalleryItem(btn, src) {
  btn.parentElement.remove();
  const idx = galleryImages.findIndex(i => i.src === src);
  if (idx > -1) galleryImages.splice(idx, 1);
}

// ===== REPS VERIFICATION =====
async function submitRepsVerification() {
  const reps = document.getElementById('e-reps').value.trim();
  if (!reps) { showToast('Please enter your REPs number', 'error'); return; }
  const res = await fetch(EDGE_BASE + '/verify-reps', {
    method: 'POST', headers: { 'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getAuthToken() },
    body: JSON.stringify({ trainer_id: trainer.id, reps_number: reps })
  });
  if (res.ok) showToast('Verification submitted  -  we\\'ll confirm within 24h', 'success');
  else showToast('Failed to submit. Please try again.', 'error');
}

// ===== SAVE ALL =====
async function saveAll() {
  const btn = document.getElementById('save-btn');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
  try {
    const payload = {
      action: 'update',
      trainer_id: trainer.id,
      name: document.getElementById('e-name').value.trim(),
      title: document.getElementById('e-title').value.trim(),
      bio: document.getElementById('e-bio').value.trim(),
      years_experience: parseInt(document.getElementById('e-exp').value) || null,
      clients_trained: parseInt(document.getElementById('e-clients').value) || null,
      specialties: Array.from(specs),
      training_modes: Array.from(modes),
      video_intro_url: document.getElementById('e-video-intro').value.trim() || null,
      accepting_clients: availOn,
      instagram: document.getElementById('e-instagram').value.trim(),
      tiktok: document.getElementById('e-tiktok').value.trim(),
      youtube: document.getElementById('e-youtube').value.trim(),
      packages: collectEditPackages(),
      gallery_new: galleryImages.filter(i => i.isNew).map(i => i.src)
    };
    const res = await fetch(EDGE_BASE + '/update-trainer', {
      method: 'POST', headers: { 'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getAuthToken() },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error();
    showToast('Profile saved!', 'success');
  } catch { showToast('Save failed. Please try again.', 'error'); }
  finally { btn.disabled = false; btn.textContent = 'Save'; }
}

// ===== DELETE =====
function confirmDelete() {
  if (!confirm('Are you sure? This permanently deletes your profile and all data.')) return;
  fetch(EDGE_BASE + '/update-trainer', {
    method: 'POST', headers: { 'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getAuthToken() },
    body: JSON.stringify({ action: 'delete', trainer_id: trainer.id })
  }).then(r => {
    if (r.ok) { clearAuthToken(); location.href = '/'; }
    else showToast('Delete failed. Please try again.', 'error');
  });
}

init();
<\/script> `], ["  ", `<div class="edit-wrap" data-astro-cid-crkt4yyk> <!-- Header --> <div class="edit-header" data-astro-cid-crkt4yyk> <a href="/" class="edit-logo" data-astro-cid-crkt4yyk> <svg width="26" height="26" viewBox="0 0 32 32" data-astro-cid-crkt4yyk><rect width="32" height="32" rx="8" fill="#FF5C00" data-astro-cid-crkt4yyk></rect><text x="16" y="23" font-family="Manrope,Arial,sans-serif" font-size="14" font-weight="800" text-anchor="middle" fill="white" data-astro-cid-crkt4yyk>TB</text></svg>
Edit Profile
</a> <div class="header-actions" data-astro-cid-crkt4yyk> <a id="view-profile-link" href="#" class="header-btn header-btn-ghost" style="text-decoration:none;" data-astro-cid-crkt4yyk>View</a> <button id="save-btn" class="header-btn header-btn-brand" onclick="saveAll()" data-astro-cid-crkt4yyk>Save</button> </div> </div> <!-- ===== AUTH GATE ===== --> <div id="auth-gate" data-astro-cid-crkt4yyk> <div class="auth-gate" data-astro-cid-crkt4yyk> <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" style="margin-bottom:20px;" data-astro-cid-crkt4yyk><rect x="3" y="11" width="18" height="11" rx="2" ry="2" data-astro-cid-crkt4yyk></rect><path d="M7 11V7a5 5 0 0110 0v4" data-astro-cid-crkt4yyk></path></svg> <h2 data-astro-cid-crkt4yyk>Sign in to edit</h2> <p data-astro-cid-crkt4yyk>Enter your email to receive a magic link  -  no password needed.</p> <input class="auth-field" type="email" id="auth-email" placeholder="your@email.com" autocomplete="email" data-astro-cid-crkt4yyk> <div id="auth-error" style="display:none;font-size:12px;color:#ff5555;margin-bottom:10px;max-width:340px;" data-astro-cid-crkt4yyk></div> <button class="auth-btn" id="auth-btn" onclick="sendMagicLink()" data-astro-cid-crkt4yyk>Send Magic Link</button> <div class="auth-hint" data-astro-cid-crkt4yyk>Check your inbox  -  link expires in 15 minutes.</div> </div> <div id="auth-sent" class="hidden" style="text-align:center;padding:40px 0;" data-astro-cid-crkt4yyk> <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="1.5" style="margin-bottom:16px;" data-astro-cid-crkt4yyk><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" data-astro-cid-crkt4yyk></path><polyline points="22,6 12,13 2,6" data-astro-cid-crkt4yyk></polyline></svg> <h2 style="font-family:'Manrope',sans-serif;font-size:20px;font-weight:800;margin-bottom:8px;" data-astro-cid-crkt4yyk>Check your inbox</h2> <p style="font-size:14px;color:var(--text-muted);max-width:280px;margin:0 auto;" data-astro-cid-crkt4yyk>We sent a magic link to <strong id="auth-sent-email" style="color:var(--brand);" data-astro-cid-crkt4yyk></strong>. Click it to sign in.</p> </div> </div> <!-- ===== EDIT FORM (shown after auth) ===== --> <div id="edit-form" class="hidden" data-astro-cid-crkt4yyk> <!-- Section: Profile Photo --> <div class="edit-section" data-astro-cid-crkt4yyk> <div class="section-heading" data-astro-cid-crkt4yyk>Profile Photo</div> <div class="section-sub" data-astro-cid-crkt4yyk>Your photo appears on your public profile and in search results.</div> <div class="avatar-editor" data-astro-cid-crkt4yyk> <div class="avatar-edit-circle" id="avatar-circle" data-astro-cid-crkt4yyk> <img id="avatar-img" src="" alt="Avatar" data-astro-cid-crkt4yyk> <div class="avatar-edit-overlay" data-astro-cid-crkt4yyk> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" data-astro-cid-crkt4yyk><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" data-astro-cid-crkt4yyk></path><circle cx="12" cy="13" r="4" data-astro-cid-crkt4yyk></circle></svg> </div> <input type="file" accept="image/*" onchange="changeAvatar(this)" data-astro-cid-crkt4yyk> </div> <div data-astro-cid-crkt4yyk> <div style="font-size:13px;font-weight:600;margin-bottom:4px;" data-astro-cid-crkt4yyk>Change photo</div> <div style="font-size:11px;color:var(--text-muted);" data-astro-cid-crkt4yyk>JPG or PNG, at least 400×400px</div> <div id="avatar-upload-status" style="font-size:11px;color:var(--brand);margin-top:4px;display:none;" data-astro-cid-crkt4yyk>Uploading...</div> </div> </div> </div> <!-- Section: Basic Info --> <div class="edit-section" data-astro-cid-crkt4yyk> <div class="section-heading" data-astro-cid-crkt4yyk>Basic Info</div> <div class="section-sub" data-astro-cid-crkt4yyk>Your name, title, and bio are the first things clients see.</div> <div class="field" data-astro-cid-crkt4yyk> <label data-astro-cid-crkt4yyk>Full Name</label> <input type="text" id="e-name" placeholder="Your full name" autocomplete="name" data-astro-cid-crkt4yyk> </div> <div class="field" data-astro-cid-crkt4yyk> <label data-astro-cid-crkt4yyk>Title / Role</label> <input type="text" id="e-title" placeholder="e.g. Strength & Conditioning Coach" maxlength="60" data-astro-cid-crkt4yyk> </div> <div class="field" data-astro-cid-crkt4yyk> <label style="display:flex;align-items:center;justify-content:space-between;" data-astro-cid-crkt4yyk>Bio <button type="button" onclick="generateAIBio()" style="background:var(--brand-dim);border:1px solid var(--brand-border);color:var(--brand);font-size:11px;font-weight:700;padding:4px 10px;border-radius:8px;cursor:pointer;font-family:'Manrope',sans-serif;" id="ai-bio-btn" data-astro-cid-crkt4yyk>✦ Write with AI</button></label> <textarea id="e-bio" maxlength="400" oninput="document.getElementById('bio-count').textContent=this.value.length" data-astro-cid-crkt4yyk></textarea> <div class="field-hint" data-astro-cid-crkt4yyk><span id="bio-count" data-astro-cid-crkt4yyk>0</span>/400 characters</div> </div> <div style="display:flex;gap:12px;" data-astro-cid-crkt4yyk> <div class="field" style="flex:1;" data-astro-cid-crkt4yyk> <label data-astro-cid-crkt4yyk>Years Experience</label> <input type="number" id="e-exp" min="0" max="50" inputmode="numeric" data-astro-cid-crkt4yyk> </div> <div class="field" style="flex:1;" data-astro-cid-crkt4yyk> <label data-astro-cid-crkt4yyk>Clients Trained</label> <input type="number" id="e-clients" min="0" inputmode="numeric" data-astro-cid-crkt4yyk> </div> </div> </div> <!-- Section: Specialties --> <div class="edit-section" data-astro-cid-crkt4yyk> <div class="section-heading" data-astro-cid-crkt4yyk>Specialties</div> <div class="section-sub" data-astro-cid-crkt4yyk>Select all that apply  -  shown as pills on your profile.</div> <div class="toggle-row" id="spec-row" data-astro-cid-crkt4yyk> <div class="toggle-pill" onclick="togglePill(this,'spec','Strength')" data-astro-cid-crkt4yyk>Strength</div> <div class="toggle-pill" onclick="togglePill(this,'spec','Fat Loss')" data-astro-cid-crkt4yyk>Fat Loss</div> <div class="toggle-pill" onclick="togglePill(this,'spec','Muscle Gain')" data-astro-cid-crkt4yyk>Muscle Gain</div> <div class="toggle-pill" onclick="togglePill(this,'spec','HIIT')" data-astro-cid-crkt4yyk>HIIT</div> <div class="toggle-pill" onclick="togglePill(this,'spec','Cardio')" data-astro-cid-crkt4yyk>Cardio</div> <div class="toggle-pill" onclick="togglePill(this,'spec','Yoga')" data-astro-cid-crkt4yyk>Yoga</div> <div class="toggle-pill" onclick="togglePill(this,'spec','Pilates')" data-astro-cid-crkt4yyk>Pilates</div> <div class="toggle-pill" onclick="togglePill(this,'spec','CrossFit')" data-astro-cid-crkt4yyk>CrossFit</div> <div class="toggle-pill" onclick="togglePill(this,'spec','Boxing')" data-astro-cid-crkt4yyk>Boxing</div> <div class="toggle-pill" onclick="togglePill(this,'spec','Nutrition')" data-astro-cid-crkt4yyk>Nutrition</div> <div class="toggle-pill" onclick="togglePill(this,'spec','Rehabilitation')" data-astro-cid-crkt4yyk>Rehabilitation</div> <div class="toggle-pill" onclick="togglePill(this,'spec','Sport Specific')" data-astro-cid-crkt4yyk>Sport Specific</div> </div> </div> <!-- Section: Availability --> <div class="edit-section" data-astro-cid-crkt4yyk> <div class="section-heading" data-astro-cid-crkt4yyk>Availability</div> <div class="section-sub" data-astro-cid-crkt4yyk>Let clients know if you're taking new clients.</div> <div class="avail-toggle" onclick="toggleAvailability()" data-astro-cid-crkt4yyk> <div data-astro-cid-crkt4yyk> <div class="avail-label" data-astro-cid-crkt4yyk>Accepting New Clients</div> <div class="avail-sub" id="avail-sub-text" data-astro-cid-crkt4yyk>Currently showing as available</div> </div> <div class="switch" id="avail-switch" data-astro-cid-crkt4yyk> <div class="switch-knob" data-astro-cid-crkt4yyk></div> </div> </div> </div> <!-- Section: Session Packages --> <div class="edit-section" data-astro-cid-crkt4yyk> <div class="section-heading" data-astro-cid-crkt4yyk>Session Packages</div> <div class="section-sub" data-astro-cid-crkt4yyk>Clients see these on your profile. Add up to 5 packages.</div> <div id="packages-edit-list" data-astro-cid-crkt4yyk></div> <button onclick="addEditPackage()" style="width:100%;padding:12px;border-radius:10px;background:transparent;border:1px dashed var(--border);color:var(--text-muted);font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor='var(--brand)';this.style.color='var(--brand)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text-muted)'" data-astro-cid-crkt4yyk>
+ Add Package
</button> </div> <!-- Section: Transformation Gallery --> <div class="edit-section" data-astro-cid-crkt4yyk> <div class="section-heading" data-astro-cid-crkt4yyk>Transformation Gallery</div> <div class="section-sub" data-astro-cid-crkt4yyk>Before/after photos build trust. Add up to 9 images.</div> <div class="gallery-grid-edit" id="gallery-edit-grid" data-astro-cid-crkt4yyk> <div class="gallery-add" data-astro-cid-crkt4yyk> <input type="file" accept="image/*" multiple onchange="addGalleryImages(this)" data-astro-cid-crkt4yyk> <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" data-astro-cid-crkt4yyk><line x1="12" y1="5" x2="12" y2="19" data-astro-cid-crkt4yyk></line><line x1="5" y1="12" x2="19" y2="12" data-astro-cid-crkt4yyk></line></svg> <span style="font-size:10px;color:var(--text-faint);margin-top:4px;" data-astro-cid-crkt4yyk>Add</span> </div> </div> </div> <!-- Section: Training Modes --> <div class="edit-section" data-astro-cid-crkt4yyk> <div class="section-heading" data-astro-cid-crkt4yyk>Training Modes</div> <div class="section-sub" data-astro-cid-crkt4yyk>Let clients know how you can train them.</div> <div style="display:flex;gap:8px;flex-wrap:wrap;" id="mode-row" data-astro-cid-crkt4yyk> <button type="button" class="toggle-pill" onclick="togglePill(this,'modes','in-person')" data-astro-cid-crkt4yyk>In-Person</button> <button type="button" class="toggle-pill" onclick="togglePill(this,'modes','online')" data-astro-cid-crkt4yyk>Online</button> <button type="button" class="toggle-pill" onclick="togglePill(this,'modes','hybrid')" data-astro-cid-crkt4yyk>Hybrid</button> </div> </div> <!-- Section: Video Intro --> <div class="edit-section" data-astro-cid-crkt4yyk> <div class="section-heading" data-astro-cid-crkt4yyk>Video Intro</div> <div class="section-sub" data-astro-cid-crkt4yyk>Add a short intro video  -  YouTube or Instagram Reel link. Clients who watch a video are 3× more likely to book.</div> <div class="field" data-astro-cid-crkt4yyk> <label data-astro-cid-crkt4yyk>Video URL</label> <input type="url" id="e-video-intro" placeholder="https://youtube.com/shorts/... or https://instagram.com/reel/..." data-astro-cid-crkt4yyk> <div class="field-hint" data-astro-cid-crkt4yyk>YouTube Shorts or Instagram Reels work best (under 60 seconds)</div> </div> </div> <!-- Section: Social Links --> <div class="edit-section" data-astro-cid-crkt4yyk> <div class="section-heading" data-astro-cid-crkt4yyk>Social Links</div> <div class="section-sub" data-astro-cid-crkt4yyk>Connect your social media to your profile.</div> <div class="field" data-astro-cid-crkt4yyk> <label data-astro-cid-crkt4yyk>Instagram</label> <div style="display:flex;align-items:center;background:var(--surface-2);border:1px solid var(--border);border-radius:12px;overflow:hidden;transition:border-color 0.2s;" id="ig-wrap" data-astro-cid-crkt4yyk> <span style="padding:13px 0 13px 15px;font-size:14px;color:var(--text-faint);" data-astro-cid-crkt4yyk>@</span> <input type="text" id="e-instagram" placeholder="yourhandle" style="border:none;background:transparent;padding:13px 15px 13px 6px;font-size:14px;flex:1;min-width:0;color:var(--text);outline:none;" onfocus="document.getElementById('ig-wrap').style.borderColor='var(--brand)'" onblur="document.getElementById('ig-wrap').style.borderColor='var(--border)'" data-astro-cid-crkt4yyk> </div> </div> <div class="field" data-astro-cid-crkt4yyk> <label data-astro-cid-crkt4yyk>TikTok</label> <div style="display:flex;align-items:center;background:var(--surface-2);border:1px solid var(--border);border-radius:12px;overflow:hidden;transition:border-color 0.2s;" id="tt-wrap" data-astro-cid-crkt4yyk> <span style="padding:13px 0 13px 15px;font-size:14px;color:var(--text-faint);" data-astro-cid-crkt4yyk>@</span> <input type="text" id="e-tiktok" placeholder="yourhandle" style="border:none;background:transparent;padding:13px 15px 13px 6px;font-size:14px;flex:1;min-width:0;color:var(--text);outline:none;" onfocus="document.getElementById('tt-wrap').style.borderColor='var(--brand)'" onblur="document.getElementById('tt-wrap').style.borderColor='var(--border)'" data-astro-cid-crkt4yyk> </div> </div> <div class="field" data-astro-cid-crkt4yyk> <label data-astro-cid-crkt4yyk>YouTube</label> <input type="url" id="e-youtube" placeholder="https://youtube.com/@yourchannel" data-astro-cid-crkt4yyk> </div> </div> <!-- Section: REPs Verification --> <div class="edit-section" data-astro-cid-crkt4yyk> <div class="section-heading" data-astro-cid-crkt4yyk>REPs UAE Verification</div> <div class="section-sub" data-astro-cid-crkt4yyk>Your verified badge builds client trust.</div> <div id="reps-verified-card" class="hidden" style="background:var(--reps-dim);border:1px solid var(--reps-border);border-radius:12px;padding:14px;display:flex;align-items:center;gap:12px;margin-bottom:14px;" data-astro-cid-crkt4yyk> <svg width="24" height="24" viewBox="0 0 24 24" fill="#00C853" data-astro-cid-crkt4yyk><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" data-astro-cid-crkt4yyk></path></svg> <div data-astro-cid-crkt4yyk> <div style="font-size:13px;font-weight:700;color:var(--reps);" data-astro-cid-crkt4yyk>REPs UAE Verified</div> <div id="reps-number-display" style="font-size:11px;color:var(--text-muted);" data-astro-cid-crkt4yyk></div> </div> </div> <div id="reps-unverified-card" data-astro-cid-crkt4yyk> <div class="field" data-astro-cid-crkt4yyk> <label data-astro-cid-crkt4yyk>REPs UAE Number</label> <input type="text" id="e-reps" placeholder="REP-12345" style="font-family:'Manrope',sans-serif;font-weight:700;font-size:15px;letter-spacing:0.05em;" data-astro-cid-crkt4yyk> <div class="field-hint" data-astro-cid-crkt4yyk>Find your number at repsuae.com/searcht</div> </div> <button onclick="submitRepsVerification()" style="padding:12px 20px;border-radius:10px;background:var(--reps-dim);border:1px solid var(--reps-border);color:var(--reps);font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;" data-astro-cid-crkt4yyk>
Submit for Verification
</button> </div> </div> <!-- Section: Danger Zone --> <div class="edit-section" data-astro-cid-crkt4yyk> <div class="section-heading" style="color:#ff5555;" data-astro-cid-crkt4yyk>Danger Zone</div> <div class="section-sub" data-astro-cid-crkt4yyk>These actions are permanent and cannot be undone.</div> <div class="danger-zone" data-astro-cid-crkt4yyk> <div class="danger-title" data-astro-cid-crkt4yyk>Delete Profile</div> <div class="danger-sub" data-astro-cid-crkt4yyk>Permanently removes your profile, all leads, and data. Your URL becomes available again.</div> <button class="danger-btn" onclick="confirmDelete()" data-astro-cid-crkt4yyk>Delete My Profile</button> </div> </div> </div><!-- /edit-form --> </div>  <div class="toast" id="toast" data-astro-cid-crkt4yyk></div> <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.min.js" crossorigin="anonymous"><\/script> <script>
const SUPABASE_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo';
const EDGE_BASE = SUPABASE_URL + '/functions/v1';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let trainer = null;
let availOn = true;
const specs = new Set();
const modes = new Set(['in-person']);
const galleryImages = [];

// ===== TOAST =====
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = 'toast' + (type ? ' ' + type : '');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== AUTH =====
async function sendMagicLink() {
  const email = document.getElementById('auth-email').value.trim();
  const err = document.getElementById('auth-error');
  if (!/^[^\\\\s@]+@[^\\\\s@]+\\\\.[^\\\\s@]+$/.test(email)) {
    err.textContent = 'Please enter a valid email.'; err.style.display = 'block'; return;
  }
  const btn = document.getElementById('auth-btn');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
  try {
    const res = await fetch(EDGE_BASE + '/send-magic-link', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, redirect: location.origin + '/edit' })
    });
    if (!res.ok) throw new Error();
    document.getElementById('auth-sent-email').textContent = email;
    document.getElementById('auth-gate').querySelector('.auth-gate').classList.add('hidden');
    document.getElementById('auth-sent').classList.remove('hidden');
  } catch {
    err.textContent = 'Could not send magic link. Please try again.'; err.style.display = 'block';
    btn.disabled = false; btn.textContent = 'Send Magic Link';
  }
}

// ===== AUTH HELPERS =====
// Reads the tb_session HttpOnly cookie (set by verify-magic-link edge function).
// Falls back to localStorage for backward compatibility during migration.
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

// ===== INIT =====
async function init() {
  const params = new URLSearchParams(location.search);
  const urlToken = params.get('token');
  const token = urlToken || getAuthToken();
  if (!token) return; // show auth gate

  try {
    const res = await fetch(EDGE_BASE + '/verify-magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // receive HttpOnly Set-Cookie from edge function
      body: JSON.stringify({ token })
    });
    const data = await res.json();
    if (!res.ok || !data.trainer) throw new Error();
    // Store in localStorage as fallback only when arriving from a URL token
    if (urlToken) localStorage.setItem('tb_edit_token', token);
    if (urlToken) history.replaceState({}, '', '/edit');
    trainer = data.trainer;
    populateForm(trainer);
    document.getElementById('auth-gate').classList.add('hidden');
    document.getElementById('edit-form').classList.remove('hidden');
    document.getElementById('view-profile-link').href = '/' + trainer.slug;
  } catch {
    clearAuthToken();
  }
}

function populateForm(t) {
  document.getElementById('e-name').value = t.name || '';
  document.getElementById('e-title').value = t.title || '';
  document.getElementById('e-bio').value = t.bio || '';
  document.getElementById('bio-count').textContent = (t.bio || '').length;
  document.getElementById('e-exp').value = t.years_experience || '';
  document.getElementById('e-clients').value = t.clients_trained || '';
  document.getElementById('e-instagram').value = t.instagram || '';
  document.getElementById('e-tiktok').value = t.tiktok || '';
  document.getElementById('e-youtube').value = t.youtube || '';
  document.getElementById('e-reps').value = t.reps_number || '';

  // Avatar
  if (t.avatar_url) document.getElementById('avatar-img').src = t.avatar_url;

  // Availability
  availOn = t.accepting_clients !== false;
  updateAvailSwitch();

  // Specialties
  if (t.specialties) {
    t.specialties.forEach(s => specs.add(s));
    document.querySelectorAll('#spec-row .toggle-pill').forEach(p => {
      if (specs.has(p.textContent.trim())) p.classList.add('active');
    });
  }

  // Training modes
  if (t.training_modes) {
    t.training_modes.forEach(m => modes.add(m));
    document.querySelectorAll('#mode-row .toggle-pill').forEach(p => {
      const val = p.textContent.trim().toLowerCase().replace(' ', '-');
      if (modes.has(val)) p.classList.add('active');
    });
  }

  // Video intro
  if (t.video_intro_url) document.getElementById('e-video-intro').value = t.video_intro_url;

  // REPs
  if (t.reps_verified) {
    document.getElementById('reps-verified-card').classList.remove('hidden');
    document.getElementById('reps-number-display').textContent = 'Registration: ' + (t.reps_number || '');
    document.getElementById('reps-unverified-card').style.display = 'none';
  }

  // Packages
  if (t.packages) t.packages.forEach(p => addEditPackage(p));

  // Gallery
  if (t.gallery_urls) {
    t.gallery_urls.forEach(url => addGalleryItem(url));
  }
}

// ===== AVAILABILITY =====
function toggleAvailability() {
  availOn = !availOn;
  updateAvailSwitch();
}
function updateAvailSwitch() {
  const sw = document.getElementById('avail-switch');
  const sub = document.getElementById('avail-sub-text');
  if (availOn) {
    sw.classList.add('on');
    sub.textContent = 'Currently showing as available';
  } else {
    sw.classList.remove('on');
    sub.textContent = 'Currently showing as fully booked';
  }
}

// ===== SPECIALTIES & MODES =====
function togglePill(el, group, val) {
  el.classList.toggle('active');
  const set = group === 'modes' ? modes : specs;
  if (el.classList.contains('active')) set.add(val);
  else set.delete(val);
}

// ===== AI BIO WRITER =====
async function generateAIBio() {
  const btn = document.getElementById('ai-bio-btn');
  btn.disabled = true; btn.textContent = '✦ Writing...';
  try {
    const res = await fetch(EDGE_BASE + '/ai-bio-writer', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('e-name').value.trim() || trainer?.full_name,
        specialties: Array.from(specs),
        certifications: trainer?.certifications || [],
        years_experience: parseInt(document.getElementById('e-exp').value) || trainer?.years_experience,
        training_modes: Array.from(modes),
        city: trainer?.city || 'Dubai'
      })
    });
    const data = await res.json();
    if (data.bio) {
      document.getElementById('e-bio').value = data.bio;
      document.getElementById('bio-count').textContent = data.bio.length;
      showToast('AI bio generated! Edit it to make it yours.', 'success');
    } else throw new Error();
  } catch { showToast('AI bio generation failed. Try again.', 'error'); }
  finally { btn.disabled = false; btn.textContent = '✦ Write with AI'; }
}

// ===== PACKAGES =====
function addEditPackage(pkg = null) {
  const list = document.getElementById('packages-edit-list');
  if (list.children.length >= 5) { showToast('Maximum 5 packages on free plan', 'error'); return; }
  const id = 'pkg-' + Date.now();
  const div = document.createElement('div');
  div.className = 'package-card'; div.id = id;
  div.innerHTML = \\\`
    <div class="package-card-header">
      <span style="font-size:12px;font-weight:700;color:var(--text-muted);">Package</span>
      <div class="package-delete" onclick="document.getElementById('\\\${id}').remove()">×</div>
    </div>
    <div style="display:flex;gap:10px;margin-bottom:10px;">
      <div style="flex:2;"><div style="font-size:10px;color:var(--text-faint);font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:5px;">Name</div>
      <input type="text" placeholder="e.g. Monthly Pack" value="\\\${pkg?.name || ''}" style="width:100%;padding:10px 12px;background:var(--surface-3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;outline:none;"></div>
      <div style="flex:1;"><div style="font-size:10px;color:var(--text-faint);font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:5px;">AED</div>
      <input type="number" placeholder="350" value="\\\${pkg?.price || ''}" inputmode="numeric" style="width:100%;padding:10px 12px;background:var(--surface-3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;outline:none;font-family:'Manrope',sans-serif;font-weight:700;"></div>
    </div>
    <div style="display:flex;gap:10px;">
      <div style="flex:1;"><div style="font-size:10px;color:var(--text-faint);font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:5px;">Duration</div>
      <select style="width:100%;padding:10px 12px;background:var(--surface-3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;outline:none;">
        <option value="30min" \\\${pkg?.duration==='30min'?'selected':''}>30 min</option>
        <option value="45min" \\\${pkg?.duration==='45min'?'selected':''}>45 min</option>
        <option value="60min" \\\${!pkg?.duration||pkg?.duration==='60min'?'selected':''}>60 min</option>
        <option value="90min" \\\${pkg?.duration==='90min'?'selected':''}>90 min</option>
      </select></div>
      <div style="flex:1;"><div style="font-size:10px;color:var(--text-faint);font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:5px;">Sessions</div>
      <select style="width:100%;padding:10px 12px;background:var(--surface-3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;outline:none;">
        <option value="1" \\\${pkg?.sessions===1?'selected':''}>1 session</option>
        <option value="4" \\\${pkg?.sessions===4?'selected':''}>4 sessions</option>
        <option value="8" \\\${pkg?.sessions===8?'selected':''}>8 sessions</option>
        <option value="12" \\\${!pkg?.sessions||pkg?.sessions===12?'selected':''}>12 sessions</option>
        <option value="20" \\\${pkg?.sessions===20?'selected':''}>20 sessions</option>
      </select></div>
    </div>\\\`;
  list.appendChild(div);
}

function collectEditPackages() {
  return Array.from(document.querySelectorAll('.package-card')).map(card => {
    const inputs = card.querySelectorAll('input');
    const selects = card.querySelectorAll('select');
    return {
      name: inputs[0]?.value.trim(),
      price: parseFloat(inputs[1]?.value),
      duration: selects[0]?.value,
      sessions: parseInt(selects[1]?.value)
    };
  }).filter(p => p.name && p.price);
}

// ===== AVATAR CHANGE =====
async function changeAvatar(input) {
  if (!input.files[0]) return;
  const file = input.files[0];
  const status = document.getElementById('avatar-upload-status');
  status.style.display = 'block'; status.textContent = 'Uploading...';
  const reader = new FileReader();
  reader.onload = async e => {
    document.getElementById('avatar-img').src = e.target.result;
    try {
      const res = await fetch(EDGE_BASE + '/upload-image', {
        method: 'POST', headers: { 'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getAuthToken() },
        body: JSON.stringify({ base64: e.target.result, type: 'avatar', trainer_id: trainer.id })
      });
      const data = await res.json();
      if (data.url) { trainer.avatar_url = data.url; status.textContent = 'Saved!'; }
      else throw new Error();
    } catch { status.textContent = 'Upload failed'; status.style.color = '#ff5555'; }
    setTimeout(() => status.style.display = 'none', 2000);
  };
  reader.readAsDataURL(file);
}

// ===== GALLERY =====
function addGalleryImages(input) {
  Array.from(input.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = e => addGalleryItem(e.target.result, true);
    reader.readAsDataURL(file);
  });
}
function addGalleryItem(src, isNew = false) {
  if (galleryImages.length >= 9) return;
  galleryImages.push({ src, isNew });
  const grid = document.getElementById('gallery-edit-grid');
  const addBtn = grid.querySelector('.gallery-add');
  const item = document.createElement('div');
  item.className = 'gallery-item-edit';
  item.innerHTML = \\\`<img src="\\\${src}" alt="Gallery"><div class="gallery-item-delete" onclick="removeGalleryItem(this,'\\\${src}')">×</div>\\\`;
  grid.insertBefore(item, addBtn);
}
function removeGalleryItem(btn, src) {
  btn.parentElement.remove();
  const idx = galleryImages.findIndex(i => i.src === src);
  if (idx > -1) galleryImages.splice(idx, 1);
}

// ===== REPS VERIFICATION =====
async function submitRepsVerification() {
  const reps = document.getElementById('e-reps').value.trim();
  if (!reps) { showToast('Please enter your REPs number', 'error'); return; }
  const res = await fetch(EDGE_BASE + '/verify-reps', {
    method: 'POST', headers: { 'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getAuthToken() },
    body: JSON.stringify({ trainer_id: trainer.id, reps_number: reps })
  });
  if (res.ok) showToast('Verification submitted  -  we\\\\'ll confirm within 24h', 'success');
  else showToast('Failed to submit. Please try again.', 'error');
}

// ===== SAVE ALL =====
async function saveAll() {
  const btn = document.getElementById('save-btn');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
  try {
    const payload = {
      action: 'update',
      trainer_id: trainer.id,
      name: document.getElementById('e-name').value.trim(),
      title: document.getElementById('e-title').value.trim(),
      bio: document.getElementById('e-bio').value.trim(),
      years_experience: parseInt(document.getElementById('e-exp').value) || null,
      clients_trained: parseInt(document.getElementById('e-clients').value) || null,
      specialties: Array.from(specs),
      training_modes: Array.from(modes),
      video_intro_url: document.getElementById('e-video-intro').value.trim() || null,
      accepting_clients: availOn,
      instagram: document.getElementById('e-instagram').value.trim(),
      tiktok: document.getElementById('e-tiktok').value.trim(),
      youtube: document.getElementById('e-youtube').value.trim(),
      packages: collectEditPackages(),
      gallery_new: galleryImages.filter(i => i.isNew).map(i => i.src)
    };
    const res = await fetch(EDGE_BASE + '/update-trainer', {
      method: 'POST', headers: { 'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getAuthToken() },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error();
    showToast('Profile saved!', 'success');
  } catch { showToast('Save failed. Please try again.', 'error'); }
  finally { btn.disabled = false; btn.textContent = 'Save'; }
}

// ===== DELETE =====
function confirmDelete() {
  if (!confirm('Are you sure? This permanently deletes your profile and all data.')) return;
  fetch(EDGE_BASE + '/update-trainer', {
    method: 'POST', headers: { 'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getAuthToken() },
    body: JSON.stringify({ action: 'delete', trainer_id: trainer.id })
  }).then(r => {
    if (r.ok) { clearAuthToken(); location.href = '/'; }
    else showToast('Delete failed. Please try again.', 'error');
  });
}

init();
<\/script> `])), maybeRenderHead()) })}`;
}, "/home/ubuntu/trainedby2/src/pages/edit.astro", void 0);

const $$file = "/home/ubuntu/trainedby2/src/pages/edit.astro";
const $$url = "/edit";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Edit,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
