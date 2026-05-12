# ADR 002 — Supabase Edge Functions over a Separate API Server

**Date:** 2025-12 (project start)
**Status:** Accepted

## Context

The platform needs backend logic for: trainer registration, lead capture, payment processing, AI-powered responses, and scheduled digests. Options were: a separate Node/Express server, Netlify Functions, Vercel Edge Functions, or Supabase Edge Functions.

## Decision

Use Supabase Deno Edge Functions for all backend logic.

## Rationale

- **Co-location:** Edge functions run in the same data centre as the database. Auth checks, DB queries, and responses happen with sub-millisecond DB latency.
- **No cold starts:** Supabase edge functions use Deno Deploy under the hood, which has no cold start problem (unlike Lambda or Netlify Functions in Node).
- **Cost at scale:** 2M function invocations/month free, then $2/million. A competitor on AWS Lambda at the same scale would cost ~$80/month.
- **Service role key access:** Functions run with full service role access to the DB, removing the need for a separate privileged backend. This is secure because functions are not exposed to the browser directly — they're called via the Supabase anon key gateway.

## Tradeoffs

- Deno is not Node.js. npm packages must be imported via esm.sh or deno.land/x. Some packages (e.g., PDFKit) have no Deno equivalent — we'd need a separate service for those.
- 56 functions is a large surface area to maintain. Mitigated by `_shared/` utilities and consistent patterns across all functions.
