# ADR 001 — Astro over Next.js

**Date:** 2025-12 (project start)
**Status:** Accepted

## Context

TrainedBy needs to serve trainer profile pages as the primary SEO surface. Each profile is a dedicated page (e.g., `trainedby.ae/sarah-al-mansoori`) that must rank in local search results. The pages are mostly static (trainer data changes infrequently) but need server-side market detection to serve the right locale and branding per domain.

## Decision

Use Astro with SSR output (Netlify adapter).

## Rationale

- **Performance:** Astro sends zero JS by default. Trainer profile pages are HTML + CSS. Core Web Vitals are excellent out of the box, which Google rewards.
- **SSR for market detection:** The `output: 'server'` mode lets us read `Astro.url.hostname` per request and select the right market config. This would require a custom server in Next.js.
- **Islands architecture:** The dashboard uses React islands for interactive components (profile completeness, bookings). The rest is server-rendered HTML.
- **Build simplicity:** One `astro build` produces everything. No separate API layer.

## Tradeoffs

- Next.js has a larger ecosystem and better ISR (incremental static regeneration). We accept this — our content update frequency doesn't require ISR.
- Astro's React integration requires `@astrojs/react` and adds complexity. We accept this — the dashboard interactivity requires it.
