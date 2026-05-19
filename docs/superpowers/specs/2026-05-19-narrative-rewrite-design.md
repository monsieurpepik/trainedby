# Platform Narrative Rewrite — Design Spec
Date: 2026-05-19
Status: Approved for planning

---

## 1. Objective

Rewrite the public-facing marketing pages to reflect the new product direction: creator-led accountability clubs, not a trainer marketplace. The old narrative ("find a trainer, book a session") must be replaced across three pages.

---

## 2. Narrative Framework

### Voice
- **Hook style:** Hormozi — lead with the problem so precisely the reader feels seen before the product is mentioned
- **Mechanism:** BODi — time-bound cohort (30 days), structured program, community accountability
- **Differentiator:** Creator-led (your coach, not a content library) + social visibility (community sees your streak)

### Core villain
> *Inconsistency. Not lack of knowledge, not lack of motivation — lack of pressure.*

### Core promise (trainer-facing)
> BODi pays its trainers $0. You built an audience. Now build a business from it.

### Core promise (member-facing)
> You've started over enough times. What you're missing isn't the plan.

### Product positioning
- NOT: a fitness app, a workout library, a booking marketplace
- IS: the accountability layer between a coach and their community

---

## 3. Pages in Scope

### 3.1 `src/pages/for-trainers.astro` — Trainer acquisition

**Meta:**
- `<title>`: "Run Accountability Clubs for Your Audience — TrainedBy"
- `<description>`: "Turn your Instagram followers into paying club members. AI writes 30 daily missions. You coach, shout out, and earn 80% of every membership."

**Section 1 — Hero**
- Eyebrow: `BODi pays its trainers $0. You built an audience.` (orange/brand colour, small)
- H1: `Run your 30-day club.` / `Keep 80% of every` / `membership.` (white, 76px, 900 weight)
- Subhead: "AI writes 30 daily missions from your goal. Your audience joins. You coach, shout out, and earn — while they show up every day."
- Proof strip (3 stats): `87% mission completion rate` · `$2,400 avg monthly per club` · `30 seconds to generate a full plan`
- Primary CTA: "Launch your first club →" → `/join`
- Secondary CTA: "See how it works" → smooth scroll to Section 2
- Urgency strip (bottom of hero): live count of trainers who launched this week

**Section 2 — How it works (3 steps)**
- Step 1: **Create your club** — Name it, describe your transformation goal, set a price (or keep it free)
- Step 2: **AI writes the plan** — Claude generates 30 daily missions in 30 seconds. You review, edit tomorrow's mission each day
- Step 3: **Your audience joins** — Share your profile link. Members pay, check in daily, build public streaks

**Section 3 — The economics**
- BODi comparison: `BODi: $0 to trainers` vs `TrainedBy: 80% to you`
- Example calculation: 50 members × $49 = $2,450/month per club
- Two clubs = $4,900/month recurring
- Visual: simple comparison table or calculator (static example)

**Section 4 — What you get**
Features reframed as trainer benefits (no bullet-point feature list — each has a one-line "so you can" statement):
- AI mission generator → "30 days of structured content in 30 seconds"
- Daily email nudge → "Review tomorrow's AI draft before it goes live — 2 minutes a day"
- Member roster + streaks → "See exactly who's showing up and who needs a nudge"
- Shoutout button → "One tap to celebrate the whole club in their feed"
- Stripe payments built in → "Set a price, get paid — no setup, no third-party tools"
- Phase 2 teaser (live drops) → subtle "Coming: go live, drop new clubs in real time"

**Section 5 — Bottom CTA**
- Headline: "Your audience is already there. Give them somewhere to show up."
- CTA: "Launch your first club free →" → `/join`

---

### 3.2 `src/pages/index.astro` — Homepage (member acquisition)

**Meta:**
- `<title>`: "Accountability Clubs Led by Real Coaches — TrainedBy"
- `<description>`: "Join a 30-day coach-led transformation club. One daily mission. A community that sees your streak. The accountability layer your routine was missing."

**Section 1 — Hero**
- Eyebrow: `You've started over enough times.` + `What you're missing isn't the plan.` (muted, small)
- H1: `30 days.` / `One coach.` / `A community that` / `sees your streak.` (white, large, 900 weight)
- Subhead: "Join a coach-led accountability club. One daily mission. Your streak is public. The group notices when you miss — and celebrates when you don't."
- Urgency chip: "🔥 Next cohort: [dynamic date] — [N] spots remaining" (orange badge, server-side: query `SELECT starts_at, max_members, (SELECT COUNT(*) FROM club_members WHERE club_id = clubs.id) as joined FROM clubs WHERE status = 'active' AND starts_at >= NOW() ORDER BY starts_at ASC LIMIT 1`. Hide chip entirely if query returns no rows.)
- Primary CTA: "Find your club →" → `/find`
- Secondary CTA: "How it works" → smooth scroll to Section 2
- Social proof strip (bottom of hero): live feed snippet — "3 members checked in today in Coach Ahmed's Fat Loss Club"

**Section 2 — How it works (3 steps for members)**
- Step 1: **Find a club** — Browse clubs from verified coaches. Pick your goal, your coach, your start date
- Step 2: **Get your daily mission** — One task per day. Simple. Binary. Done or not done
- Step 3: **Show up publicly** — Your streak is visible to the whole club. The community sees who's in — and who's out

**Section 3 — Why not an app**
Short contrast block, 3 lines maximum:
- "Fitness apps don't know your name. Your coach does."
- "Pre-recorded workouts don't notice when you quit. Your club does."
- "A streak counter doesn't care. 40 people watching yours does."

**Section 4 — Featured clubs**
- Live club cards from database (`SELECT * FROM clubs WHERE status = 'active' ORDER BY created_at DESC LIMIT 3`)
- Fallback: static placeholder cards if no clubs exist
- Each card: club name, trainer name + avatar, goal snippet, price, "X spots left", Join button
- CTA below cards: "See all clubs →" → `/find`

**Section 5 — Bottom CTA**
- Headline: "Stop starting over. Start showing up."
- Subhead: "30 days. One coach. The community makes it real."
- CTA: "Find your club →" → `/find`

---

### 3.3 `src/pages/find.astro` — Club discovery (rename from trainer finder)

**Scope of change:** Minimal — update headline, meta, and hero copy only. The filter/grid structure stays.

**Meta:**
- `<title>`: "Find an Accountability Club — TrainedBy"
- `<description>`: "Browse 30-day transformation clubs led by verified coaches in UAE and the US. Pick your goal, join a cohort, start showing up."

**Hero copy changes:**
- Old eyebrow: "Find a Verified Personal Trainer"
- New eyebrow: "Accountability Clubs"
- Old H1: "Find a Trainer" (or similar)
- New H1: "Find your club." / "Start showing up."
- Old subhead: marketplace framing
- New subhead: "Browse coach-led 30-day clubs. One daily mission, a community that tracks your streak, and a coach who knows your name."

**Filter label changes:**
- "Specialty" → "Club goal" (weight loss, running, strength, mindset, etc.)
- "Location" → stays (UAE / US market filter)
- Trainer cards → Club cards (show club name + trainer, not just trainer)

---

## 4. Design Constraints

- **Existing design system stays** — dark theme (`#0f0e0d`), purple accent (`#7c3aed`), orange brand (`#FF5C00`), Manrope font. No new design language.
- **Market-aware copy** — `brandName`, `certificationBody`, `isPaid` from `src/lib/market.ts`. UAE copy and US copy remain consistent; only the narrative framing changes.
- **No fake numbers** — Proof strip stats (87% completion, $2,400/month) are placeholders until real data exists. They must either be marked "projected" or removed until clubs launch with real data.
- **Featured clubs section** — falls back gracefully to static placeholder cards if database returns 0 clubs. Never shows an empty section.

---

## 5. Out of Scope

- `pricing.astro` — leave as-is for now
- `landing.astro` — separate rewrite, not in this plan
- Trainer profile page (`[slug].astro`) — already updated with ClubsSection
- Blog, legal pages, OG images — not in scope

---

## 6. Success Criteria

- A trainer landing on `for-trainers.astro` understands "clubs + recurring income" within 5 seconds
- A member landing on `index.astro` understands "30-day coach-led club with accountability" within 5 seconds
- No page still uses the words "book a session", "find a trainer", "marketplace", or "leads" in hero or subhead copy
- `find.astro` hero references clubs, not trainers
- All pages build successfully (`pnpm astro build`)
