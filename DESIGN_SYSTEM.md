# TrainedBy Design System

## Core Philosophy
"What if Strava built a professional profile platform and Apple designed the details."
Dark, premium, energetic — but never loud. Every element earns its place.

## Extracted Rules by Reference

### From Linktree (what to beat)
- Linktree is generic: white/grey background, flat pill buttons, no hierarchy
- Their profile page is a simple vertical list — no personality, no trust signals
- We beat them by: dark premium aesthetic, REPs badge as trust anchor, stats row, 
  package cards with pricing, fitness assessment CTA, WhatsApp integration
- Key weakness: Linktree has zero niche context — we own fitness/UAE

### From Strava
- Orange (#FC4C02 — we use #FF5C00, close enough) as the single accent
- Stats are ALWAYS prominent — numbers displayed large, bold, tight tracking
- Activity cards: clean, data-forward, no decorative clutter
- "Segment" style: dark background with orange accent line/border on active items
- Social proof through numbers: KMs, PRs, followers — we use clients, sessions, years
- Mobile-first: everything works perfectly at 390px
- Energy through typography: Manrope 900 weight for all numbers and key stats

### From Apple
- Generous whitespace — sections breathe, nothing cramped
- SF Pro-style type hierarchy: massive display → medium subhead → small body
- Frosted glass / blur effects for overlays and nav
- Smooth micro-animations: hover lifts, fade-ins, subtle transforms
- Every interactive element has a clear hover/active state
- Rounded corners: 12px for cards, 100px for pills/buttons, 20px for large cards
- Color used sparingly — one accent, everything else is neutral
- Loading states: skeleton shimmer, not spinners

### From Airbnb
- Trust signals front and centre (Superhost badge = our REPs badge)
- Clear information hierarchy on cards: photo → name → key stat → price → CTA
- Reviews/testimonials shown as real quotes with avatar + name + credential
- Onboarding: multi-step with progress indicator, one question per screen
- Form design: large touch targets, clear labels above inputs, inline validation
- Empty states: helpful, not just "no data" — guide the user to the next action
- Pricing: always show value, not just cost (AED 99/mo = less than 1 session)

## Design Tokens

### Colors
- Background: #0a0a0a (near-black, not pure black)
- Surface 1: #111111 (cards, panels)
- Surface 2: #1a1a1a (nested elements)
- Surface 3: #222222 (inputs, tags)
- Border subtle: rgba(255,255,255,0.07)
- Border visible: rgba(255,255,255,0.12)
- Text primary: #f2f2f2
- Text secondary: #888888
- Text muted: #444444
- Brand orange: #FF5C00
- Brand dim: rgba(255,92,0,0.10)
- Brand border: rgba(255,92,0,0.25)
- REPs green: #00C853
- REPs dim: rgba(0,200,83,0.10)
- WhatsApp green: #25D366
- Error: #FF4444
- Success: #00C853

### Typography
- Display (hero headlines): Manrope 900, -3px tracking, 1.0 line-height
- Section titles: Manrope 900, -2px tracking, 1.05 line-height
- Card titles: Manrope 800, -1px tracking
- Stats/numbers: Manrope 900, -1px to -2px tracking
- Body: Inter 400, 1.6-1.7 line-height
- Labels/eyebrows: Inter 700, uppercase, 1.5px letter-spacing
- Small/meta: Inter 400-500, 12-13px

### Spacing
- Section padding: 80-100px vertical
- Card padding: 24-32px
- Gap between cards: 16px
- Max content width: 1100px
- Mobile padding: 20px horizontal

### Components

#### Buttons
- Primary: #FF5C00 bg, white text, 100px border-radius, 14-16px font, 700 weight
- Ghost: transparent, white text, 1px border rgba(255,255,255,0.12), same radius
- Danger: #FF4444 bg
- Hover: translateY(-2px) + slight color darken
- Active: translateY(0) + scale(0.98)

#### Cards
- Background: #111111
- Border: 1px solid rgba(255,255,255,0.07)
- Border-radius: 16-20px
- Hover: border-color rgba(255,255,255,0.12), translateY(-2px)
- Featured/active: brand-border rgba(255,92,0,0.25) + brand-dim background tint

#### Badges
- REPs Verified: green dot + "REPs UAE Verified" text, green bg/border
- Pending: amber dot + "Verification Pending"
- Unverified: grey dot + "Not Verified"

#### Form inputs
- Background: #1a1a1a
- Border: 1px solid rgba(255,255,255,0.12)
- Border-radius: 12px
- Padding: 14px 16px
- Focus: border-color #FF5C00, box-shadow 0 0 0 3px rgba(255,92,0,0.15)
- Label: above input, Inter 600 13px, #888888 color
- Error: border-color #FF4444, error message below in red

#### Progress/Steps
- Step indicator: numbered circles, brand orange for active, surface-3 for inactive
- Progress bar: thin 2px line, brand orange fill, surface-3 track

#### Stats
- Number: Manrope 900, large (24-32px), white
- Label: Inter 500, 11px, uppercase, text-muted
- Divider: 1px vertical rgba(255,255,255,0.07)

## Page-by-Page Rules

### Profile Page (index.html) — Linktree competitor
- Full-screen hero with trainer's cover image (or dark gradient fallback)
- Floating profile card with avatar, name, REPs badge, specialty tags
- Stats row: Years · Clients · Sessions · Accepting
- Session packages as cards with price, duration, description, "Enquire" CTA
- Fitness assessment as collapsible/modal section
- Sticky WhatsApp FAB (floating action button) on mobile
- Share button (native share API)
- Gallery grid (Pro/Premium only)

### Join Flow (join.html)
- Full-screen steps, one concept per step
- Step 1: Name + email (Airbnb-style large inputs)
- Step 2: Specialties (tap-to-select chips, multi-select)
- Step 3: Packages (add up to 2 for free)
- Step 4: REPs number + photo upload
- Progress bar at top
- Back/Next navigation, keyboard-friendly

### Dashboard (dashboard.html)
- Strava-style stats cards at top: views, taps, leads this week
- Sparkline chart (7-day trend)
- Leads list with avatar, name, package interest, time, WhatsApp action
- Profile completion checklist (Airbnb onboarding style)
- Upgrade banner for free users

### Edit Profile (edit.html)
- Section-by-section form layout
- Live preview panel (desktop only)
- Auto-save with subtle "Saved" toast
- Photo upload with drag-and-drop

### Pricing (pricing.html)
- 3-column cards, monthly/annual toggle
- Annual savings badge ("Save 20%")
- Feature comparison table below cards
