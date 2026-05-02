/* empty css               */
import { c as createComponent } from './astro-component_DiJ9uz96.mjs';
import { h as renderComponent, r as renderTemplate, m as maybeRenderHead } from './ssr-function_D_8GPgmW.mjs';
import { g as getMarket, r as renderScript } from './market_CY7-kFE1.mjs';
import { $ as $$Base } from './Base_X9W0huPu.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Profile = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Profile;
  const market = getMarket(Astro2.url.hostname);
  const brandName = market.brandName;
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": `Trainer Profile - ${brandName}`, "description": `Verified personal trainer profile on ${brandName}`, "data-astro-cid-wwes6yjo": true }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template(["   ", `<div id="loading" data-astro-cid-wwes6yjo> <div class="sk-logo" data-astro-cid-wwes6yjo>TRAINEDBY</div> <div class="sk-spinner" data-astro-cid-wwes6yjo></div> </div>  <div id="err" data-astro-cid-wwes6yjo> <div class="err-icon" data-astro-cid-wwes6yjo>🔍</div> <div class="err-title" data-astro-cid-wwes6yjo>Trainer not found</div> <div class="err-sub" data-astro-cid-wwes6yjo>This profile doesn't exist or the link may be incorrect.</div> <a href="/" style="margin-top:12px;color:var(--orange);font-weight:600;font-size:14px" data-astro-cid-wwes6yjo>Browse Trainers →</a> </div>  <div id="pending" data-astro-cid-wwes6yjo> <div style="width:72px;height:72px;border-radius:50%;background:rgba(251,191,36,0.15);border:1px solid rgba(251,191,36,0.3);display:flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:8px" data-astro-cid-wwes6yjo>⏳</div> <div style="font-size:20px;font-weight:800" data-astro-cid-wwes6yjo>Verification in Progress</div> <div style="font-size:14px;color:var(--white-60);line-height:1.6;max-width:280px" data-astro-cid-wwes6yjo>This trainer's REPs UAE credentials are being verified. Check back shortly.</div> </div>  <div id="bg" data-astro-cid-wwes6yjo></div>  <div id="topbar" data-astro-cid-wwes6yjo> <a href="/" class="tb-logo" id="site-logo" data-astro-cid-wwes6yjo>TrainedBy</a> `, ` <div style="display:flex;align-items:center;gap:8px" data-astro-cid-wwes6yjo> <div class="tb-share" onclick="shareProfile()" title="Share" data-astro-cid-wwes6yjo> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" data-astro-cid-wwes6yjo></path><polyline points="16 6 12 2 8 6" data-astro-cid-wwes6yjo></polyline><line x1="12" y1="2" x2="12" y2="15" data-astro-cid-wwes6yjo></line></svg> </div> <a href="/join" class="tb-cta" data-astro-cid-wwes6yjo>Get Your Page</a> </div> </div>  <div id="page" style="display:none" data-astro-cid-wwes6yjo> <!-- Left column wrapper (desktop) / inline (mobile) --> <div id="left-col" data-astro-cid-wwes6yjo> <!-- Hero --> <div id="hero" data-astro-cid-wwes6yjo> <!-- Avatar --> <div class="avatar-wrap" style="position:relative" data-astro-cid-wwes6yjo> <div class="avatar-ring" data-astro-cid-wwes6yjo></div> <div class="avatar-inner" data-astro-cid-wwes6yjo> <img id="avatarImg" src="" alt="" style="display:none" data-astro-cid-wwes6yjo> <div id="avatarInitials" class="avatar-initials" data-astro-cid-wwes6yjo></div> </div> <div class="avatar-video-btn" id="videoBadge" style="display:none" onclick="openVideoModal()" data-astro-cid-wwes6yjo> <svg width="10" height="10" viewBox="0 0 24 24" fill="white" data-astro-cid-wwes6yjo><polygon points="5 3 19 12 5 21 5 3" data-astro-cid-wwes6yjo></polygon></svg> </div> </div> <!-- Rating row --> <div class="rating-row" id="ratingRow" style="display:none" data-astro-cid-wwes6yjo> <div id="starsEl" style="display:flex;gap:2px" data-astro-cid-wwes6yjo></div> <span class="rating-score" id="ratingScore" data-astro-cid-wwes6yjo></span> <span class="rating-count" id="ratingCount" data-astro-cid-wwes6yjo></span> </div> <!-- Name row --> <div class="name-row" data-astro-cid-wwes6yjo> <span id="trainerName" class="trainer-name" data-astro-cid-wwes6yjo> - </span> <span id="verifiedIcon" class="verified-badge" style="display:none" data-astro-cid-wwes6yjo> <svg viewBox="0 0 24 24" fill="white" data-astro-cid-wwes6yjo><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" data-astro-cid-wwes6yjo></path></svg> </span> </div> <!-- Title --> <div id="trainerTitle" class="trainer-title" data-astro-cid-wwes6yjo> - </div> <!-- Badge row --> <div class="badge-row" data-astro-cid-wwes6yjo> <span id="repsNum" class="reps-num" style="display:none" data-astro-cid-wwes6yjo></span> <span id="repsBadge" class="reps-badge" style="display:none" data-astro-cid-wwes6yjo> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-astro-cid-wwes6yjo><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" data-astro-cid-wwes6yjo></path></svg>
REPs UAE Verified
</span> <span id="pendingBadge" class="reps-badge pending-badge" style="display:none" data-astro-cid-wwes6yjo>
⏳ Verification Pending
</span> </div> <!-- Stats --> <div class="stats-pill" id="statsPill" data-astro-cid-wwes6yjo> <div class="stat-item" data-astro-cid-wwes6yjo> <div class="stat-val" id="sYrs" data-astro-cid-wwes6yjo> - </div> <div class="stat-lbl" data-astro-cid-wwes6yjo>Yrs Exp</div> </div> <div class="stat-item" data-astro-cid-wwes6yjo> <div class="stat-val" id="sClients" data-astro-cid-wwes6yjo> - </div> <div class="stat-lbl" data-astro-cid-wwes6yjo>Clients</div> </div> <div class="stat-item" data-astro-cid-wwes6yjo> <div class="stat-val" id="sSessions" data-astro-cid-wwes6yjo> - </div> <div class="stat-lbl" data-astro-cid-wwes6yjo>Sessions</div> </div> <div class="stat-item" data-astro-cid-wwes6yjo> <div class="stat-val accept" id="sAccept" data-astro-cid-wwes6yjo>✓</div> <div class="stat-lbl" data-astro-cid-wwes6yjo>Accepting</div> </div> </div> <!-- Training modes --> <div class="modes-row" id="modesRow" data-astro-cid-wwes6yjo></div> <!-- Gym tag --> <div id="gymTag" class="gym-tag" style="display:none" data-astro-cid-wwes6yjo> <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-wwes6yjo><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" data-astro-cid-wwes6yjo></path></svg> <span id="gymName" data-astro-cid-wwes6yjo></span> </div> </div> <!-- CTAs --> <div id="ctas" data-astro-cid-wwes6yjo> <div class="btn-wa-wrap" data-astro-cid-wwes6yjo> <a id="waBtn" href="#" class="btn-wa" style="display:none" data-astro-cid-wwes6yjo> <svg viewBox="0 0 24 24" fill="currentColor" data-astro-cid-wwes6yjo><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" data-astro-cid-wwes6yjo></path></svg>
WhatsApp Me
</a> </div> <button id="bookBtn" class="btn-book" onclick="openLead()" data-astro-cid-wwes6yjo> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><rect x="3" y="4" width="18" height="18" rx="2" data-astro-cid-wwes6yjo></rect><line x1="16" y1="2" x2="16" y2="6" data-astro-cid-wwes6yjo></line><line x1="8" y1="2" x2="8" y2="6" data-astro-cid-wwes6yjo></line><line x1="3" y1="10" x2="21" y2="10" data-astro-cid-wwes6yjo></line></svg> <span data-i18n="profile.book" data-astro-cid-wwes6yjo>Book a Session</span> </button> <div class="action-grid" data-astro-cid-wwes6yjo> <button class="btn-action" onclick="scrollToPackages()" data-astro-cid-wwes6yjo> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><rect x="2" y="3" width="20" height="14" rx="2" data-astro-cid-wwes6yjo></rect><line x1="8" y1="21" x2="16" y2="21" data-astro-cid-wwes6yjo></line><line x1="12" y1="17" x2="12" y2="21" data-astro-cid-wwes6yjo></line></svg>
Packages
</button> <button class="btn-action" onclick="scrollToAssess()" data-astro-cid-wwes6yjo> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><path d="M9 11l3 3L22 4" data-astro-cid-wwes6yjo></path><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" data-astro-cid-wwes6yjo></path></svg>
Free Assessment
</button> </div> <button class="btn-save" onclick="saveContact()" data-astro-cid-wwes6yjo> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" data-astro-cid-wwes6yjo></path><circle cx="12" cy="7" r="4" data-astro-cid-wwes6yjo></circle></svg> <span data-i18n="profile.contact" data-astro-cid-wwes6yjo>Save My Contact</span> </button> </div> <!-- Socials (desktop: below CTAs in left col) --> <div id="socials-desktop" style="display:none;gap:10px;padding:0 0 20px;flex-wrap:wrap" data-astro-cid-wwes6yjo></div> </div><!-- /left-col --> <!-- Right column (sections) --> <div id="right-col" data-astro-cid-wwes6yjo> <!-- Sections --> <div id="sections" data-astro-cid-wwes6yjo> <!-- Training Philosophy --> <div class="sec-card" id="philosophyCard" style="display:none" data-astro-cid-wwes6yjo> <div class="sec-header" onclick="toggleSec('philosophyBody',this)" data-astro-cid-wwes6yjo> <span class="sec-title" data-astro-cid-wwes6yjo>My Training Philosophy</span> <svg class="sec-arrow open" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><polyline points="6 9 12 15 18 9" data-astro-cid-wwes6yjo></polyline></svg> </div> <div id="philosophyBody" class="sec-body open" data-astro-cid-wwes6yjo> <div id="philosophyContent" data-astro-cid-wwes6yjo></div> </div> </div> <!-- Bio --> <div class="sec-card" id="bioCard" style="display:none" data-astro-cid-wwes6yjo> <div class="sec-header" onclick="toggleSec('bioBody',this)" data-astro-cid-wwes6yjo> <span class="sec-title" data-astro-cid-wwes6yjo>About</span> <svg class="sec-arrow open" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><polyline points="6 9 12 15 18 9" data-astro-cid-wwes6yjo></polyline></svg> </div> <div id="bioBody" class="sec-body open" data-astro-cid-wwes6yjo> <p id="bioText" class="bio-text" data-astro-cid-wwes6yjo></p> <div id="specTags" class="tag-row" style="margin-top:12px" data-astro-cid-wwes6yjo></div> <div id="certTags" class="tag-row" style="margin-top:8px" data-astro-cid-wwes6yjo></div> </div> </div> <!-- Packages --> <div class="sec-card" id="pkgsCard" style="display:none" data-astro-cid-wwes6yjo> <div class="sec-header" onclick="toggleSec('pkgsBody',this)" data-astro-cid-wwes6yjo> <span class="sec-title" data-astro-cid-wwes6yjo>Training Packages</span> <svg class="sec-arrow open" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><polyline points="6 9 12 15 18 9" data-astro-cid-wwes6yjo></polyline></svg> </div> <div id="pkgsBody" class="sec-body open" data-astro-cid-wwes6yjo> <div id="pkgList" class="pkg-list" data-astro-cid-wwes6yjo></div> </div> </div> <!-- Assessment --> <div class="sec-card" data-astro-cid-wwes6yjo> <div class="sec-header" onclick="toggleSec('assessBody',this)" data-astro-cid-wwes6yjo> <span class="sec-title" data-astro-cid-wwes6yjo>Free Fitness Assessment</span> <svg class="sec-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><polyline points="6 9 12 15 18 9" data-astro-cid-wwes6yjo></polyline></svg> </div> <div id="assessBody" class="sec-body" data-astro-cid-wwes6yjo> <p class="assess-intro" data-astro-cid-wwes6yjo>Get your personalised fitness score, BMI, and a recommended training plan in 30 seconds.</p> <div class="assess-form" data-astro-cid-wwes6yjo> <div class="assess-row" data-astro-cid-wwes6yjo> <div class="assess-field" data-astro-cid-wwes6yjo> <label data-astro-cid-wwes6yjo>Age</label> <input type="number" id="aAge" placeholder="28" min="16" max="80" data-astro-cid-wwes6yjo> </div> <div class="assess-field" data-astro-cid-wwes6yjo> <label data-astro-cid-wwes6yjo>Gender</label> <select id="aGender" data-astro-cid-wwes6yjo> <option value="male" data-astro-cid-wwes6yjo>Male</option> <option value="female" data-astro-cid-wwes6yjo>Female</option> </select> </div> </div> <div class="assess-row" data-astro-cid-wwes6yjo> <div class="assess-field" data-astro-cid-wwes6yjo> <label data-astro-cid-wwes6yjo>Height (cm)</label> <input type="number" id="aHeight" placeholder="175" min="140" max="220" data-astro-cid-wwes6yjo> </div> <div class="assess-field" data-astro-cid-wwes6yjo> <label data-astro-cid-wwes6yjo>Weight (kg)</label> <input type="number" id="aWeight" placeholder="75" min="40" max="200" data-astro-cid-wwes6yjo> </div> </div> <div class="assess-field" data-astro-cid-wwes6yjo> <label data-astro-cid-wwes6yjo>Goal</label> <select id="aGoal" data-astro-cid-wwes6yjo> <option value="fat_loss" data-astro-cid-wwes6yjo>Fat Loss</option> <option value="muscle_gain" data-astro-cid-wwes6yjo>Muscle Gain</option> <option value="endurance" data-astro-cid-wwes6yjo>Endurance</option> <option value="general" data-astro-cid-wwes6yjo>General Fitness</option> </select> </div> <div class="assess-field" data-astro-cid-wwes6yjo> <label data-astro-cid-wwes6yjo>Activity Level</label> <select id="aActivity" data-astro-cid-wwes6yjo> <option value="sedentary" data-astro-cid-wwes6yjo>Sedentary (desk job)</option> <option value="light" data-astro-cid-wwes6yjo>Light (1-2x/week)</option> <option value="moderate" selected data-astro-cid-wwes6yjo>Moderate (3-4x/week)</option> <option value="active" data-astro-cid-wwes6yjo>Active (5+x/week)</option> </select> </div> <button class="btn-assess" onclick="runAssessment()" data-astro-cid-wwes6yjo>Get My Free Assessment →</button> <div id="assessResult" class="assess-result" data-astro-cid-wwes6yjo></div> </div> </div> </div> <!-- Transformations --> <div class="sec-card" id="transformsCard" style="display:none" data-astro-cid-wwes6yjo> <div class="sec-header" onclick="toggleSec('transformsBody',this)" data-astro-cid-wwes6yjo> <span class="sec-title" data-astro-cid-wwes6yjo>Client Transformations</span> <svg class="sec-arrow open" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><polyline points="6 9 12 15 18 9" data-astro-cid-wwes6yjo></polyline></svg> </div> <div id="transformsBody" class="sec-body open" data-astro-cid-wwes6yjo> <div id="transformsGrid" class="transforms-grid" data-astro-cid-wwes6yjo></div> </div> </div> <!-- Reviews --> <div class="sec-card" id="reviewsCard" style="display:none" data-astro-cid-wwes6yjo> <div class="sec-header" onclick="toggleSec('reviewsBody',this)" data-astro-cid-wwes6yjo> <span class="sec-title" data-astro-cid-wwes6yjo>Client Reviews</span> <svg class="sec-arrow open" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><polyline points="6 9 12 15 18 9" data-astro-cid-wwes6yjo></polyline></svg> </div> <div id="reviewsBody" class="sec-body open" data-astro-cid-wwes6yjo> <div id="reviewsContent" data-astro-cid-wwes6yjo></div> <!-- Write a Review form --> <div id="writeReviewSection" style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.07);display:none" data-astro-cid-wwes6yjo> <button id="writeReviewToggle" onclick="document.getElementById('writeReviewForm').style.display=document.getElementById('writeReviewForm').style.display==='none'?'block':'none'" style="cursor:pointer;display:inline-flex;align-items:center;gap:8px;padding:8px 16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:8px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.8);transition:all 0.18s" data-astro-cid-wwes6yjo> <span style="font-size:15px" data-astro-cid-wwes6yjo>&#9998;</span> Write a Review
</button> <div id="writeReviewForm" style="display:none;margin-top:12px" data-astro-cid-wwes6yjo> <div style="margin-bottom:12px" data-astro-cid-wwes6yjo> <label style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:6px" data-astro-cid-wwes6yjo>Your Name</label> <input id="rvName" type="text" placeholder="e.g. James M." maxlength="60" style="width:100%;padding:10px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#fff;font-size:14px;outline:none" data-astro-cid-wwes6yjo> </div> <div style="margin-bottom:12px" data-astro-cid-wwes6yjo> <label style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:6px" data-astro-cid-wwes6yjo>Rating</label> <div id="starPicker" style="display:flex;gap:6px" data-astro-cid-wwes6yjo> <span data-v="1" onclick="setRating(1)" style="font-size:28px;color:rgba(255,255,255,0.2);cursor:pointer" data-astro-cid-wwes6yjo>&#9733;</span> <span data-v="2" onclick="setRating(2)" style="font-size:28px;color:rgba(255,255,255,0.2);cursor:pointer" data-astro-cid-wwes6yjo>&#9733;</span> <span data-v="3" onclick="setRating(3)" style="font-size:28px;color:rgba(255,255,255,0.2);cursor:pointer" data-astro-cid-wwes6yjo>&#9733;</span> <span data-v="4" onclick="setRating(4)" style="font-size:28px;color:rgba(255,255,255,0.2);cursor:pointer" data-astro-cid-wwes6yjo>&#9733;</span> <span data-v="5" onclick="setRating(5)" style="font-size:28px;color:rgba(255,255,255,0.2);cursor:pointer" data-astro-cid-wwes6yjo>&#9733;</span> </div> </div> <div style="margin-bottom:12px" data-astro-cid-wwes6yjo> <label style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:6px" data-astro-cid-wwes6yjo>Your Review</label> <textarea id="rvText" rows="4" placeholder="Share your experience with this trainer..." maxlength="600" style="width:100%;padding:10px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#fff;font-size:14px;outline:none;resize:vertical" data-astro-cid-wwes6yjo></textarea> </div> <div style="margin-bottom:16px" data-astro-cid-wwes6yjo> <label style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:6px" data-astro-cid-wwes6yjo>Goal Achieved (optional)</label> <input id="rvGoal" type="text" placeholder="e.g. Lost 8kg in 10 weeks" maxlength="80" style="width:100%;padding:10px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#fff;font-size:14px;outline:none" data-astro-cid-wwes6yjo> </div> <button onclick="submitReview()" style="padding:11px 24px;background:var(--orange);color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;width:100%;transition:opacity 0.18s" id="rvSubmitBtn" data-astro-cid-wwes6yjo>Submit Review</button> <div id="rvMsg" style="margin-top:10px;font-size:13px;display:none" data-astro-cid-wwes6yjo></div> </div> </div> </div> </div> <!-- Affiliate Vault / Trainer's Stack --> <div class="sec-card" id="affiliateCard" style="display:none" data-astro-cid-wwes6yjo> <div class="sec-header" onclick="toggleSec('affiliateBody',this)" data-astro-cid-wwes6yjo> <span class="sec-title" data-astro-cid-wwes6yjo>Trainer's Stack</span> <svg class="sec-arrow open" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><polyline points="6 9 12 15 18 9" data-astro-cid-wwes6yjo></polyline></svg> </div> <div id="affiliateBody" class="sec-body open" data-astro-cid-wwes6yjo> <div class="affiliate-editorial-intro" data-astro-cid-wwes6yjo> <strong data-astro-cid-wwes6yjo>What I actually use.</strong> These are the products, supplements, and gear I personally train with and recommend to my clients - with exclusive discount codes.
</div> <div id="affiliateList" class="affiliate-list" data-astro-cid-wwes6yjo></div> </div> </div> <!-- Gallery --> <div class="sec-card" id="galleryCard" style="display:none" data-astro-cid-wwes6yjo> <div class="sec-header" onclick="toggleSec('galleryBody',this)" data-astro-cid-wwes6yjo> <span class="sec-title" data-astro-cid-wwes6yjo>Gallery</span> <svg class="sec-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><polyline points="6 9 12 15 18 9" data-astro-cid-wwes6yjo></polyline></svg> </div> <div id="galleryBody" class="sec-body" data-astro-cid-wwes6yjo> <div id="galleryGrid" class="gallery-grid" data-astro-cid-wwes6yjo></div> </div> </div> </div> <!-- Socials (mobile: below sections) --> <div id="socials" style="display:flex;gap:10px;padding:0 20px 20px;flex-wrap:wrap" data-astro-cid-wwes6yjo></div> <!-- Nearby Trainers - Strava-style discovery --> <div id="nearbySection" style="display:none;padding:0 20px 20px;" data-astro-cid-wwes6yjo> <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.35);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;" data-astro-cid-wwes6yjo>Also in this gym</div> <div id="nearbyList" style="display:flex;flex-direction:column;gap:10px;" data-astro-cid-wwes6yjo></div> <a href="/find" style="display:block;text-align:center;margin-top:14px;font-size:12px;color:var(--orange);text-decoration:none;font-weight:600;" data-astro-cid-wwes6yjo>Browse all trainers →</a> </div> <div class="powered" data-astro-cid-wwes6yjo>Powered by <a href="/" id="powered-by-link" data-astro-cid-wwes6yjo>TrainedBy</a> · <a href="/find" style="color:var(--orange)" data-astro-cid-wwes6yjo>Find a Trainer</a></div> </div><!-- /right-col --> </div>  <div id="videoModal" data-astro-cid-wwes6yjo> <button class="video-close" onclick="closeVideoModal()" data-astro-cid-wwes6yjo>×</button> <video id="introVideo" controls playsinline data-astro-cid-wwes6yjo></video> </div>  <div id="leadModal" onclick="if(event.target===this)closeLead()" data-astro-cid-wwes6yjo> <div class="modal-sheet" style="position:relative" data-astro-cid-wwes6yjo> <div class="modal-handle" data-astro-cid-wwes6yjo></div> <div class="modal-title" data-astro-cid-wwes6yjo>Book a Session</div> <div id="modalSub" class="modal-sub" data-astro-cid-wwes6yjo>Send your details and the trainer will reach out within 24 hours.</div> <div class="modal-field" data-astro-cid-wwes6yjo> <label data-astro-cid-wwes6yjo>Your Name</label> <input type="text" id="leadName" placeholder="Ahmed Al Rashidi" data-astro-cid-wwes6yjo> </div> <div class="modal-field" data-astro-cid-wwes6yjo> <label data-astro-cid-wwes6yjo>WhatsApp Number</label> <input type="tel" id="leadPhone" placeholder="+971 50 000 0000" data-astro-cid-wwes6yjo> </div> <div class="modal-field" data-astro-cid-wwes6yjo> <label data-astro-cid-wwes6yjo>Message (optional)</label> <input type="text" id="leadMsg" placeholder="I'm interested in the Monthly Pack" data-astro-cid-wwes6yjo> </div> <button class="btn-modal-submit" onclick="submitLead()" data-astro-cid-wwes6yjo>Send Request →</button> </div> </div> <script>
const SUPABASE_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo';

let TRAINER = null;
const IS_DESKTOP = window.matchMedia('(min-width: 768px)').matches;

function getSlug() {
  const path = location.pathname.replace(/^\\//, '').trim();
  if (path && path !== 'index.html') return path;
  const q = new URLSearchParams(location.search);
  return q.get('trainer') || q.get('slug') || '';
}

async function loadTrainer() {
  const slug = getSlug();
  if (!slug) { showErr(); return; }
  try {
    const r = await fetch(\`\${SUPABASE_URL}/functions/v1/get-trainer?slug=\${encodeURIComponent(slug)}\`, {
      headers: { 'Authorization': \`Bearer \${SUPABASE_KEY}\`, 'apikey': SUPABASE_KEY }
    });
    if (!r.ok) { showErr(); return; }
    const data = await r.json();
    if (!data || data.error) { showErr(); return; }
    const trainer = data.trainer || data;
    trainer.packages = data.packages || data.session_packages || trainer.packages || [];
    TRAINER = trainer;
    render(trainer);
  } catch(e) {
    showErr();
  }
}

function render(t) {
  // Page title
  document.title = \`\${t.name} - \${t.title || 'Personal Trainer'} | \${window.__BRAND__?.name || 'TrainedBy'}\`;

  // OG meta
  const ogTitle = document.querySelector('meta[property="og:title"]') || Object.assign(document.createElement('meta'), {property:'og:title'});
  ogTitle.content = document.title;
  document.head.appendChild(ogTitle);

  // ── schema.org JSON-LD (Person + LocalBusiness) ──────────────────────────
  const profileUrl = window.location.origin + '/' + (t.slug || '');
  const schemaLd = {
    '@context': 'https://schema.org',
    '@type': ['Person', 'LocalBusiness'],
    name: t.name,
    jobTitle: t.title || 'Personal Trainer',
    description: t.bio || '',
    url: profileUrl,
    image: t.avatar_url || t.photo_url || '',
    telephone: t.phone || undefined,
    address: t.city ? {
      '@type': 'PostalAddress',
      addressLocality: t.city,
      addressCountry: (t.market || 'ae').toUpperCase(),
    } : undefined,
    knowsAbout: Array.isArray(t.specialties) ? t.specialties : [],
    hasCredential: t.reps_verified ? [{
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Professional Certification',
      recognizedBy: { '@type': 'Organization', name: 'REPs UAE' },
    }] : undefined,
    aggregateRating: t.review_count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: t.avg_rating || 5,
      reviewCount: t.review_count,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    priceRange: t.session_packages?.length > 0 ? '££' : undefined,
    sameAs: [t.instagram ? \`https://instagram.com/\${t.instagram.replace('@','')}\` : null].filter(Boolean),
  };
  // Remove undefined fields
  const cleanSchema = JSON.parse(JSON.stringify(schemaLd));
  let ldScript = document.querySelector('script[data-profile-ld]');
  if (!ldScript) {
    ldScript = document.createElement('script');
    ldScript.type = 'application/ld+json';
    ldScript.setAttribute('data-profile-ld', '1');
    document.head.appendChild(ldScript);
  }
  ldScript.textContent = JSON.stringify(cleanSchema);

  // Background - use trainer cover or avatar or default gym
  const bgPhoto = t.cover_url || t.photo_url || t.avatar_url;
  if (bgPhoto) {
    document.getElementById('bg').style.backgroundImage = \`url('\${bgPhoto}')\`;
  }

  // Avatar
  const avatarSrc = t.avatar_url || t.photo_url || t.cover_url;
  if (avatarSrc) {
    const img = document.getElementById('avatarImg');
    img.src = avatarSrc;
    img.alt = t.name;
    img.style.display = 'block';
    document.getElementById('avatarInitials').style.display = 'none';
  } else {
    const initials = (t.name || '').split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
    document.getElementById('avatarInitials').textContent = initials;
  }

  // Rating row - only show if we have real verified reviews (loaded later)
  // We defer this to loadReviews()

  // Video intro badge
  if (t.video_intro_url) {
    document.getElementById('videoBadge').style.display = 'flex';
    document.getElementById('introVideo').src = t.video_intro_url;
  }

  // Training modes
  const modes = t.training_modes || (t.offers_online && t.offers_in_person ? ['in-person','online'] : t.offers_online ? ['online'] : ['in-person']);
  const modesRow = document.getElementById('modesRow');
  const modeLabels = {'in-person':'In-Person','online':'Online','hybrid':'Hybrid'};
  (Array.isArray(modes) ? modes : [modes]).forEach(m => {
    const tag = document.createElement('span');
    tag.className = \`mode-tag \${m}\`;
    tag.textContent = modeLabels[m] || m;
    modesRow.appendChild(tag);
  });

  // Name
  document.getElementById('trainerName').textContent = t.name || t.full_name || '';

  // Verified - check both reps_verified and verification_status
  if (t.reps_verified || t.verification_status === 'verified') {
    document.getElementById('verifiedIcon').style.display = 'flex';
    document.getElementById('repsBadge').style.display = 'flex';
    if (t.reps_number) {
      const rn = document.getElementById('repsNum');
      rn.textContent = \`REPs #\${t.reps_number}\`;
      rn.style.display = 'inline';
    }
  } else if (t.verification_status === 'pending') {
    document.getElementById('pendingBadge').style.display = 'inline-flex';
  }

  // Title
  const titleParts = [t.title, t.city || t.location].filter(Boolean);
  document.getElementById('trainerTitle').textContent = titleParts.join(' · ') || 'Personal Trainer · Dubai';

  // Stats
  const yrs = t.years_experience;
  document.getElementById('sYrs').textContent = yrs ? \`\${yrs}\` : '--';
  const cli = t.clients_trained;
  document.getElementById('sClients').textContent = cli ? \`\${cli}+\` : '--';
  const sess = t.sessions_delivered;
  document.getElementById('sSessions').textContent = sess ? (sess >= 1000 ? \`\${(sess/1000).toFixed(1)}k\` : sess) : '--';
  if (!yrs && !cli && !sess) document.getElementById('statsPill').style.opacity = '0.4';
  const acc = t.accepting_clients !== false;
  document.getElementById('sAccept').textContent = acc ? '✓' : '✗';
  document.getElementById('sAccept').style.color = acc ? 'var(--green)' : 'var(--white-60)';

  // Gym / location tags
  const gymLabel = t.gym_name || (t.locations && t.locations.length ? t.locations.map(l=>l.charAt(0).toUpperCase()+l.slice(1)).join(' & ') : null);
  if (gymLabel) {
    document.getElementById('gymName').textContent = gymLabel;
    document.getElementById('gymTag').style.display = 'inline-flex';
  }

  // WhatsApp - always show
  const waBtn = document.getElementById('waBtn');
  if (t.whatsapp) {
    const wn = t.whatsapp.replace(/\\D/g, '');
    waBtn.href = \`https://wa.me/\${wn}?text=Hi%20\${encodeURIComponent(t.name)}%2C%20I%20found%20your%20profile%20on%20' + encodeURIComponent(window.__BRAND__?.name || 'TrainedBy') + '\`;
    waBtn.style.display = 'flex';
  } else {
    waBtn.href = '#';
    waBtn.onclick = (e) => { e.preventDefault(); openLead(); };
    waBtn.style.display = 'flex';
    waBtn.querySelector('svg').style.display = 'none';
    waBtn.childNodes[waBtn.childNodes.length-1].textContent = ' Contact Me';
  }

  // Training Philosophy
  const philosophy = t.training_philosophy || t.philosophy || null;
  if (philosophy) {
    document.getElementById('philosophyCard').style.display = 'block';
    document.getElementById('philosophyContent').innerHTML = \`
      <div class="philosophy-block">
        <div class="philosophy-quote">\${philosophy}</div>
        <div class="philosophy-author"> -  \${t.name || 'Trainer'}</div>
      </div>\`;
  }

  // Trust Module - group all trust signals into one visual block
  const trustContainer = document.createElement('div');
  trustContainer.className = 'trust-module';
  trustContainer.id = 'trustModule';
  if (t.reps_verified || t.verification_status === 'verified') {
    trustContainer.innerHTML += \`<span class="trust-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>REPs UAE Verified</span>\`;
  }
  if (t.years_experience && t.years_experience >= 3) {
    trustContainer.innerHTML += \`<span class="trust-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>\${t.years_experience}+ Years Experience</span>\`;
  }
  if (t.clients_trained && t.clients_trained >= 20) {
    trustContainer.innerHTML += \`<span class="trust-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>\${t.clients_trained}+ Clients</span>\`;
  }
  if (t.accepting_clients !== false) {
    trustContainer.innerHTML += \`<span class="trust-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Accepting Clients</span>\`;
  }
  if (trustContainer.children.length > 0) {
    // Insert trust module before the sections div
    const sectionsDiv = document.getElementById('sections');
    sectionsDiv.parentNode.insertBefore(trustContainer, sectionsDiv);
  }

  // Bio
  if (t.bio) {
    document.getElementById('bioText').textContent = t.bio;
    document.getElementById('bioCard').style.display = 'block';
    (t.specialties || []).forEach(s => {
      const el = document.createElement('span');
      el.className = 'tag'; el.textContent = s;
      document.getElementById('specTags').appendChild(el);
    });
    (t.certifications || []).forEach(c => {
      const el = document.createElement('span');
      el.className = 'tag cert-tag'; el.textContent = c;
      document.getElementById('certTags').appendChild(el);
    });
  }

  // Packages
  const pkgs = t.packages || t.session_packages || [];
  if (pkgs.length) {
    document.getElementById('pkgsCard').style.display = 'block';
    const icons = [
      \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M6.5 6.5h11M6.5 17.5h11M4 12h16"/><circle cx="4" cy="6.5" r="1.5"/><circle cx="4" cy="17.5" r="1.5"/><circle cx="20" cy="6.5" r="1.5"/><circle cx="20" cy="17.5" r="1.5"/></svg>\`,
      \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>\`,
      \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>\`,
      \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>\`,
      \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>\`,
      \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><circle cx="12" cy="5" r="3"/><path d="M6.5 8a2 2 0 00-1.905 1.46L2 17h20l-2.595-7.54A2 2 0 0017.5 8h-11z"/><path d="M8.5 17v4M15.5 17v4"/></svg>\`
    ];
    pkgs.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'pkg-card' + (p.is_popular ? ' featured' : '');
      card.onclick = () => openLead(p.name);
      const sessCount = p.sessions_count || p.sessions || 1;
      const outcome = p.dream_outcome || p.outcome || null;
      const guarantee = p.guarantee_text || p.guarantee || null;
      const bonuses = p.bonuses ? (Array.isArray(p.bonuses) ? p.bonuses : [p.bonuses]) : [];
      const timeline = p.timeline_weeks ? \`\${p.timeline_weeks}-week programme\` : \`\${sessCount} session\${sessCount>1?'s':''}\`;
      card.innerHTML = \`
        <div class="pkg-top">
          <div class="pkg-left">
            <div class="pkg-icon">\${icons[i % icons.length]}</div>
            <div>
              <div class="pkg-name">\${p.name || p.title || ''}\${p.is_popular ? '<span class="pkg-badge">Popular</span>' : ''}</div>
              <div class="pkg-sessions">\${timeline}</div>
            </div>
          </div>
          <div class="pkg-right">
            <div class="pkg-price">AED \${(p.price||p.price_aed||0).toLocaleString()}</div>
            <div class="pkg-unit">per pack</div>
          </div>
        </div>
        \${outcome ? \`<div class="pkg-outcome"><div class="pkg-outcome-label">You'll achieve</div>\${outcome}</div>\` : ''}
        \${guarantee ? \`<div class="pkg-guarantee"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l7.59-7.59L18 9l-8 8z"/></svg>\${guarantee}</div>\` : ''}
        \${bonuses.length ? \`<div class="pkg-bonuses">\${bonuses.map(b=>\`<span class="pkg-bonus-tag">+ \${b}</span>\`).join('')}</div>\` : ''}
        <div class="pkg-cta-row">
          <span class="pkg-cta-text">Tap to enquire</span>
          <button class="pkg-cta-btn">Book Now →</button>
        </div>\`;
      document.getElementById('pkgList').appendChild(card);
    });
  }

  // Affiliate Vault / Trainer's Stack
  const affiliates = t.affiliate_links || t.affiliate_vault || t.trainer_stack || [];
  if (affiliates.length) {
    document.getElementById('affiliateCard').style.display = 'block';
    const catEmoji = {
      'meal_plan':'🥗','supplement':'💊','apparel':'👕','equipment':'🏋️',
      'nutrition':'🥗','clothing':'👕','gear':'🏋️','wellness':'🧘'
    };
    affiliates.forEach(a => {
      const item = document.createElement('a');
      item.className = 'affiliate-item';
      item.href = a.url || a.affiliate_url || '#';
      item.target = '_blank';
      item.rel = 'noopener noreferrer';
      const emoji = catEmoji[a.category?.toLowerCase()] || '🔗';
      item.innerHTML = \`
        <div class="affiliate-logo">\${a.logo_url ? \`<img src="\${a.logo_url}" alt="\${a.brand}">\` : emoji}</div>
        <div>
          <div class="affiliate-name">\${a.brand || a.name || ''}</div>
          <div class="affiliate-cat">\${a.category || 'Recommended'}</div>
        </div>
        \${a.discount_code ? \`<span class="affiliate-discount">\${a.discount_code}</span>\` : ''}
        <svg class="affiliate-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>\`;
      document.getElementById('affiliateList').appendChild(item);
    });
  }

  // Gallery - hero image first, then grid
  const gallery = t.gallery_urls || t.gallery || [];
  if (gallery.length) {
    document.getElementById('galleryCard').style.display = 'block';
    // Open gallery section by default
    const galleryBody = document.getElementById('galleryBody');
    galleryBody.classList.add('open');
    const galleryArrow = document.querySelector('#galleryCard .sec-arrow');
    if (galleryArrow) galleryArrow.classList.add('open');
    // Hero image (first photo)
    const heroDiv = document.createElement('div');
    heroDiv.className = 'gallery-hero';
    heroDiv.innerHTML = \`<img src="\${gallery[0]}" alt="\${t.name || 'Trainer'} gallery" loading="lazy"><div class="gallery-hero-label">Latest</div>\`;
    document.getElementById('galleryGrid').parentNode.insertBefore(heroDiv, document.getElementById('galleryGrid'));
    // Remaining images in grid
    gallery.slice(1, 10).forEach((url, idx) => {
      const div = document.createElement('div');
      div.className = 'gallery-img';
      div.innerHTML = \`<img src="\${url}" alt="Gallery \${idx+2}" loading="lazy">\`;
      document.getElementById('galleryGrid').appendChild(div);
    });
  }

  // Socials - on desktop show in left col, on mobile show below sections
  const socialLinks = [];
  if (t.instagram) {
    socialLinks.push(\`<a class="tag cert-tag" href="https://instagram.com/\${t.instagram.replace('@','')}" target="_blank" rel="noopener" style="text-decoration:none;display:inline-flex;align-items:center;gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>\${t.instagram}</a>\`);
  }
  if (t.tiktok) {
    socialLinks.push(\`<a class="tag cert-tag" href="https://tiktok.com/@\${t.tiktok.replace('@','')}" target="_blank" rel="noopener" style="text-decoration:none;display:inline-flex;align-items:center;gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.05a8.16 8.16 0 004.77 1.52V7.13a4.85 4.85 0 01-1-.44z"/></svg>@\${t.tiktok.replace('@','')}</a>\`);
  }
  if (socialLinks.length) {
    const html = socialLinks.join('');
    if (IS_DESKTOP) {
      const sd = document.getElementById('socials-desktop');
      sd.innerHTML = html;
      sd.style.display = 'flex';
    } else {
      const sm = document.getElementById('socials');
      sm.innerHTML = html;
      sm.style.display = 'flex';
    }
  }

  // Add no-photo class to avatar if no image
  if (!(t.avatar_url || t.photo_url || t.cover_url)) {
    document.querySelector('.avatar-inner').classList.add('no-photo');
  }

  // Show page
  document.getElementById('loading').style.display = 'none';
  document.getElementById('page').style.display = IS_DESKTOP ? 'flex' : 'flex';

  // Load reviews, transformations, and nearby trainers
  if (t.id) {
    window.__TRAINER_ID__ = t.id; // stored for review submission
    loadReviews(t.id);
    loadTransformations(t.id);
    loadNearbyTrainers(t);
  }

  // Track view
  trackView(t.id);
}

async function loadReviews(trainerId) {
  try {
    const r = await fetch(\`\${SUPABASE_URL}/rest/v1/reviews?trainer_id=eq.\${trainerId}&verified=eq.true&order=created_at.desc&limit=8\`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': \`Bearer \${SUPABASE_KEY}\` }
    });
    const reviews = await r.json();

    // Always show the reviews card - either with real reviews or an honest empty state
    document.getElementById('reviewsCard').style.display = 'block';

    if (!Array.isArray(reviews) || reviews.length === 0) {
      // Honest empty state - no fake reviews
      document.getElementById('reviewsContent').innerHTML = \`
        <div class="reviews-empty">
          <div class="reviews-empty-icon">⭐</div>
          <div class="reviews-empty-title">No reviews yet</div>
          <div class="reviews-empty-sub">This trainer is new to our platform. Be the first to train with them and leave a review after your session.</div>
        </div>\`;
      return;
    }

    // Show real verified reviews
    const avg = reviews.reduce((a,b) => a+b.rating, 0) / reviews.length;

    // Update the rating row in hero with real data
    document.getElementById('ratingRow').style.display = 'flex';
    document.getElementById('ratingScore').textContent = avg.toFixed(1);
    document.getElementById('ratingCount').textContent = \`(\${reviews.length} review\${reviews.length>1?'s':''})\`;
    const starsEl = document.getElementById('starsEl');
    starsEl.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const s = document.createElement('span');
      s.textContent = '★';
      s.className = i <= Math.round(avg) ? 'star-filled' : 'star-empty';
      starsEl.appendChild(s);
    }

    let starsHtml = '';
    for (let i=1;i<=5;i++) starsHtml += \`<span style="color:\${i<=Math.round(avg)?'var(--orange)':'rgba(255,255,255,0.2)'};font-size:14px">★</span>\`;
    let html = \`<div class="reviews-summary"><div class="reviews-big">\${avg.toFixed(1)}</div><div class="reviews-meta"><div class="reviews-stars">\${starsHtml}</div><div class="reviews-count">\${reviews.length} verified review\${reviews.length>1?'s':''}</div></div></div>\`;
    reviews.forEach(rv => {
      let rvStars = '';
      for (let i=1;i<=5;i++) rvStars += \`<span style="color:\${i<=rv.rating?'var(--orange)':'rgba(255,255,255,0.2)'};font-size:12px">★</span>\`;
      html += \`<div class="review-card"><div class="review-header"><div class="review-av">\${(rv.client_name||'?').substring(0,2).toUpperCase()}</div><div><div class="review-name">\${rv.client_name||'Client'}</div><div class="review-verified">✓ Verified</div></div><div class="review-stars-sm">\${rvStars}</div></div><div class="review-text">\${rv.review_text||''}</div>\${rv.goal_achieved?\`<div class="review-achievement">🎯 \${rv.goal_achieved}</div>\`:''}</div>\`;
    });
    document.getElementById('reviewsContent').innerHTML = html;
  } catch(e) {
    // On error, show empty state rather than nothing
    document.getElementById('reviewsCard').style.display = 'block';
    document.getElementById('reviewsContent').innerHTML = \`
      <div class="reviews-empty">
        <div class="reviews-empty-icon">⭐</div>
        <div class="reviews-empty-title">No reviews yet</div>
        <div class="reviews-empty-sub">Be the first to train with this trainer and leave a review after your session.</div>
      </div>\`;
  } finally {
    // Always show the write-a-review section once the card is visible
    const ws = document.getElementById('writeReviewSection');
    if (ws) ws.style.display = 'block';
  }
}

// ── Review submission ────────────────────────────────────────────────────────
let _selectedRating = 0;
function setRating(v) {
  _selectedRating = v;
  const stars = document.querySelectorAll('#starPicker span');
  stars.forEach((s, i) => {
    s.style.color = i < v ? '#FF5C00' : 'rgba(255,255,255,0.2)';
  });
}

async function submitReview() {
  const name = (document.getElementById('rvName').value || '').trim();
  const text = (document.getElementById('rvText').value || '').trim();
  const goal = (document.getElementById('rvGoal').value || '').trim();
  const msg = document.getElementById('rvMsg');
  const btn = document.getElementById('rvSubmitBtn');

  if (!name) { showRvMsg('Please enter your name.', '#ff5555'); return; }
  if (!_selectedRating) { showRvMsg('Please select a star rating.', '#ff5555'); return; }
  if (text.length < 10) { showRvMsg('Please write at least 10 characters.', '#ff5555'); return; }

  btn.disabled = true;
  btn.textContent = 'Submitting...';

  try {
    const trainerId = window.__TRAINER_ID__;
    const payload = {
      trainer_id: trainerId,
      client_name: name,
      client_avatar_initials: name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(),
      rating: _selectedRating,
      review_text: text,
      goal_achieved: goal || null,
      verified: false, // pending moderation
      featured: false,
    };
    const r = await fetch(\`\${SUPABASE_URL}/rest/v1/reviews\`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': \`Bearer \${SUPABASE_KEY}\`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(payload),
    });
    if (r.ok || r.status === 201) {
      showRvMsg('Thank you! Your review has been submitted and will appear once verified.', '#22c55e');
      document.getElementById('writeReviewForm').style.display = 'none';
      document.getElementById('writeReviewToggle').style.display = 'none';
    } else {
      const err = await r.text();
      showRvMsg('Something went wrong. Please try again.', '#ff5555');
      console.error('Review submission error:', err);
    }
  } catch(e) {
    showRvMsg('Network error. Please check your connection and try again.', '#ff5555');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Submit Review';
  }
}

function showRvMsg(text, color) {
  const el = document.getElementById('rvMsg');
  el.textContent = text;
  el.style.color = color;
  el.style.display = 'block';
}

async function loadTransformations(trainerId) {
  try {
    const r = await fetch(\`\${SUPABASE_URL}/rest/v1/transformations?trainer_id=eq.\${trainerId}&client_consent=eq.true&order=display_order.asc&limit=6\`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': \`Bearer \${SUPABASE_KEY}\` }
    });
    const transforms = await r.json();
    if (!Array.isArray(transforms) || !transforms.length) return;
    document.getElementById('transformsCard').style.display = 'block';
    const grid = document.getElementById('transformsGrid');
    transforms.forEach(tr => {
      const card = document.createElement('div');
      card.className = 'transform-card';
      card.innerHTML = \`<div class="transform-imgs"><img src="\${tr.before_url}" class="transform-img" loading="lazy"><img src="\${tr.after_url}" class="transform-img" loading="lazy"></div><div class="transform-labels"><span class="t-before">BEFORE</span><span class="t-after">AFTER</span></div>\${tr.duration_weeks?\`<div class="transform-meta">\${tr.duration_weeks}w · \${(tr.goal_type||'').replace('-',' ')}</div>\`:''}\`;
      grid.appendChild(card);
    });
  } catch(e) {}
}

async function loadNearbyTrainers(trainer) {
  // Strava-style: show other trainers at the same gym or in the same city
  try {
    const gym = trainer.gym_name || '';
    const city = trainer.city || trainer.location || 'Dubai';
    let url = \`\${SUPABASE_URL}/rest/v1/trainers?id=neq.\${trainer.id}&accepting_clients=eq.true&order=created_at.desc&limit=3\`;
    if (gym) url += \`&gym_name=eq.\${encodeURIComponent(gym)}\`;
    else url += \`&city=eq.\${encodeURIComponent(city)}\`;
    const r = await fetch(url, { headers: { 'apikey': SUPABASE_KEY, 'Authorization': \`Bearer \${SUPABASE_KEY}\` } });
    const trainers = await r.json();
    if (!Array.isArray(trainers) || !trainers.length) return;
    document.getElementById('nearbySection').style.display = 'block';
    const list = document.getElementById('nearbyList');
    trainers.forEach(t => {
      const initials = (t.name||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
      const avatarHtml = t.avatar_url || t.photo_url
        ? \`<img src="\${t.avatar_url||t.photo_url}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,92,0,0.3);" alt="\${t.name}">\`
        : \`<div style="width:40px;height:40px;border-radius:50%;background:var(--surface-3);border:2px solid rgba(255,92,0,0.3);display:flex;align-items:center;justify-content:center;font-family:'Manrope',sans-serif;font-weight:800;font-size:13px;color:var(--orange);">\${initials}</div>\`;
      const specs = (t.specialties||[]).slice(0,2).join(' · ');
      const item = document.createElement('a');
      item.href = \`/\${t.slug}\`;
      item.style.cssText = 'display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:12px;text-decoration:none;color:inherit;transition:border-color 0.2s;';
      item.onmouseenter = () => item.style.borderColor = 'rgba(255,92,0,0.25)';
      item.onmouseleave = () => item.style.borderColor = 'rgba(255,255,255,0.07)';
      item.innerHTML = \`\${avatarHtml}<div style="flex:1;min-width:0;"><div style="font-family:'Manrope',sans-serif;font-weight:700;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${t.name||''}</div><div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${specs||t.title||'Personal Trainer'}</div></div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>\`;
      list.appendChild(item);
    });
  } catch(e) {}
}

function openVideoModal() {
  document.getElementById('videoModal').classList.add('open');
  document.getElementById('introVideo').play();
}
function closeVideoModal() {
  document.getElementById('videoModal').classList.remove('open');
  document.getElementById('introVideo').pause();
}

function showErr() {
  document.getElementById('loading').style.display = 'none';
  const e = document.getElementById('err');
  e.style.display = 'flex';
}

function toggleSec(id, header) {
  const body = document.getElementById(id);
  const arrow = header.querySelector('.sec-arrow');
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  body.style.display = isOpen ? 'none' : 'block';
  arrow.classList.toggle('open', !isOpen);
}

function scrollToPackages() {
  document.getElementById('pkgsCard')?.scrollIntoView({behavior:'smooth', block:'start'});
}
function scrollToAssess() {
  document.getElementById('assessBody').style.display = 'block';
  document.getElementById('assessBody').classList.add('open');
  document.querySelector('#assessBody').closest('.sec-card').scrollIntoView({behavior:'smooth', block:'start'});
}

function openLead(pkgName) {
  if (pkgName) document.getElementById('leadMsg').value = \`I'm interested in the \${pkgName}\`;
  document.getElementById('leadModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLead() {
  document.getElementById('leadModal').classList.remove('open');
  document.body.style.overflow = '';
}

async function submitLead() {
  const name = document.getElementById('leadName').value.trim();
  const phone = document.getElementById('leadPhone').value.trim();
  const msg = document.getElementById('leadMsg').value.trim();
  if (!name || !phone) { alert('Please enter your name and WhatsApp number.'); return; }
  const btn = document.querySelector('.btn-modal-submit');
  btn.textContent = 'Sending…'; btn.disabled = true;
  try {
    await fetch(\`\${SUPABASE_URL}/functions/v1/submit-lead\`, {
      method: 'POST',
      headers: { 'Authorization': \`Bearer \${SUPABASE_KEY}\`, 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainer_id: TRAINER?.id, name, phone, message: msg, source: 'profile' })
    });
    document.getElementById('modalSub').textContent = '✅ Request sent! The trainer will contact you shortly.';
    btn.textContent = 'Done'; btn.style.background = 'var(--green)';
    setTimeout(closeLead, 2000);
  } catch(e) {
    btn.textContent = 'Send Request →'; btn.disabled = false;
    alert('Something went wrong. Please try WhatsApp instead.');
  }
}

function runAssessment() {
  const age = parseInt(document.getElementById('aAge').value);
  const gender = document.getElementById('aGender').value;
  const height = parseFloat(document.getElementById('aHeight').value);
  const weight = parseFloat(document.getElementById('aWeight').value);
  const goal = document.getElementById('aGoal').value;
  const activity = document.getElementById('aActivity').value;
  if (!age || !height || !weight) { alert('Please fill in all fields.'); return; }

  const bmi = weight / ((height/100) ** 2);
  const bmiCat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy Weight' : bmi < 30 ? 'Overweight' : 'Obese';
  const actMult = {sedentary:1.2, light:1.375, moderate:1.55, active:1.725}[activity] || 1.55;
  const bmr = gender === 'male' ? 10*weight + 6.25*height - 5*age + 5 : 10*weight + 6.25*height - 5*age - 161;
  const tdee = Math.round(bmr * actMult);
  const goalMap = {fat_loss:'Fat Loss - aim for a 300-500 kcal daily deficit', muscle_gain:'Muscle Gain - aim for a 200-300 kcal daily surplus', endurance:'Endurance - focus on zone 2 cardio + mobility', general:'General Fitness - balanced strength + cardio split'};
  const sessMap = {fat_loss:'4-5x/week (3 strength + 2 cardio)', muscle_gain:'4x/week progressive overload', endurance:'5x/week (3 cardio + 2 strength)', general:'3-4x/week full-body'};

  const result = document.getElementById('assessResult');
  result.style.display = 'block';
  result.innerHTML = \`
    <div style="font-weight:800;font-size:15px;margin-bottom:10px">Your Assessment Results</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
      <div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:10px;text-align:center">
        <div style="font-size:20px;font-weight:800;color:var(--orange)">\${bmi.toFixed(1)}</div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.06em;color:var(--white-60);margin-top:2px">BMI · \${bmiCat}</div>
      </div>
      <div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:10px;text-align:center">
        <div style="font-size:20px;font-weight:800;color:var(--orange)">\${tdee.toLocaleString()}</div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.06em;color:var(--white-60);margin-top:2px">Daily Calories</div>
      </div>
    </div>
    <div style="font-size:13px;line-height:1.7;color:var(--white-60)">
      <strong style="color:var(--white)">Goal:</strong> \${goalMap[goal]}<br>
      <strong style="color:var(--white)">Recommended:</strong> \${sessMap[goal]}<br><br>
      <span style="color:var(--orange);font-weight:600">Book a session with \${TRAINER?.name?.split(' ')[0] || 'this trainer'} to get a fully personalised plan →</span>
    </div>\`;
  result.scrollIntoView({behavior:'smooth', block:'nearest'});
}

function shareProfile() {
  if (navigator.share) {
    navigator.share({ title: document.title, url: location.href });
  } else {
    navigator.clipboard.writeText(location.href).then(() => alert('Link copied!'));
  }
}

function saveContact() {
  if (!TRAINER) return;
  const vcard = \`BEGIN:VCARD\\nVERSION:3.0\\nFN:\${TRAINER.name}\\nTITLE:\${TRAINER.title || 'Personal Trainer'}\\nTEL:\${TRAINER.whatsapp || ''}\\nURL:\${location.href}\\nNOTE:Verified Personal Trainer on ' + (window.__BRAND__?.name || 'TrainedBy') + '\\nEND:VCARD\`;
  const blob = new Blob([vcard], {type:'text/vcard'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = \`\${TRAINER.name.replace(/\\s+/g,'-')}.vcf\`;
  a.click();
}

async function trackView(trainerId) {
  if (!trainerId) return;
  try {
    await fetch(\`\${SUPABASE_URL}/functions/v1/get-trainer\`, {
      method: 'POST',
      headers: { 'Authorization': \`Bearer \${SUPABASE_KEY}\`, 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainer_id: trainerId, event: 'profile_view' })
    });
  } catch(e) {}
}

loadTrainer();
<\/script> `], ["   ", `<div id="loading" data-astro-cid-wwes6yjo> <div class="sk-logo" data-astro-cid-wwes6yjo>TRAINEDBY</div> <div class="sk-spinner" data-astro-cid-wwes6yjo></div> </div>  <div id="err" data-astro-cid-wwes6yjo> <div class="err-icon" data-astro-cid-wwes6yjo>🔍</div> <div class="err-title" data-astro-cid-wwes6yjo>Trainer not found</div> <div class="err-sub" data-astro-cid-wwes6yjo>This profile doesn't exist or the link may be incorrect.</div> <a href="/" style="margin-top:12px;color:var(--orange);font-weight:600;font-size:14px" data-astro-cid-wwes6yjo>Browse Trainers →</a> </div>  <div id="pending" data-astro-cid-wwes6yjo> <div style="width:72px;height:72px;border-radius:50%;background:rgba(251,191,36,0.15);border:1px solid rgba(251,191,36,0.3);display:flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:8px" data-astro-cid-wwes6yjo>⏳</div> <div style="font-size:20px;font-weight:800" data-astro-cid-wwes6yjo>Verification in Progress</div> <div style="font-size:14px;color:var(--white-60);line-height:1.6;max-width:280px" data-astro-cid-wwes6yjo>This trainer's REPs UAE credentials are being verified. Check back shortly.</div> </div>  <div id="bg" data-astro-cid-wwes6yjo></div>  <div id="topbar" data-astro-cid-wwes6yjo> <a href="/" class="tb-logo" id="site-logo" data-astro-cid-wwes6yjo>TrainedBy</a> `, ` <div style="display:flex;align-items:center;gap:8px" data-astro-cid-wwes6yjo> <div class="tb-share" onclick="shareProfile()" title="Share" data-astro-cid-wwes6yjo> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" data-astro-cid-wwes6yjo></path><polyline points="16 6 12 2 8 6" data-astro-cid-wwes6yjo></polyline><line x1="12" y1="2" x2="12" y2="15" data-astro-cid-wwes6yjo></line></svg> </div> <a href="/join" class="tb-cta" data-astro-cid-wwes6yjo>Get Your Page</a> </div> </div>  <div id="page" style="display:none" data-astro-cid-wwes6yjo> <!-- Left column wrapper (desktop) / inline (mobile) --> <div id="left-col" data-astro-cid-wwes6yjo> <!-- Hero --> <div id="hero" data-astro-cid-wwes6yjo> <!-- Avatar --> <div class="avatar-wrap" style="position:relative" data-astro-cid-wwes6yjo> <div class="avatar-ring" data-astro-cid-wwes6yjo></div> <div class="avatar-inner" data-astro-cid-wwes6yjo> <img id="avatarImg" src="" alt="" style="display:none" data-astro-cid-wwes6yjo> <div id="avatarInitials" class="avatar-initials" data-astro-cid-wwes6yjo></div> </div> <div class="avatar-video-btn" id="videoBadge" style="display:none" onclick="openVideoModal()" data-astro-cid-wwes6yjo> <svg width="10" height="10" viewBox="0 0 24 24" fill="white" data-astro-cid-wwes6yjo><polygon points="5 3 19 12 5 21 5 3" data-astro-cid-wwes6yjo></polygon></svg> </div> </div> <!-- Rating row --> <div class="rating-row" id="ratingRow" style="display:none" data-astro-cid-wwes6yjo> <div id="starsEl" style="display:flex;gap:2px" data-astro-cid-wwes6yjo></div> <span class="rating-score" id="ratingScore" data-astro-cid-wwes6yjo></span> <span class="rating-count" id="ratingCount" data-astro-cid-wwes6yjo></span> </div> <!-- Name row --> <div class="name-row" data-astro-cid-wwes6yjo> <span id="trainerName" class="trainer-name" data-astro-cid-wwes6yjo> - </span> <span id="verifiedIcon" class="verified-badge" style="display:none" data-astro-cid-wwes6yjo> <svg viewBox="0 0 24 24" fill="white" data-astro-cid-wwes6yjo><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" data-astro-cid-wwes6yjo></path></svg> </span> </div> <!-- Title --> <div id="trainerTitle" class="trainer-title" data-astro-cid-wwes6yjo> - </div> <!-- Badge row --> <div class="badge-row" data-astro-cid-wwes6yjo> <span id="repsNum" class="reps-num" style="display:none" data-astro-cid-wwes6yjo></span> <span id="repsBadge" class="reps-badge" style="display:none" data-astro-cid-wwes6yjo> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-astro-cid-wwes6yjo><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" data-astro-cid-wwes6yjo></path></svg>
REPs UAE Verified
</span> <span id="pendingBadge" class="reps-badge pending-badge" style="display:none" data-astro-cid-wwes6yjo>
⏳ Verification Pending
</span> </div> <!-- Stats --> <div class="stats-pill" id="statsPill" data-astro-cid-wwes6yjo> <div class="stat-item" data-astro-cid-wwes6yjo> <div class="stat-val" id="sYrs" data-astro-cid-wwes6yjo> - </div> <div class="stat-lbl" data-astro-cid-wwes6yjo>Yrs Exp</div> </div> <div class="stat-item" data-astro-cid-wwes6yjo> <div class="stat-val" id="sClients" data-astro-cid-wwes6yjo> - </div> <div class="stat-lbl" data-astro-cid-wwes6yjo>Clients</div> </div> <div class="stat-item" data-astro-cid-wwes6yjo> <div class="stat-val" id="sSessions" data-astro-cid-wwes6yjo> - </div> <div class="stat-lbl" data-astro-cid-wwes6yjo>Sessions</div> </div> <div class="stat-item" data-astro-cid-wwes6yjo> <div class="stat-val accept" id="sAccept" data-astro-cid-wwes6yjo>✓</div> <div class="stat-lbl" data-astro-cid-wwes6yjo>Accepting</div> </div> </div> <!-- Training modes --> <div class="modes-row" id="modesRow" data-astro-cid-wwes6yjo></div> <!-- Gym tag --> <div id="gymTag" class="gym-tag" style="display:none" data-astro-cid-wwes6yjo> <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-wwes6yjo><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" data-astro-cid-wwes6yjo></path></svg> <span id="gymName" data-astro-cid-wwes6yjo></span> </div> </div> <!-- CTAs --> <div id="ctas" data-astro-cid-wwes6yjo> <div class="btn-wa-wrap" data-astro-cid-wwes6yjo> <a id="waBtn" href="#" class="btn-wa" style="display:none" data-astro-cid-wwes6yjo> <svg viewBox="0 0 24 24" fill="currentColor" data-astro-cid-wwes6yjo><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" data-astro-cid-wwes6yjo></path></svg>
WhatsApp Me
</a> </div> <button id="bookBtn" class="btn-book" onclick="openLead()" data-astro-cid-wwes6yjo> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><rect x="3" y="4" width="18" height="18" rx="2" data-astro-cid-wwes6yjo></rect><line x1="16" y1="2" x2="16" y2="6" data-astro-cid-wwes6yjo></line><line x1="8" y1="2" x2="8" y2="6" data-astro-cid-wwes6yjo></line><line x1="3" y1="10" x2="21" y2="10" data-astro-cid-wwes6yjo></line></svg> <span data-i18n="profile.book" data-astro-cid-wwes6yjo>Book a Session</span> </button> <div class="action-grid" data-astro-cid-wwes6yjo> <button class="btn-action" onclick="scrollToPackages()" data-astro-cid-wwes6yjo> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><rect x="2" y="3" width="20" height="14" rx="2" data-astro-cid-wwes6yjo></rect><line x1="8" y1="21" x2="16" y2="21" data-astro-cid-wwes6yjo></line><line x1="12" y1="17" x2="12" y2="21" data-astro-cid-wwes6yjo></line></svg>
Packages
</button> <button class="btn-action" onclick="scrollToAssess()" data-astro-cid-wwes6yjo> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><path d="M9 11l3 3L22 4" data-astro-cid-wwes6yjo></path><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" data-astro-cid-wwes6yjo></path></svg>
Free Assessment
</button> </div> <button class="btn-save" onclick="saveContact()" data-astro-cid-wwes6yjo> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" data-astro-cid-wwes6yjo></path><circle cx="12" cy="7" r="4" data-astro-cid-wwes6yjo></circle></svg> <span data-i18n="profile.contact" data-astro-cid-wwes6yjo>Save My Contact</span> </button> </div> <!-- Socials (desktop: below CTAs in left col) --> <div id="socials-desktop" style="display:none;gap:10px;padding:0 0 20px;flex-wrap:wrap" data-astro-cid-wwes6yjo></div> </div><!-- /left-col --> <!-- Right column (sections) --> <div id="right-col" data-astro-cid-wwes6yjo> <!-- Sections --> <div id="sections" data-astro-cid-wwes6yjo> <!-- Training Philosophy --> <div class="sec-card" id="philosophyCard" style="display:none" data-astro-cid-wwes6yjo> <div class="sec-header" onclick="toggleSec('philosophyBody',this)" data-astro-cid-wwes6yjo> <span class="sec-title" data-astro-cid-wwes6yjo>My Training Philosophy</span> <svg class="sec-arrow open" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><polyline points="6 9 12 15 18 9" data-astro-cid-wwes6yjo></polyline></svg> </div> <div id="philosophyBody" class="sec-body open" data-astro-cid-wwes6yjo> <div id="philosophyContent" data-astro-cid-wwes6yjo></div> </div> </div> <!-- Bio --> <div class="sec-card" id="bioCard" style="display:none" data-astro-cid-wwes6yjo> <div class="sec-header" onclick="toggleSec('bioBody',this)" data-astro-cid-wwes6yjo> <span class="sec-title" data-astro-cid-wwes6yjo>About</span> <svg class="sec-arrow open" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><polyline points="6 9 12 15 18 9" data-astro-cid-wwes6yjo></polyline></svg> </div> <div id="bioBody" class="sec-body open" data-astro-cid-wwes6yjo> <p id="bioText" class="bio-text" data-astro-cid-wwes6yjo></p> <div id="specTags" class="tag-row" style="margin-top:12px" data-astro-cid-wwes6yjo></div> <div id="certTags" class="tag-row" style="margin-top:8px" data-astro-cid-wwes6yjo></div> </div> </div> <!-- Packages --> <div class="sec-card" id="pkgsCard" style="display:none" data-astro-cid-wwes6yjo> <div class="sec-header" onclick="toggleSec('pkgsBody',this)" data-astro-cid-wwes6yjo> <span class="sec-title" data-astro-cid-wwes6yjo>Training Packages</span> <svg class="sec-arrow open" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><polyline points="6 9 12 15 18 9" data-astro-cid-wwes6yjo></polyline></svg> </div> <div id="pkgsBody" class="sec-body open" data-astro-cid-wwes6yjo> <div id="pkgList" class="pkg-list" data-astro-cid-wwes6yjo></div> </div> </div> <!-- Assessment --> <div class="sec-card" data-astro-cid-wwes6yjo> <div class="sec-header" onclick="toggleSec('assessBody',this)" data-astro-cid-wwes6yjo> <span class="sec-title" data-astro-cid-wwes6yjo>Free Fitness Assessment</span> <svg class="sec-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><polyline points="6 9 12 15 18 9" data-astro-cid-wwes6yjo></polyline></svg> </div> <div id="assessBody" class="sec-body" data-astro-cid-wwes6yjo> <p class="assess-intro" data-astro-cid-wwes6yjo>Get your personalised fitness score, BMI, and a recommended training plan in 30 seconds.</p> <div class="assess-form" data-astro-cid-wwes6yjo> <div class="assess-row" data-astro-cid-wwes6yjo> <div class="assess-field" data-astro-cid-wwes6yjo> <label data-astro-cid-wwes6yjo>Age</label> <input type="number" id="aAge" placeholder="28" min="16" max="80" data-astro-cid-wwes6yjo> </div> <div class="assess-field" data-astro-cid-wwes6yjo> <label data-astro-cid-wwes6yjo>Gender</label> <select id="aGender" data-astro-cid-wwes6yjo> <option value="male" data-astro-cid-wwes6yjo>Male</option> <option value="female" data-astro-cid-wwes6yjo>Female</option> </select> </div> </div> <div class="assess-row" data-astro-cid-wwes6yjo> <div class="assess-field" data-astro-cid-wwes6yjo> <label data-astro-cid-wwes6yjo>Height (cm)</label> <input type="number" id="aHeight" placeholder="175" min="140" max="220" data-astro-cid-wwes6yjo> </div> <div class="assess-field" data-astro-cid-wwes6yjo> <label data-astro-cid-wwes6yjo>Weight (kg)</label> <input type="number" id="aWeight" placeholder="75" min="40" max="200" data-astro-cid-wwes6yjo> </div> </div> <div class="assess-field" data-astro-cid-wwes6yjo> <label data-astro-cid-wwes6yjo>Goal</label> <select id="aGoal" data-astro-cid-wwes6yjo> <option value="fat_loss" data-astro-cid-wwes6yjo>Fat Loss</option> <option value="muscle_gain" data-astro-cid-wwes6yjo>Muscle Gain</option> <option value="endurance" data-astro-cid-wwes6yjo>Endurance</option> <option value="general" data-astro-cid-wwes6yjo>General Fitness</option> </select> </div> <div class="assess-field" data-astro-cid-wwes6yjo> <label data-astro-cid-wwes6yjo>Activity Level</label> <select id="aActivity" data-astro-cid-wwes6yjo> <option value="sedentary" data-astro-cid-wwes6yjo>Sedentary (desk job)</option> <option value="light" data-astro-cid-wwes6yjo>Light (1-2x/week)</option> <option value="moderate" selected data-astro-cid-wwes6yjo>Moderate (3-4x/week)</option> <option value="active" data-astro-cid-wwes6yjo>Active (5+x/week)</option> </select> </div> <button class="btn-assess" onclick="runAssessment()" data-astro-cid-wwes6yjo>Get My Free Assessment →</button> <div id="assessResult" class="assess-result" data-astro-cid-wwes6yjo></div> </div> </div> </div> <!-- Transformations --> <div class="sec-card" id="transformsCard" style="display:none" data-astro-cid-wwes6yjo> <div class="sec-header" onclick="toggleSec('transformsBody',this)" data-astro-cid-wwes6yjo> <span class="sec-title" data-astro-cid-wwes6yjo>Client Transformations</span> <svg class="sec-arrow open" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><polyline points="6 9 12 15 18 9" data-astro-cid-wwes6yjo></polyline></svg> </div> <div id="transformsBody" class="sec-body open" data-astro-cid-wwes6yjo> <div id="transformsGrid" class="transforms-grid" data-astro-cid-wwes6yjo></div> </div> </div> <!-- Reviews --> <div class="sec-card" id="reviewsCard" style="display:none" data-astro-cid-wwes6yjo> <div class="sec-header" onclick="toggleSec('reviewsBody',this)" data-astro-cid-wwes6yjo> <span class="sec-title" data-astro-cid-wwes6yjo>Client Reviews</span> <svg class="sec-arrow open" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><polyline points="6 9 12 15 18 9" data-astro-cid-wwes6yjo></polyline></svg> </div> <div id="reviewsBody" class="sec-body open" data-astro-cid-wwes6yjo> <div id="reviewsContent" data-astro-cid-wwes6yjo></div> <!-- Write a Review form --> <div id="writeReviewSection" style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.07);display:none" data-astro-cid-wwes6yjo> <button id="writeReviewToggle" onclick="document.getElementById('writeReviewForm').style.display=document.getElementById('writeReviewForm').style.display==='none'?'block':'none'" style="cursor:pointer;display:inline-flex;align-items:center;gap:8px;padding:8px 16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:8px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.8);transition:all 0.18s" data-astro-cid-wwes6yjo> <span style="font-size:15px" data-astro-cid-wwes6yjo>&#9998;</span> Write a Review
</button> <div id="writeReviewForm" style="display:none;margin-top:12px" data-astro-cid-wwes6yjo> <div style="margin-bottom:12px" data-astro-cid-wwes6yjo> <label style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:6px" data-astro-cid-wwes6yjo>Your Name</label> <input id="rvName" type="text" placeholder="e.g. James M." maxlength="60" style="width:100%;padding:10px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#fff;font-size:14px;outline:none" data-astro-cid-wwes6yjo> </div> <div style="margin-bottom:12px" data-astro-cid-wwes6yjo> <label style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:6px" data-astro-cid-wwes6yjo>Rating</label> <div id="starPicker" style="display:flex;gap:6px" data-astro-cid-wwes6yjo> <span data-v="1" onclick="setRating(1)" style="font-size:28px;color:rgba(255,255,255,0.2);cursor:pointer" data-astro-cid-wwes6yjo>&#9733;</span> <span data-v="2" onclick="setRating(2)" style="font-size:28px;color:rgba(255,255,255,0.2);cursor:pointer" data-astro-cid-wwes6yjo>&#9733;</span> <span data-v="3" onclick="setRating(3)" style="font-size:28px;color:rgba(255,255,255,0.2);cursor:pointer" data-astro-cid-wwes6yjo>&#9733;</span> <span data-v="4" onclick="setRating(4)" style="font-size:28px;color:rgba(255,255,255,0.2);cursor:pointer" data-astro-cid-wwes6yjo>&#9733;</span> <span data-v="5" onclick="setRating(5)" style="font-size:28px;color:rgba(255,255,255,0.2);cursor:pointer" data-astro-cid-wwes6yjo>&#9733;</span> </div> </div> <div style="margin-bottom:12px" data-astro-cid-wwes6yjo> <label style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:6px" data-astro-cid-wwes6yjo>Your Review</label> <textarea id="rvText" rows="4" placeholder="Share your experience with this trainer..." maxlength="600" style="width:100%;padding:10px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#fff;font-size:14px;outline:none;resize:vertical" data-astro-cid-wwes6yjo></textarea> </div> <div style="margin-bottom:16px" data-astro-cid-wwes6yjo> <label style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:6px" data-astro-cid-wwes6yjo>Goal Achieved (optional)</label> <input id="rvGoal" type="text" placeholder="e.g. Lost 8kg in 10 weeks" maxlength="80" style="width:100%;padding:10px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#fff;font-size:14px;outline:none" data-astro-cid-wwes6yjo> </div> <button onclick="submitReview()" style="padding:11px 24px;background:var(--orange);color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;width:100%;transition:opacity 0.18s" id="rvSubmitBtn" data-astro-cid-wwes6yjo>Submit Review</button> <div id="rvMsg" style="margin-top:10px;font-size:13px;display:none" data-astro-cid-wwes6yjo></div> </div> </div> </div> </div> <!-- Affiliate Vault / Trainer's Stack --> <div class="sec-card" id="affiliateCard" style="display:none" data-astro-cid-wwes6yjo> <div class="sec-header" onclick="toggleSec('affiliateBody',this)" data-astro-cid-wwes6yjo> <span class="sec-title" data-astro-cid-wwes6yjo>Trainer's Stack</span> <svg class="sec-arrow open" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><polyline points="6 9 12 15 18 9" data-astro-cid-wwes6yjo></polyline></svg> </div> <div id="affiliateBody" class="sec-body open" data-astro-cid-wwes6yjo> <div class="affiliate-editorial-intro" data-astro-cid-wwes6yjo> <strong data-astro-cid-wwes6yjo>What I actually use.</strong> These are the products, supplements, and gear I personally train with and recommend to my clients - with exclusive discount codes.
</div> <div id="affiliateList" class="affiliate-list" data-astro-cid-wwes6yjo></div> </div> </div> <!-- Gallery --> <div class="sec-card" id="galleryCard" style="display:none" data-astro-cid-wwes6yjo> <div class="sec-header" onclick="toggleSec('galleryBody',this)" data-astro-cid-wwes6yjo> <span class="sec-title" data-astro-cid-wwes6yjo>Gallery</span> <svg class="sec-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-wwes6yjo><polyline points="6 9 12 15 18 9" data-astro-cid-wwes6yjo></polyline></svg> </div> <div id="galleryBody" class="sec-body" data-astro-cid-wwes6yjo> <div id="galleryGrid" class="gallery-grid" data-astro-cid-wwes6yjo></div> </div> </div> </div> <!-- Socials (mobile: below sections) --> <div id="socials" style="display:flex;gap:10px;padding:0 20px 20px;flex-wrap:wrap" data-astro-cid-wwes6yjo></div> <!-- Nearby Trainers - Strava-style discovery --> <div id="nearbySection" style="display:none;padding:0 20px 20px;" data-astro-cid-wwes6yjo> <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.35);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;" data-astro-cid-wwes6yjo>Also in this gym</div> <div id="nearbyList" style="display:flex;flex-direction:column;gap:10px;" data-astro-cid-wwes6yjo></div> <a href="/find" style="display:block;text-align:center;margin-top:14px;font-size:12px;color:var(--orange);text-decoration:none;font-weight:600;" data-astro-cid-wwes6yjo>Browse all trainers →</a> </div> <div class="powered" data-astro-cid-wwes6yjo>Powered by <a href="/" id="powered-by-link" data-astro-cid-wwes6yjo>TrainedBy</a> · <a href="/find" style="color:var(--orange)" data-astro-cid-wwes6yjo>Find a Trainer</a></div> </div><!-- /right-col --> </div>  <div id="videoModal" data-astro-cid-wwes6yjo> <button class="video-close" onclick="closeVideoModal()" data-astro-cid-wwes6yjo>×</button> <video id="introVideo" controls playsinline data-astro-cid-wwes6yjo></video> </div>  <div id="leadModal" onclick="if(event.target===this)closeLead()" data-astro-cid-wwes6yjo> <div class="modal-sheet" style="position:relative" data-astro-cid-wwes6yjo> <div class="modal-handle" data-astro-cid-wwes6yjo></div> <div class="modal-title" data-astro-cid-wwes6yjo>Book a Session</div> <div id="modalSub" class="modal-sub" data-astro-cid-wwes6yjo>Send your details and the trainer will reach out within 24 hours.</div> <div class="modal-field" data-astro-cid-wwes6yjo> <label data-astro-cid-wwes6yjo>Your Name</label> <input type="text" id="leadName" placeholder="Ahmed Al Rashidi" data-astro-cid-wwes6yjo> </div> <div class="modal-field" data-astro-cid-wwes6yjo> <label data-astro-cid-wwes6yjo>WhatsApp Number</label> <input type="tel" id="leadPhone" placeholder="+971 50 000 0000" data-astro-cid-wwes6yjo> </div> <div class="modal-field" data-astro-cid-wwes6yjo> <label data-astro-cid-wwes6yjo>Message (optional)</label> <input type="text" id="leadMsg" placeholder="I'm interested in the Monthly Pack" data-astro-cid-wwes6yjo> </div> <button class="btn-modal-submit" onclick="submitLead()" data-astro-cid-wwes6yjo>Send Request →</button> </div> </div> <script>
const SUPABASE_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo';

let TRAINER = null;
const IS_DESKTOP = window.matchMedia('(min-width: 768px)').matches;

function getSlug() {
  const path = location.pathname.replace(/^\\\\//, '').trim();
  if (path && path !== 'index.html') return path;
  const q = new URLSearchParams(location.search);
  return q.get('trainer') || q.get('slug') || '';
}

async function loadTrainer() {
  const slug = getSlug();
  if (!slug) { showErr(); return; }
  try {
    const r = await fetch(\\\`\\\${SUPABASE_URL}/functions/v1/get-trainer?slug=\\\${encodeURIComponent(slug)}\\\`, {
      headers: { 'Authorization': \\\`Bearer \\\${SUPABASE_KEY}\\\`, 'apikey': SUPABASE_KEY }
    });
    if (!r.ok) { showErr(); return; }
    const data = await r.json();
    if (!data || data.error) { showErr(); return; }
    const trainer = data.trainer || data;
    trainer.packages = data.packages || data.session_packages || trainer.packages || [];
    TRAINER = trainer;
    render(trainer);
  } catch(e) {
    showErr();
  }
}

function render(t) {
  // Page title
  document.title = \\\`\\\${t.name} - \\\${t.title || 'Personal Trainer'} | \\\${window.__BRAND__?.name || 'TrainedBy'}\\\`;

  // OG meta
  const ogTitle = document.querySelector('meta[property="og:title"]') || Object.assign(document.createElement('meta'), {property:'og:title'});
  ogTitle.content = document.title;
  document.head.appendChild(ogTitle);

  // ── schema.org JSON-LD (Person + LocalBusiness) ──────────────────────────
  const profileUrl = window.location.origin + '/' + (t.slug || '');
  const schemaLd = {
    '@context': 'https://schema.org',
    '@type': ['Person', 'LocalBusiness'],
    name: t.name,
    jobTitle: t.title || 'Personal Trainer',
    description: t.bio || '',
    url: profileUrl,
    image: t.avatar_url || t.photo_url || '',
    telephone: t.phone || undefined,
    address: t.city ? {
      '@type': 'PostalAddress',
      addressLocality: t.city,
      addressCountry: (t.market || 'ae').toUpperCase(),
    } : undefined,
    knowsAbout: Array.isArray(t.specialties) ? t.specialties : [],
    hasCredential: t.reps_verified ? [{
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Professional Certification',
      recognizedBy: { '@type': 'Organization', name: 'REPs UAE' },
    }] : undefined,
    aggregateRating: t.review_count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: t.avg_rating || 5,
      reviewCount: t.review_count,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    priceRange: t.session_packages?.length > 0 ? '££' : undefined,
    sameAs: [t.instagram ? \\\`https://instagram.com/\\\${t.instagram.replace('@','')}\\\` : null].filter(Boolean),
  };
  // Remove undefined fields
  const cleanSchema = JSON.parse(JSON.stringify(schemaLd));
  let ldScript = document.querySelector('script[data-profile-ld]');
  if (!ldScript) {
    ldScript = document.createElement('script');
    ldScript.type = 'application/ld+json';
    ldScript.setAttribute('data-profile-ld', '1');
    document.head.appendChild(ldScript);
  }
  ldScript.textContent = JSON.stringify(cleanSchema);

  // Background - use trainer cover or avatar or default gym
  const bgPhoto = t.cover_url || t.photo_url || t.avatar_url;
  if (bgPhoto) {
    document.getElementById('bg').style.backgroundImage = \\\`url('\\\${bgPhoto}')\\\`;
  }

  // Avatar
  const avatarSrc = t.avatar_url || t.photo_url || t.cover_url;
  if (avatarSrc) {
    const img = document.getElementById('avatarImg');
    img.src = avatarSrc;
    img.alt = t.name;
    img.style.display = 'block';
    document.getElementById('avatarInitials').style.display = 'none';
  } else {
    const initials = (t.name || '').split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
    document.getElementById('avatarInitials').textContent = initials;
  }

  // Rating row - only show if we have real verified reviews (loaded later)
  // We defer this to loadReviews()

  // Video intro badge
  if (t.video_intro_url) {
    document.getElementById('videoBadge').style.display = 'flex';
    document.getElementById('introVideo').src = t.video_intro_url;
  }

  // Training modes
  const modes = t.training_modes || (t.offers_online && t.offers_in_person ? ['in-person','online'] : t.offers_online ? ['online'] : ['in-person']);
  const modesRow = document.getElementById('modesRow');
  const modeLabels = {'in-person':'In-Person','online':'Online','hybrid':'Hybrid'};
  (Array.isArray(modes) ? modes : [modes]).forEach(m => {
    const tag = document.createElement('span');
    tag.className = \\\`mode-tag \\\${m}\\\`;
    tag.textContent = modeLabels[m] || m;
    modesRow.appendChild(tag);
  });

  // Name
  document.getElementById('trainerName').textContent = t.name || t.full_name || '';

  // Verified - check both reps_verified and verification_status
  if (t.reps_verified || t.verification_status === 'verified') {
    document.getElementById('verifiedIcon').style.display = 'flex';
    document.getElementById('repsBadge').style.display = 'flex';
    if (t.reps_number) {
      const rn = document.getElementById('repsNum');
      rn.textContent = \\\`REPs #\\\${t.reps_number}\\\`;
      rn.style.display = 'inline';
    }
  } else if (t.verification_status === 'pending') {
    document.getElementById('pendingBadge').style.display = 'inline-flex';
  }

  // Title
  const titleParts = [t.title, t.city || t.location].filter(Boolean);
  document.getElementById('trainerTitle').textContent = titleParts.join(' · ') || 'Personal Trainer · Dubai';

  // Stats
  const yrs = t.years_experience;
  document.getElementById('sYrs').textContent = yrs ? \\\`\\\${yrs}\\\` : '--';
  const cli = t.clients_trained;
  document.getElementById('sClients').textContent = cli ? \\\`\\\${cli}+\\\` : '--';
  const sess = t.sessions_delivered;
  document.getElementById('sSessions').textContent = sess ? (sess >= 1000 ? \\\`\\\${(sess/1000).toFixed(1)}k\\\` : sess) : '--';
  if (!yrs && !cli && !sess) document.getElementById('statsPill').style.opacity = '0.4';
  const acc = t.accepting_clients !== false;
  document.getElementById('sAccept').textContent = acc ? '✓' : '✗';
  document.getElementById('sAccept').style.color = acc ? 'var(--green)' : 'var(--white-60)';

  // Gym / location tags
  const gymLabel = t.gym_name || (t.locations && t.locations.length ? t.locations.map(l=>l.charAt(0).toUpperCase()+l.slice(1)).join(' & ') : null);
  if (gymLabel) {
    document.getElementById('gymName').textContent = gymLabel;
    document.getElementById('gymTag').style.display = 'inline-flex';
  }

  // WhatsApp - always show
  const waBtn = document.getElementById('waBtn');
  if (t.whatsapp) {
    const wn = t.whatsapp.replace(/\\\\D/g, '');
    waBtn.href = \\\`https://wa.me/\\\${wn}?text=Hi%20\\\${encodeURIComponent(t.name)}%2C%20I%20found%20your%20profile%20on%20' + encodeURIComponent(window.__BRAND__?.name || 'TrainedBy') + '\\\`;
    waBtn.style.display = 'flex';
  } else {
    waBtn.href = '#';
    waBtn.onclick = (e) => { e.preventDefault(); openLead(); };
    waBtn.style.display = 'flex';
    waBtn.querySelector('svg').style.display = 'none';
    waBtn.childNodes[waBtn.childNodes.length-1].textContent = ' Contact Me';
  }

  // Training Philosophy
  const philosophy = t.training_philosophy || t.philosophy || null;
  if (philosophy) {
    document.getElementById('philosophyCard').style.display = 'block';
    document.getElementById('philosophyContent').innerHTML = \\\`
      <div class="philosophy-block">
        <div class="philosophy-quote">\\\${philosophy}</div>
        <div class="philosophy-author"> -  \\\${t.name || 'Trainer'}</div>
      </div>\\\`;
  }

  // Trust Module - group all trust signals into one visual block
  const trustContainer = document.createElement('div');
  trustContainer.className = 'trust-module';
  trustContainer.id = 'trustModule';
  if (t.reps_verified || t.verification_status === 'verified') {
    trustContainer.innerHTML += \\\`<span class="trust-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>REPs UAE Verified</span>\\\`;
  }
  if (t.years_experience && t.years_experience >= 3) {
    trustContainer.innerHTML += \\\`<span class="trust-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>\\\${t.years_experience}+ Years Experience</span>\\\`;
  }
  if (t.clients_trained && t.clients_trained >= 20) {
    trustContainer.innerHTML += \\\`<span class="trust-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>\\\${t.clients_trained}+ Clients</span>\\\`;
  }
  if (t.accepting_clients !== false) {
    trustContainer.innerHTML += \\\`<span class="trust-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Accepting Clients</span>\\\`;
  }
  if (trustContainer.children.length > 0) {
    // Insert trust module before the sections div
    const sectionsDiv = document.getElementById('sections');
    sectionsDiv.parentNode.insertBefore(trustContainer, sectionsDiv);
  }

  // Bio
  if (t.bio) {
    document.getElementById('bioText').textContent = t.bio;
    document.getElementById('bioCard').style.display = 'block';
    (t.specialties || []).forEach(s => {
      const el = document.createElement('span');
      el.className = 'tag'; el.textContent = s;
      document.getElementById('specTags').appendChild(el);
    });
    (t.certifications || []).forEach(c => {
      const el = document.createElement('span');
      el.className = 'tag cert-tag'; el.textContent = c;
      document.getElementById('certTags').appendChild(el);
    });
  }

  // Packages
  const pkgs = t.packages || t.session_packages || [];
  if (pkgs.length) {
    document.getElementById('pkgsCard').style.display = 'block';
    const icons = [
      \\\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M6.5 6.5h11M6.5 17.5h11M4 12h16"/><circle cx="4" cy="6.5" r="1.5"/><circle cx="4" cy="17.5" r="1.5"/><circle cx="20" cy="6.5" r="1.5"/><circle cx="20" cy="17.5" r="1.5"/></svg>\\\`,
      \\\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>\\\`,
      \\\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>\\\`,
      \\\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>\\\`,
      \\\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>\\\`,
      \\\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><circle cx="12" cy="5" r="3"/><path d="M6.5 8a2 2 0 00-1.905 1.46L2 17h20l-2.595-7.54A2 2 0 0017.5 8h-11z"/><path d="M8.5 17v4M15.5 17v4"/></svg>\\\`
    ];
    pkgs.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'pkg-card' + (p.is_popular ? ' featured' : '');
      card.onclick = () => openLead(p.name);
      const sessCount = p.sessions_count || p.sessions || 1;
      const outcome = p.dream_outcome || p.outcome || null;
      const guarantee = p.guarantee_text || p.guarantee || null;
      const bonuses = p.bonuses ? (Array.isArray(p.bonuses) ? p.bonuses : [p.bonuses]) : [];
      const timeline = p.timeline_weeks ? \\\`\\\${p.timeline_weeks}-week programme\\\` : \\\`\\\${sessCount} session\\\${sessCount>1?'s':''}\\\`;
      card.innerHTML = \\\`
        <div class="pkg-top">
          <div class="pkg-left">
            <div class="pkg-icon">\\\${icons[i % icons.length]}</div>
            <div>
              <div class="pkg-name">\\\${p.name || p.title || ''}\\\${p.is_popular ? '<span class="pkg-badge">Popular</span>' : ''}</div>
              <div class="pkg-sessions">\\\${timeline}</div>
            </div>
          </div>
          <div class="pkg-right">
            <div class="pkg-price">AED \\\${(p.price||p.price_aed||0).toLocaleString()}</div>
            <div class="pkg-unit">per pack</div>
          </div>
        </div>
        \\\${outcome ? \\\`<div class="pkg-outcome"><div class="pkg-outcome-label">You'll achieve</div>\\\${outcome}</div>\\\` : ''}
        \\\${guarantee ? \\\`<div class="pkg-guarantee"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l7.59-7.59L18 9l-8 8z"/></svg>\\\${guarantee}</div>\\\` : ''}
        \\\${bonuses.length ? \\\`<div class="pkg-bonuses">\\\${bonuses.map(b=>\\\`<span class="pkg-bonus-tag">+ \\\${b}</span>\\\`).join('')}</div>\\\` : ''}
        <div class="pkg-cta-row">
          <span class="pkg-cta-text">Tap to enquire</span>
          <button class="pkg-cta-btn">Book Now →</button>
        </div>\\\`;
      document.getElementById('pkgList').appendChild(card);
    });
  }

  // Affiliate Vault / Trainer's Stack
  const affiliates = t.affiliate_links || t.affiliate_vault || t.trainer_stack || [];
  if (affiliates.length) {
    document.getElementById('affiliateCard').style.display = 'block';
    const catEmoji = {
      'meal_plan':'🥗','supplement':'💊','apparel':'👕','equipment':'🏋️',
      'nutrition':'🥗','clothing':'👕','gear':'🏋️','wellness':'🧘'
    };
    affiliates.forEach(a => {
      const item = document.createElement('a');
      item.className = 'affiliate-item';
      item.href = a.url || a.affiliate_url || '#';
      item.target = '_blank';
      item.rel = 'noopener noreferrer';
      const emoji = catEmoji[a.category?.toLowerCase()] || '🔗';
      item.innerHTML = \\\`
        <div class="affiliate-logo">\\\${a.logo_url ? \\\`<img src="\\\${a.logo_url}" alt="\\\${a.brand}">\\\` : emoji}</div>
        <div>
          <div class="affiliate-name">\\\${a.brand || a.name || ''}</div>
          <div class="affiliate-cat">\\\${a.category || 'Recommended'}</div>
        </div>
        \\\${a.discount_code ? \\\`<span class="affiliate-discount">\\\${a.discount_code}</span>\\\` : ''}
        <svg class="affiliate-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>\\\`;
      document.getElementById('affiliateList').appendChild(item);
    });
  }

  // Gallery - hero image first, then grid
  const gallery = t.gallery_urls || t.gallery || [];
  if (gallery.length) {
    document.getElementById('galleryCard').style.display = 'block';
    // Open gallery section by default
    const galleryBody = document.getElementById('galleryBody');
    galleryBody.classList.add('open');
    const galleryArrow = document.querySelector('#galleryCard .sec-arrow');
    if (galleryArrow) galleryArrow.classList.add('open');
    // Hero image (first photo)
    const heroDiv = document.createElement('div');
    heroDiv.className = 'gallery-hero';
    heroDiv.innerHTML = \\\`<img src="\\\${gallery[0]}" alt="\\\${t.name || 'Trainer'} gallery" loading="lazy"><div class="gallery-hero-label">Latest</div>\\\`;
    document.getElementById('galleryGrid').parentNode.insertBefore(heroDiv, document.getElementById('galleryGrid'));
    // Remaining images in grid
    gallery.slice(1, 10).forEach((url, idx) => {
      const div = document.createElement('div');
      div.className = 'gallery-img';
      div.innerHTML = \\\`<img src="\\\${url}" alt="Gallery \\\${idx+2}" loading="lazy">\\\`;
      document.getElementById('galleryGrid').appendChild(div);
    });
  }

  // Socials - on desktop show in left col, on mobile show below sections
  const socialLinks = [];
  if (t.instagram) {
    socialLinks.push(\\\`<a class="tag cert-tag" href="https://instagram.com/\\\${t.instagram.replace('@','')}" target="_blank" rel="noopener" style="text-decoration:none;display:inline-flex;align-items:center;gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>\\\${t.instagram}</a>\\\`);
  }
  if (t.tiktok) {
    socialLinks.push(\\\`<a class="tag cert-tag" href="https://tiktok.com/@\\\${t.tiktok.replace('@','')}" target="_blank" rel="noopener" style="text-decoration:none;display:inline-flex;align-items:center;gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.05a8.16 8.16 0 004.77 1.52V7.13a4.85 4.85 0 01-1-.44z"/></svg>@\\\${t.tiktok.replace('@','')}</a>\\\`);
  }
  if (socialLinks.length) {
    const html = socialLinks.join('');
    if (IS_DESKTOP) {
      const sd = document.getElementById('socials-desktop');
      sd.innerHTML = html;
      sd.style.display = 'flex';
    } else {
      const sm = document.getElementById('socials');
      sm.innerHTML = html;
      sm.style.display = 'flex';
    }
  }

  // Add no-photo class to avatar if no image
  if (!(t.avatar_url || t.photo_url || t.cover_url)) {
    document.querySelector('.avatar-inner').classList.add('no-photo');
  }

  // Show page
  document.getElementById('loading').style.display = 'none';
  document.getElementById('page').style.display = IS_DESKTOP ? 'flex' : 'flex';

  // Load reviews, transformations, and nearby trainers
  if (t.id) {
    window.__TRAINER_ID__ = t.id; // stored for review submission
    loadReviews(t.id);
    loadTransformations(t.id);
    loadNearbyTrainers(t);
  }

  // Track view
  trackView(t.id);
}

async function loadReviews(trainerId) {
  try {
    const r = await fetch(\\\`\\\${SUPABASE_URL}/rest/v1/reviews?trainer_id=eq.\\\${trainerId}&verified=eq.true&order=created_at.desc&limit=8\\\`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': \\\`Bearer \\\${SUPABASE_KEY}\\\` }
    });
    const reviews = await r.json();

    // Always show the reviews card - either with real reviews or an honest empty state
    document.getElementById('reviewsCard').style.display = 'block';

    if (!Array.isArray(reviews) || reviews.length === 0) {
      // Honest empty state - no fake reviews
      document.getElementById('reviewsContent').innerHTML = \\\`
        <div class="reviews-empty">
          <div class="reviews-empty-icon">⭐</div>
          <div class="reviews-empty-title">No reviews yet</div>
          <div class="reviews-empty-sub">This trainer is new to our platform. Be the first to train with them and leave a review after your session.</div>
        </div>\\\`;
      return;
    }

    // Show real verified reviews
    const avg = reviews.reduce((a,b) => a+b.rating, 0) / reviews.length;

    // Update the rating row in hero with real data
    document.getElementById('ratingRow').style.display = 'flex';
    document.getElementById('ratingScore').textContent = avg.toFixed(1);
    document.getElementById('ratingCount').textContent = \\\`(\\\${reviews.length} review\\\${reviews.length>1?'s':''})\\\`;
    const starsEl = document.getElementById('starsEl');
    starsEl.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const s = document.createElement('span');
      s.textContent = '★';
      s.className = i <= Math.round(avg) ? 'star-filled' : 'star-empty';
      starsEl.appendChild(s);
    }

    let starsHtml = '';
    for (let i=1;i<=5;i++) starsHtml += \\\`<span style="color:\\\${i<=Math.round(avg)?'var(--orange)':'rgba(255,255,255,0.2)'};font-size:14px">★</span>\\\`;
    let html = \\\`<div class="reviews-summary"><div class="reviews-big">\\\${avg.toFixed(1)}</div><div class="reviews-meta"><div class="reviews-stars">\\\${starsHtml}</div><div class="reviews-count">\\\${reviews.length} verified review\\\${reviews.length>1?'s':''}</div></div></div>\\\`;
    reviews.forEach(rv => {
      let rvStars = '';
      for (let i=1;i<=5;i++) rvStars += \\\`<span style="color:\\\${i<=rv.rating?'var(--orange)':'rgba(255,255,255,0.2)'};font-size:12px">★</span>\\\`;
      html += \\\`<div class="review-card"><div class="review-header"><div class="review-av">\\\${(rv.client_name||'?').substring(0,2).toUpperCase()}</div><div><div class="review-name">\\\${rv.client_name||'Client'}</div><div class="review-verified">✓ Verified</div></div><div class="review-stars-sm">\\\${rvStars}</div></div><div class="review-text">\\\${rv.review_text||''}</div>\\\${rv.goal_achieved?\\\`<div class="review-achievement">🎯 \\\${rv.goal_achieved}</div>\\\`:''}</div>\\\`;
    });
    document.getElementById('reviewsContent').innerHTML = html;
  } catch(e) {
    // On error, show empty state rather than nothing
    document.getElementById('reviewsCard').style.display = 'block';
    document.getElementById('reviewsContent').innerHTML = \\\`
      <div class="reviews-empty">
        <div class="reviews-empty-icon">⭐</div>
        <div class="reviews-empty-title">No reviews yet</div>
        <div class="reviews-empty-sub">Be the first to train with this trainer and leave a review after your session.</div>
      </div>\\\`;
  } finally {
    // Always show the write-a-review section once the card is visible
    const ws = document.getElementById('writeReviewSection');
    if (ws) ws.style.display = 'block';
  }
}

// ── Review submission ────────────────────────────────────────────────────────
let _selectedRating = 0;
function setRating(v) {
  _selectedRating = v;
  const stars = document.querySelectorAll('#starPicker span');
  stars.forEach((s, i) => {
    s.style.color = i < v ? '#FF5C00' : 'rgba(255,255,255,0.2)';
  });
}

async function submitReview() {
  const name = (document.getElementById('rvName').value || '').trim();
  const text = (document.getElementById('rvText').value || '').trim();
  const goal = (document.getElementById('rvGoal').value || '').trim();
  const msg = document.getElementById('rvMsg');
  const btn = document.getElementById('rvSubmitBtn');

  if (!name) { showRvMsg('Please enter your name.', '#ff5555'); return; }
  if (!_selectedRating) { showRvMsg('Please select a star rating.', '#ff5555'); return; }
  if (text.length < 10) { showRvMsg('Please write at least 10 characters.', '#ff5555'); return; }

  btn.disabled = true;
  btn.textContent = 'Submitting...';

  try {
    const trainerId = window.__TRAINER_ID__;
    const payload = {
      trainer_id: trainerId,
      client_name: name,
      client_avatar_initials: name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(),
      rating: _selectedRating,
      review_text: text,
      goal_achieved: goal || null,
      verified: false, // pending moderation
      featured: false,
    };
    const r = await fetch(\\\`\\\${SUPABASE_URL}/rest/v1/reviews\\\`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': \\\`Bearer \\\${SUPABASE_KEY}\\\`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(payload),
    });
    if (r.ok || r.status === 201) {
      showRvMsg('Thank you! Your review has been submitted and will appear once verified.', '#22c55e');
      document.getElementById('writeReviewForm').style.display = 'none';
      document.getElementById('writeReviewToggle').style.display = 'none';
    } else {
      const err = await r.text();
      showRvMsg('Something went wrong. Please try again.', '#ff5555');
      console.error('Review submission error:', err);
    }
  } catch(e) {
    showRvMsg('Network error. Please check your connection and try again.', '#ff5555');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Submit Review';
  }
}

function showRvMsg(text, color) {
  const el = document.getElementById('rvMsg');
  el.textContent = text;
  el.style.color = color;
  el.style.display = 'block';
}

async function loadTransformations(trainerId) {
  try {
    const r = await fetch(\\\`\\\${SUPABASE_URL}/rest/v1/transformations?trainer_id=eq.\\\${trainerId}&client_consent=eq.true&order=display_order.asc&limit=6\\\`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': \\\`Bearer \\\${SUPABASE_KEY}\\\` }
    });
    const transforms = await r.json();
    if (!Array.isArray(transforms) || !transforms.length) return;
    document.getElementById('transformsCard').style.display = 'block';
    const grid = document.getElementById('transformsGrid');
    transforms.forEach(tr => {
      const card = document.createElement('div');
      card.className = 'transform-card';
      card.innerHTML = \\\`<div class="transform-imgs"><img src="\\\${tr.before_url}" class="transform-img" loading="lazy"><img src="\\\${tr.after_url}" class="transform-img" loading="lazy"></div><div class="transform-labels"><span class="t-before">BEFORE</span><span class="t-after">AFTER</span></div>\\\${tr.duration_weeks?\\\`<div class="transform-meta">\\\${tr.duration_weeks}w · \\\${(tr.goal_type||'').replace('-',' ')}</div>\\\`:''}\\\`;
      grid.appendChild(card);
    });
  } catch(e) {}
}

async function loadNearbyTrainers(trainer) {
  // Strava-style: show other trainers at the same gym or in the same city
  try {
    const gym = trainer.gym_name || '';
    const city = trainer.city || trainer.location || 'Dubai';
    let url = \\\`\\\${SUPABASE_URL}/rest/v1/trainers?id=neq.\\\${trainer.id}&accepting_clients=eq.true&order=created_at.desc&limit=3\\\`;
    if (gym) url += \\\`&gym_name=eq.\\\${encodeURIComponent(gym)}\\\`;
    else url += \\\`&city=eq.\\\${encodeURIComponent(city)}\\\`;
    const r = await fetch(url, { headers: { 'apikey': SUPABASE_KEY, 'Authorization': \\\`Bearer \\\${SUPABASE_KEY}\\\` } });
    const trainers = await r.json();
    if (!Array.isArray(trainers) || !trainers.length) return;
    document.getElementById('nearbySection').style.display = 'block';
    const list = document.getElementById('nearbyList');
    trainers.forEach(t => {
      const initials = (t.name||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
      const avatarHtml = t.avatar_url || t.photo_url
        ? \\\`<img src="\\\${t.avatar_url||t.photo_url}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,92,0,0.3);" alt="\\\${t.name}">\\\`
        : \\\`<div style="width:40px;height:40px;border-radius:50%;background:var(--surface-3);border:2px solid rgba(255,92,0,0.3);display:flex;align-items:center;justify-content:center;font-family:'Manrope',sans-serif;font-weight:800;font-size:13px;color:var(--orange);">\\\${initials}</div>\\\`;
      const specs = (t.specialties||[]).slice(0,2).join(' · ');
      const item = document.createElement('a');
      item.href = \\\`/\\\${t.slug}\\\`;
      item.style.cssText = 'display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:12px;text-decoration:none;color:inherit;transition:border-color 0.2s;';
      item.onmouseenter = () => item.style.borderColor = 'rgba(255,92,0,0.25)';
      item.onmouseleave = () => item.style.borderColor = 'rgba(255,255,255,0.07)';
      item.innerHTML = \\\`\\\${avatarHtml}<div style="flex:1;min-width:0;"><div style="font-family:'Manrope',sans-serif;font-weight:700;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\\\${t.name||''}</div><div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\\\${specs||t.title||'Personal Trainer'}</div></div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>\\\`;
      list.appendChild(item);
    });
  } catch(e) {}
}

function openVideoModal() {
  document.getElementById('videoModal').classList.add('open');
  document.getElementById('introVideo').play();
}
function closeVideoModal() {
  document.getElementById('videoModal').classList.remove('open');
  document.getElementById('introVideo').pause();
}

function showErr() {
  document.getElementById('loading').style.display = 'none';
  const e = document.getElementById('err');
  e.style.display = 'flex';
}

function toggleSec(id, header) {
  const body = document.getElementById(id);
  const arrow = header.querySelector('.sec-arrow');
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  body.style.display = isOpen ? 'none' : 'block';
  arrow.classList.toggle('open', !isOpen);
}

function scrollToPackages() {
  document.getElementById('pkgsCard')?.scrollIntoView({behavior:'smooth', block:'start'});
}
function scrollToAssess() {
  document.getElementById('assessBody').style.display = 'block';
  document.getElementById('assessBody').classList.add('open');
  document.querySelector('#assessBody').closest('.sec-card').scrollIntoView({behavior:'smooth', block:'start'});
}

function openLead(pkgName) {
  if (pkgName) document.getElementById('leadMsg').value = \\\`I'm interested in the \\\${pkgName}\\\`;
  document.getElementById('leadModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLead() {
  document.getElementById('leadModal').classList.remove('open');
  document.body.style.overflow = '';
}

async function submitLead() {
  const name = document.getElementById('leadName').value.trim();
  const phone = document.getElementById('leadPhone').value.trim();
  const msg = document.getElementById('leadMsg').value.trim();
  if (!name || !phone) { alert('Please enter your name and WhatsApp number.'); return; }
  const btn = document.querySelector('.btn-modal-submit');
  btn.textContent = 'Sending…'; btn.disabled = true;
  try {
    await fetch(\\\`\\\${SUPABASE_URL}/functions/v1/submit-lead\\\`, {
      method: 'POST',
      headers: { 'Authorization': \\\`Bearer \\\${SUPABASE_KEY}\\\`, 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainer_id: TRAINER?.id, name, phone, message: msg, source: 'profile' })
    });
    document.getElementById('modalSub').textContent = '✅ Request sent! The trainer will contact you shortly.';
    btn.textContent = 'Done'; btn.style.background = 'var(--green)';
    setTimeout(closeLead, 2000);
  } catch(e) {
    btn.textContent = 'Send Request →'; btn.disabled = false;
    alert('Something went wrong. Please try WhatsApp instead.');
  }
}

function runAssessment() {
  const age = parseInt(document.getElementById('aAge').value);
  const gender = document.getElementById('aGender').value;
  const height = parseFloat(document.getElementById('aHeight').value);
  const weight = parseFloat(document.getElementById('aWeight').value);
  const goal = document.getElementById('aGoal').value;
  const activity = document.getElementById('aActivity').value;
  if (!age || !height || !weight) { alert('Please fill in all fields.'); return; }

  const bmi = weight / ((height/100) ** 2);
  const bmiCat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy Weight' : bmi < 30 ? 'Overweight' : 'Obese';
  const actMult = {sedentary:1.2, light:1.375, moderate:1.55, active:1.725}[activity] || 1.55;
  const bmr = gender === 'male' ? 10*weight + 6.25*height - 5*age + 5 : 10*weight + 6.25*height - 5*age - 161;
  const tdee = Math.round(bmr * actMult);
  const goalMap = {fat_loss:'Fat Loss - aim for a 300-500 kcal daily deficit', muscle_gain:'Muscle Gain - aim for a 200-300 kcal daily surplus', endurance:'Endurance - focus on zone 2 cardio + mobility', general:'General Fitness - balanced strength + cardio split'};
  const sessMap = {fat_loss:'4-5x/week (3 strength + 2 cardio)', muscle_gain:'4x/week progressive overload', endurance:'5x/week (3 cardio + 2 strength)', general:'3-4x/week full-body'};

  const result = document.getElementById('assessResult');
  result.style.display = 'block';
  result.innerHTML = \\\`
    <div style="font-weight:800;font-size:15px;margin-bottom:10px">Your Assessment Results</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
      <div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:10px;text-align:center">
        <div style="font-size:20px;font-weight:800;color:var(--orange)">\\\${bmi.toFixed(1)}</div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.06em;color:var(--white-60);margin-top:2px">BMI · \\\${bmiCat}</div>
      </div>
      <div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:10px;text-align:center">
        <div style="font-size:20px;font-weight:800;color:var(--orange)">\\\${tdee.toLocaleString()}</div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.06em;color:var(--white-60);margin-top:2px">Daily Calories</div>
      </div>
    </div>
    <div style="font-size:13px;line-height:1.7;color:var(--white-60)">
      <strong style="color:var(--white)">Goal:</strong> \\\${goalMap[goal]}<br>
      <strong style="color:var(--white)">Recommended:</strong> \\\${sessMap[goal]}<br><br>
      <span style="color:var(--orange);font-weight:600">Book a session with \\\${TRAINER?.name?.split(' ')[0] || 'this trainer'} to get a fully personalised plan →</span>
    </div>\\\`;
  result.scrollIntoView({behavior:'smooth', block:'nearest'});
}

function shareProfile() {
  if (navigator.share) {
    navigator.share({ title: document.title, url: location.href });
  } else {
    navigator.clipboard.writeText(location.href).then(() => alert('Link copied!'));
  }
}

function saveContact() {
  if (!TRAINER) return;
  const vcard = \\\`BEGIN:VCARD\\\\nVERSION:3.0\\\\nFN:\\\${TRAINER.name}\\\\nTITLE:\\\${TRAINER.title || 'Personal Trainer'}\\\\nTEL:\\\${TRAINER.whatsapp || ''}\\\\nURL:\\\${location.href}\\\\nNOTE:Verified Personal Trainer on ' + (window.__BRAND__?.name || 'TrainedBy') + '\\\\nEND:VCARD\\\`;
  const blob = new Blob([vcard], {type:'text/vcard'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = \\\`\\\${TRAINER.name.replace(/\\\\s+/g,'-')}.vcf\\\`;
  a.click();
}

async function trackView(trainerId) {
  if (!trainerId) return;
  try {
    await fetch(\\\`\\\${SUPABASE_URL}/functions/v1/get-trainer\\\`, {
      method: 'POST',
      headers: { 'Authorization': \\\`Bearer \\\${SUPABASE_KEY}\\\`, 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainer_id: trainerId, event: 'profile_view' })
    });
  } catch(e) {}
}

loadTrainer();
<\/script> `])), maybeRenderHead(), renderScript($$result2, "/Users/bobanpepic/trainedby/src/pages/profile.astro?astro&type=script&index=0&lang.ts")) })}`;
}, "/Users/bobanpepic/trainedby/src/pages/profile.astro", void 0);

const $$file = "/Users/bobanpepic/trainedby/src/pages/profile.astro";
const $$url = "/profile";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Profile,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
