# ADR 003 — Multi-Domain over Subdomain Architecture

**Date:** 2025-12 (project start)
**Status:** Accepted

## Context

TrainedBy operates across 8 markets: UAE, UK, India, US/Global, France, Italy, Spain, Mexico. Each market needs localised content, currency, and certification body references. Options were:
- One domain with locale subpaths (e.g., `trainedby.ae/fr/`)
- Subdomains (e.g., `fr.trainedby.ae`)
- Separate domains per market (e.g., `coachepar.fr`)

## Decision

Use separate domains per market, sharing one Supabase backend.

## Rationale

- **Local SEO:** `coachepar.fr` ranks in France as a French domain. `trainedby.ae/fr/` is seen by Google as an international site. For a local service (personal training), local SEO is the acquisition channel — this decision directly affects revenue.
- **Brand authenticity:** French trainers marketing themselves on a `.fr` domain builds trust with French clients. Same for Italy (`allenaticon.it`) and Spain (`entrenacon.com`).
- **One backend:** All 10 domains share `mezhtdbfyvkshpuplqqw.supabase.co`. The `market` column on the `trainers` table partitions data per domain. RLS policies enforce isolation.
- **Scalability:** Adding a new market takes 5 minutes — register the domain, add a row to `market.ts`, set the Netlify custom domain.

## Tradeoffs

- Managing 10 domains (SSL, DNS, Netlify) adds operational overhead. Mitigated by Netlify's automatic SSL and Supabase's single-backend model.
- Sitemap and robots.txt must be market-aware. Mitigated by the dynamic sitemap endpoint in `supabase/functions/sitemap/`.
