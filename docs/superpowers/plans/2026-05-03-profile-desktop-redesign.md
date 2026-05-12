# Profile Desktop Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two-column sticky sidebar desktop layout on `profile.astro` with a full-bleed cinematic hero banner + three-column content grid that uses the viewport properly on wide screens.

**Architecture:** CSS-only rework of `src/pages/profile.astro`. HTML restructuring replaces the `#left-col` / `#right-col` wrapper divs with `#profile-hero` (transparent hero banner, 300px, desktop only) and `#profile-grid` (white-background content grid, 3-column on desktop). Mobile layout is untouched — `#profile-hero` and `#profile-grid` collapse to single-column flex on mobile, identical to current behavior.

**Tech Stack:** Astro, vanilla CSS (no new dependencies)

---

## File Map

| File | Change |
|------|--------|
| `src/pages/profile.astro` lines 685–825 | Replace `@media (min-width: 768px)` + `@media (min-width: 1024px)` CSS blocks entirely |
| `src/pages/profile.astro` lines 863–1167 | Restructure HTML: replace `#left-col`/`#right-col` wrappers with `#profile-hero`/`#profile-grid` |

No other files are touched.

---

## Task 1: Restructure HTML

**Files:**
- Modify: `src/pages/profile.astro` (HTML section, lines ~863–1167)

The current structure is:
```html
<div id="page" style="display:none">
  <div id="left-col">
    <div id="hero">...</div>
    <div id="ctas">...</div>
    <div id="socials-desktop" ...></div>
  </div>
  <div id="right-col">
    <div id="sections">
      <!-- sec-cards -->
    </div>
    <div id="socials">...</div>
    <div id="nearbySection">...</div>
    <div class="powered">...</div>
  </div>
</div>
```

Replace with:
```html
<div id="page" style="display:none">

  <!-- Hero banner: transparent on mobile (stacked), full-bleed 300px on desktop -->
  <div id="profile-hero">
    <div id="hero">
      <!-- exact same inner content as before, no changes -->
    </div>
    <div id="ctas">
      <!-- exact same inner content as before, no changes -->
    </div>
  </div>

  <!-- Content grid: single-col on mobile, 3-col on desktop with white bg -->
  <div id="profile-grid">
    <div id="sections">
      <!-- exact same inner content as before, no changes -->
    </div>
    <div id="socials-desktop" style="display:none;gap:10px;padding:0 0 20px;flex-wrap:wrap"></div>
    <div id="socials" style="display:flex;gap:10px;padding:0 20px 20px;flex-wrap:wrap"></div>
    <div id="nearbySection" style="display:none;padding:0 20px 20px;">
      <!-- exact same inner content as before, no changes -->
    </div>
    <div class="powered">Powered by <a href="/" id="powered-by-link">TrainedBy</a> · <a href="/find" style="color:var(--orange)">Find a Trainer</a></div>
  </div>

</div><!-- /page -->
```

- [ ] **Step 1: Open `src/pages/profile.astro` and locate the page HTML block**

  Find `<!-- Main page - two-column on desktop via JS-injected wrappers -->` (around line 863). This marks the start of the HTML to restructure.

- [ ] **Step 2: Replace the outer wrapper structure**

  Replace from `<div id="page" ...>` through `</div><!-- /page -->` (lines 864–1167) with the new structure below. **Keep every single inner element unchanged** — only the wrapper divs change.

  ```html
  <!-- Main page -->
  <div id="page" style="display:none">

    <!-- Hero banner (desktop: full-bleed 300px; mobile: stacked flex column) -->
    <div id="profile-hero">

      <!-- Hero identity -->
      <div id="hero">
        <!-- Avatar -->
        <div class="avatar-wrap" style="position:relative">
          <div class="avatar-ring"></div>
          <div class="avatar-inner">
            <img id="avatarImg" src="" alt="" style="display:none">
            <div id="avatarInitials" class="avatar-initials"></div>
          </div>
          <div class="avatar-video-btn" id="videoBadge" style="display:none" onclick="openVideoModal()">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        </div>

        <!-- Rating row -->
        <div class="rating-row" id="ratingRow" style="display:none">
          <div id="starsEl" style="display:flex;gap:2px"></div>
          <span class="rating-score" id="ratingScore"></span>
          <span class="rating-count" id="ratingCount"></span>
        </div>

        <!-- Name row -->
        <div class="name-row">
          <span id="trainerName" class="trainer-name"> - </span>
          <span id="verifiedIcon" class="verified-badge" style="display:none">
            <svg viewBox="0 0 24 24" fill="white"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </span>
        </div>

        <!-- Title -->
        <div id="trainerTitle" class="trainer-title"> - </div>

        <!-- Badge row -->
        <div class="badge-row">
          <span id="repsNum" class="reps-num" style="display:none"></span>
          <span id="repsBadge" class="reps-badge" style="display:none">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            REPs UAE Verified
          </span>
          <span id="pendingBadge" class="reps-badge pending-badge" style="display:none">
            ⏳ Verification Pending
          </span>
        </div>

        <!-- Stats -->
        <div class="stats-pill" id="statsPill">
          <div class="stat-item">
            <div class="stat-val" id="sYrs"> - </div>
            <div class="stat-lbl">Yrs Exp</div>
          </div>
          <div class="stat-item">
            <div class="stat-val" id="sClients"> - </div>
            <div class="stat-lbl">Clients</div>
          </div>
          <div class="stat-item">
            <div class="stat-val" id="sSessions"> - </div>
            <div class="stat-lbl">Sessions</div>
          </div>
          <div class="stat-item">
            <div class="stat-val accept" id="sAccept">✓</div>
            <div class="stat-lbl">Accepting</div>
          </div>
        </div>

        <!-- Training modes -->
        <div class="modes-row" id="modesRow"></div>

        <!-- Gym tag -->
        <div id="gymTag" class="gym-tag" style="display:none">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
          <span id="gymName"></span>
        </div>
      </div><!-- /hero -->

      <!-- CTAs -->
      <div id="ctas">
        <div class="btn-wa-wrap">
          <a id="waBtn" href="#" class="btn-wa" style="display:none">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp Me
          </a>
        </div>
        <button id="bookBtn" class="btn-book" onclick="openLead()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span data-i18n="profile.book">Book a Session</span>
        </button>
        <div class="action-grid">
          <button class="btn-action" onclick="scrollToPackages()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            Packages
          </button>
          <button class="btn-action" onclick="scrollToAssess()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
            Free Assessment
          </button>
        </div>
        <button class="btn-save" onclick="saveContact()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span data-i18n="profile.contact">Save My Contact</span>
        </button>
      </div><!-- /ctas -->

    </div><!-- /profile-hero -->

    <!-- Content grid (white bg on desktop, single-col on mobile) -->
    <div id="profile-grid">

      <div id="sections">

        <!-- Training Philosophy -->
        <div class="sec-card" id="philosophyCard" style="display:none">
          <div class="sec-header" onclick="toggleSec('philosophyBody',this)">
            <span class="sec-title">My Training Philosophy</span>
            <svg class="sec-arrow open" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div id="philosophyBody" class="sec-body open">
            <div id="philosophyContent"></div>
          </div>
        </div>

        <!-- Bio -->
        <div class="sec-card" id="bioCard" style="display:none">
          <div class="sec-header" onclick="toggleSec('bioBody',this)">
            <span class="sec-title">About</span>
            <svg class="sec-arrow open" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div id="bioBody" class="sec-body open">
            <p id="bioText" class="bio-text"></p>
            <div id="specTags" class="tag-row" style="margin-top:12px"></div>
            <div id="certTags" class="tag-row" style="margin-top:8px"></div>
          </div>
        </div>

        <!-- Packages -->
        <div class="sec-card" id="pkgsCard" style="display:none">
          <div class="sec-header" onclick="toggleSec('pkgsBody',this)">
            <span class="sec-title">Training Packages</span>
            <svg class="sec-arrow open" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div id="pkgsBody" class="sec-body open">
            <div id="pkgList" class="pkg-list"></div>
          </div>
        </div>

        <!-- Assessment -->
        <div class="sec-card">
          <div class="sec-header" onclick="toggleSec('assessBody',this)">
            <span class="sec-title">Free Fitness Assessment</span>
            <svg class="sec-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div id="assessBody" class="sec-body">
            <p class="assess-intro">Get your personalised fitness score, BMI, and a recommended training plan in 30 seconds.</p>
            <div class="assess-form">
              <div class="assess-row">
                <div class="assess-field">
                  <label>Age</label>
                  <input type="number" id="aAge" placeholder="28" min="16" max="80">
                </div>
                <div class="assess-field">
                  <label>Gender</label>
                  <select id="aGender">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <div class="assess-row">
                <div class="assess-field">
                  <label>Height (cm)</label>
                  <input type="number" id="aHeight" placeholder="175" min="140" max="220">
                </div>
                <div class="assess-field">
                  <label>Weight (kg)</label>
                  <input type="number" id="aWeight" placeholder="75" min="40" max="200">
                </div>
              </div>
              <div class="assess-field">
                <label>Goal</label>
                <select id="aGoal">
                  <option value="fat_loss">Fat Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="endurance">Endurance</option>
                  <option value="general">General Fitness</option>
                </select>
              </div>
              <div class="assess-field">
                <label>Activity Level</label>
                <select id="aActivity">
                  <option value="sedentary">Sedentary (desk job)</option>
                  <option value="light">Light (1-2x/week)</option>
                  <option value="moderate" selected>Moderate (3-4x/week)</option>
                  <option value="active">Active (5+x/week)</option>
                </select>
              </div>
              <button class="btn-assess" onclick="runAssessment()">Get My Free Assessment →</button>
              <div id="assessResult" class="assess-result"></div>
            </div>
          </div>
        </div>

        <!-- Transformations -->
        <div class="sec-card" id="transformsCard" style="display:none">
          <div class="sec-header" onclick="toggleSec('transformsBody',this)">
            <span class="sec-title">Client Transformations</span>
            <svg class="sec-arrow open" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div id="transformsBody" class="sec-body open">
            <div id="transformsGrid" class="transforms-grid"></div>
          </div>
        </div>

        <!-- Reviews -->
        <div class="sec-card" id="reviewsCard" style="display:none">
          <div class="sec-header" onclick="toggleSec('reviewsBody',this)">
            <span class="sec-title">Client Reviews</span>
            <svg class="sec-arrow open" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div id="reviewsBody" class="sec-body open">
            <div id="reviewsContent"></div>
            <div id="writeReviewSection" style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);display:none">
              <button id="writeReviewToggle" onclick="document.getElementById('writeReviewForm').style.display=document.getElementById('writeReviewForm').style.display==='none'?'block':'none'" style="cursor:pointer;display:inline-flex;align-items:center;gap:8px;padding:8px 16px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;font-size:13px;font-weight:600;color:var(--text-muted);transition:all 0.18s">
                <span style="font-size:15px">&#9998;</span> Write a Review
              </button>
              <div id="writeReviewForm" style="display:none;margin-top:12px">
                <div style="margin-bottom:12px">
                  <label style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:6px">Your Name</label>
                  <input id="rvName" type="text" placeholder="e.g. James M." maxlength="60" style="width:100%;padding:10px 12px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:14px;outline:none" />
                </div>
                <div style="margin-bottom:12px">
                  <label style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:6px">Rating</label>
                  <div id="starPicker" style="display:flex;gap:6px">
                    <span data-v="1" onclick="setRating(1)" style="font-size:28px;color:var(--text-muted);cursor:pointer">&#9733;</span>
                    <span data-v="2" onclick="setRating(2)" style="font-size:28px;color:var(--text-muted);cursor:pointer">&#9733;</span>
                    <span data-v="3" onclick="setRating(3)" style="font-size:28px;color:var(--text-muted);cursor:pointer">&#9733;</span>
                    <span data-v="4" onclick="setRating(4)" style="font-size:28px;color:var(--text-muted);cursor:pointer">&#9733;</span>
                    <span data-v="5" onclick="setRating(5)" style="font-size:28px;color:var(--text-muted);cursor:pointer">&#9733;</span>
                  </div>
                </div>
                <div style="margin-bottom:12px">
                  <label style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:6px">Your Review</label>
                  <textarea id="rvText" rows="4" placeholder="Share your experience with this trainer..." maxlength="600" style="width:100%;padding:10px 12px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:14px;outline:none;resize:vertical"></textarea>
                </div>
                <div style="margin-bottom:16px">
                  <label style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:6px">Goal Achieved (optional)</label>
                  <input id="rvGoal" type="text" placeholder="e.g. Lost 8kg in 10 weeks" maxlength="80" style="width:100%;padding:10px 12px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:14px;outline:none" />
                </div>
                <button onclick="submitReview()" style="padding:11px 24px;background:var(--orange);color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;width:100%;transition:opacity 0.18s" id="rvSubmitBtn">Submit Review</button>
                <div id="rvMsg" style="margin-top:10px;font-size:13px;display:none"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Affiliate Vault / Trainer's Stack -->
        <div class="sec-card" id="affiliateCard" style="display:none">
          <div class="sec-header" onclick="toggleSec('affiliateBody',this)">
            <span class="sec-title">Trainer's Stack</span>
            <svg class="sec-arrow open" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div id="affiliateBody" class="sec-body open">
            <div class="affiliate-editorial-intro">
              <strong>What I actually use.</strong> These are the products, supplements, and gear I personally train with and recommend to my clients - with exclusive discount codes.
            </div>
            <div id="affiliateList" class="affiliate-list"></div>
          </div>
        </div>

        <!-- Gallery -->
        <div class="sec-card" id="galleryCard" style="display:none">
          <div class="sec-header" onclick="toggleSec('galleryBody',this)">
            <span class="sec-title">Gallery</span>
            <svg class="sec-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div id="galleryBody" class="sec-body">
            <div id="galleryGrid" class="gallery-grid"></div>
          </div>
        </div>

      </div><!-- /sections -->

      <!-- Socials (desktop: below grid; mobile: inline) -->
      <div id="socials-desktop" style="display:none;gap:10px;padding:0 0 20px;flex-wrap:wrap"></div>
      <div id="socials" style="display:flex;gap:10px;padding:0 20px 20px;flex-wrap:wrap"></div>

      <!-- Nearby Trainers -->
      <div id="nearbySection" style="display:none;padding:0 20px 20px;">
        <div style="font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">Also in this gym</div>
        <div id="nearbyList" style="display:flex;flex-direction:column;gap:10px;"></div>
        <a href="/find" style="display:block;text-align:center;margin-top:14px;font-size:12px;color:var(--orange);text-decoration:none;font-weight:600;">Browse all trainers →</a>
      </div>

      <div class="powered">Powered by <a href="/" id="powered-by-link">TrainedBy</a> · <a href="/find" style="color:var(--orange)">Find a Trainer</a></div>

    </div><!-- /profile-grid -->

  </div><!-- /page -->
  ```

- [ ] **Step 3: Verify no inner content was lost**

  ```bash
  grep -c "sec-card" src/pages/profile.astro
  ```

  Expected: same count as before the change (8 section cards). Also verify these IDs are still present:

  ```bash
  grep -o 'id="[^"]*"' src/pages/profile.astro | sort | grep -E "hero|ctas|pkgsCard|bioCard|philosophyCard|transformsCard|reviewsCard|galleryCard|affiliateCard|profile-hero|profile-grid|sections"
  ```

  All 13 IDs should appear exactly once.

- [ ] **Step 4: Commit**

  ```bash
  git add src/pages/profile.astro
  git commit -m "refactor(profile): replace left-col/right-col with profile-hero/profile-grid wrappers"
  ```

---

## Task 2: Replace Desktop CSS

**Files:**
- Modify: `src/pages/profile.astro` (CSS block, lines ~685–825)

- [ ] **Step 1: Locate and remove the old desktop CSS blocks**

  Find the comment `/* ═══════════════════════════════════════════════` (around line 685) and remove from there through the closing `}` of `@media (min-width: 1024px)` (around line 824), inclusive.

  The block to remove starts at:
  ```css
  /* ═══════════════════════════════════════════════
     DESKTOP LAYOUT - 768px and above
     Two-column: hero/CTAs left, sections right
  ═══════════════════════════════════════════════ */
  @media (min-width: 768px) {
  ```

  And ends at the closing brace of:
  ```css
  @media (min-width: 1024px) {
    #left-col { width: 400px; }
    #right-col { padding-left: 56px; }
    .trainer-name { font-size: 34px; }
  }
  ```

- [ ] **Step 2: Add new desktop CSS in the same location**

  Insert the following CSS block where the old one was removed:

  ```css
  /* ═══════════════════════════════════════════════
     DESKTOP LAYOUT - 768px and above
     Full-bleed hero banner + 3-column content grid
  ═══════════════════════════════════════════════ */
  @media (min-width: 768px) {

    /* Topbar gets a max-width container */
    #topbar {
      padding-left: max(calc(50vw - 600px), 32px);
      padding-right: max(calc(50vw - 600px), 32px);
    }

    /* Background: vertical gradient for cinematic hero (not left-right) */
    #bg {
      background-position: center top;
    }
    #bg::after {
      background: linear-gradient(
        to bottom,
        rgba(0,0,0,0.15) 0%,
        rgba(0,0,0,0.4) 50%,
        rgba(0,0,0,0.85) 100%
      );
    }

    /* Page: block (not flex row) */
    #page {
      display: block !important;
    }

    /* ── HERO BANNER ── */
    #profile-hero {
      position: relative;
      height: 300px;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      padding: 0 48px 36px;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Hero identity: left-anchored */
    #hero {
      padding: 0;
      text-align: left;
      align-items: flex-start;
      gap: 8px;
      flex: 1;
      min-width: 0;
    }

    .avatar-wrap {
      width: 88px;
      height: 88px;
    }

    .trainer-name {
      font-size: 32px;
      color: #fff;
    }

    .trainer-title {
      color: rgba(255,255,255,0.7);
    }

    .badge-row {
      justify-content: flex-start;
    }

    .modes-row {
      justify-content: flex-start;
    }

    .rating-row {
      justify-content: flex-start;
    }

    .stats-pill {
      max-width: 100%;
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.15);
    }

    .stat-val, .stat-lbl {
      color: #fff;
    }

    .gym-tag {
      color: rgba(255,255,255,0.65);
    }

    /* CTAs: right-anchored vertical stack in hero */
    #ctas {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 200px;
      flex-shrink: 0;
      padding: 0;
      margin-left: 32px;
    }

    /* Hide secondary CTAs inside the hero on desktop */
    #ctas .action-grid {
      display: none;
    }
    #ctas .btn-save {
      display: none;
    }

    /* Book button: full width within cta stack */
    #ctas .btn-book {
      width: 100%;
    }

    /* WA button: full width within cta stack */
    #ctas .btn-wa-wrap {
      width: 100%;
    }
    #ctas .btn-wa {
      width: 100%;
      justify-content: center;
    }

    /* ── CONTENT GRID ── */
    #profile-grid {
      background: var(--bg);
      padding: 40px 48px 64px;
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
    }

    /* Sections participates in grid as transparent wrapper */
    #sections {
      display: contents;
      padding: 0;
      margin: 0;
    }

    /* Card grid spans */
    #pkgsCard       { grid-column: span 2; order: 1; }
    #bioCard        { grid-column: span 2; order: 2; }
    #philosophyCard { grid-column: span 1; order: 3; }
    #transformsCard { grid-column: 1 / -1; order: 4; }
    #reviewsCard    { grid-column: 1 / -1; order: 5; }
    #affiliateCard  { grid-column: span 1; order: 6; }
    #galleryCard    { grid-column: 1 / -1; order: 7; }

    /* Assessment card (no ID — targets the only .sec-card without an ID) */
    #sections > .sec-card:not([id]) { grid-column: span 1; order: 3; }

    /* Sections open by default on desktop */
    .sec-body {
      display: block;
    }

    /* Wider transforms grid on desktop */
    .transforms-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    /* Gallery wider */
    .gallery-grid {
      grid-template-columns: repeat(4, 1fr);
    }

    /* Nearby section and socials: span full width in grid */
    #nearbySection {
      grid-column: 1 / -1;
      padding: 0 0 20px;
    }

    #socials {
      grid-column: 1 / -1;
      padding: 0 0 20px;
    }

    #socials-desktop {
      grid-column: 1 / -1;
    }

    .powered {
      grid-column: 1 / -1;
      text-align: left;
      padding: 16px 0;
    }

    /* Lead modal centered on desktop */
    #leadModal {
      align-items: center;
    }
    .modal-sheet {
      border-radius: 24px;
    }
  }

  @media (min-width: 1024px) {
    #profile-hero {
      padding: 0 64px 40px;
    }
    #profile-grid {
      padding: 48px 64px 80px;
    }
    .trainer-name { font-size: 36px; }
  }
  ```

- [ ] **Step 3: Verify the CSS was inserted correctly**

  ```bash
  grep -n "profile-hero\|profile-grid\|display: contents" src/pages/profile.astro
  ```

  Expected: `#profile-hero`, `#profile-grid`, and `display: contents` each appear in the CSS block.

- [ ] **Step 4: Verify no old sidebar CSS remains**

  ```bash
  grep -n "left-col\|right-col" src/pages/profile.astro
  ```

  Expected: zero results (all removed).

- [ ] **Step 5: Commit**

  ```bash
  git add src/pages/profile.astro
  git commit -m "feat(profile): desktop full-bleed hero banner + 3-col content grid"
  ```

---

## Task 3: Visual Verification

**Files:** No changes — this task is verification only.

- [ ] **Step 1: Start the dev server**

  ```bash
  npm run dev
  ```

  Expected output: `Local: http://localhost:4321/` (or similar port). Keep running.

- [ ] **Step 2: Open a profile on desktop (≥1024px)**

  Navigate to `http://localhost:4321/profile?slug=<any-trainer-slug>` in a browser window set to at least 1200px wide.

  Check each item:
  - [ ] Hero banner is full-width, approximately 300px tall
  - [ ] Avatar, name, cert badge, stats pill visible at bottom-left of banner
  - [ ] Book and WhatsApp buttons visible at bottom-right of banner
  - [ ] Below the hero: white background, sections in a 3-column grid
  - [ ] Packages card spans 2 columns (wider than Philosophy/Assessment)
  - [ ] Bio/About card spans 2 columns
  - [ ] No horizontal scrollbar
  - [ ] No content hidden behind the fixed topbar

- [ ] **Step 3: Check mobile (375px)**

  In browser DevTools, switch to iPhone SE (375px wide) or resize to 375px.

  Check each item:
  - [ ] Layout is identical to before — centered hero, stacked CTAs (all 4 buttons visible), sections as accordion below
  - [ ] Action-grid buttons (Packages, Free Assessment) are visible on mobile
  - [ ] Save My Contact button is visible on mobile
  - [ ] No layout regressions

- [ ] **Step 4: Check tablet breakpoint (768px)**

  Set browser to exactly 768px wide. This is the breakpoint boundary.

  Check: hero banner appears, content grid appears, no flash or jump between layouts.

- [ ] **Step 5: Push to production**

  ```bash
  git push origin main
  ```

  Expected: Netlify auto-deploy triggers. Check Netlify dashboard for build status.
