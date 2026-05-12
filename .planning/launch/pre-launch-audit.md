# Pre-Launch Gate Audit
Date: 2026-05-01

## Gate Checklist

| Item | Status | Evidence / Notes |
|------|--------|-----------------|
| Sentry frontend errors | ⏳ PENDING | Code wired (`@sentry/astro`, enabled: `!!PUBLIC_SENTRY_DSN`). DSN not yet set in Netlify. Set `PUBLIC_SENTRY_DSN` + `SENTRY_AUTH_TOKEN` env vars, then smoke test. |
| Sentry edge function errors | ⏳ PENDING | Code wired (`_shared/sentry.ts`, `SENTRY_DSN` env). Not yet set in Supabase secrets. |
| Zero duplicate payment events (idempotency) | ✅ PASS | Migration `20260415_idempotency_and_monitoring.sql` creates table + RLS. Both `stripe-webhook` and `razorpay-webhook` read before acting and insert after. Still verify table is applied in production DB. |
| Rate limiting — send-magic-link (10/hr) | ✅ PASS | `checkRateLimit` confirmed in `supabase/functions/send-magic-link/index.ts` |
| Rate limiting — register-trainer (5/hr) | ✅ PASS | `checkRateLimit` confirmed in `supabase/functions/register-trainer/index.ts` |
| Rate limiting — submit-lead (20/hr) | ✅ PASS | `checkRateLimit` confirmed in `supabase/functions/submit-lead/index.ts` |
| Rate limiting — create-checkout (10/hr) | ✅ PASS | `checkRateLimit` confirmed in `supabase/functions/create-checkout/index.ts` |
| Rate limiting — payment-router (10/hr) | ✅ PASS | `checkRateLimit` confirmed in `supabase/functions/payment-router/index.ts` |
| Zero trainedby.ae hardcoded strings in source | ✅ PASS | All remaining hits are legitimate: market config keys (ae IS trainedby.ae), FROM_EMAILS map entries, internal ops email fallbacks, sitemap host-header fallback. No user-facing multi-market content hardcoded. Tasks 1 + 2 complete. |
| /privacy page live with correct content | ✅ PASS (code) | `src/pages/privacy.astro` exists — includes CCPA + PDPL sections + cookie consent reference. Verify live rendering at trainedby.ae/privacy. |
| /terms page live with correct content | ✅ PASS (code) | `src/pages/terms.astro` exists — includes liability disclaimer and cancellation terms. Verify live rendering. |
| /cookie-policy page live with correct content | ✅ PASS (code) | `src/pages/cookie-policy.astro` exists — includes `tb_cookie_consent` cookie table with purpose column. Verify live rendering. |
| Cookie consent banner on all pages | ✅ PASS (code) | `CookieConsent.astro` imported in `Base.astro` layout (line 23) — covers all pages. Uses `tb_cookie_consent` localStorage key. Verify banner appears visually in incognito. |
| Consent checkbox on trainer signup | ✅ PASS (code) | `join.astro` line 530: checkbox present, unchecked by default. Line 960: submission blocked if unchecked. Verify in browser. |
| Consent checkbox on lead capture forms | ✅ PASS (code) | `[slug].astro` line 473: `rvConsent` checkbox on lead/review form, required before submit. Verify in browser. |
| Admin password not in source files | ✅ PASS | CLAUDE.md: "password stored in 1Password". No plaintext password in source. `superadmin.astro` checks against an env var, not a hardcoded value. |
| Payment router — UAE Stripe AED flow | ⏳ PENDING | In Stripe test dashboard: find checkout via `payment-router` for market=ae. Confirm currency=AED. |
| Payment router — US Stripe USD flow | ⏳ PENDING | In Stripe test dashboard: find checkout via `payment-router` for market=com. Confirm currency=USD. |
| Trainer profiles — Google Rich Results Test | ⏳ PENDING | Paste a live trainer profile URL in https://search.google.com/test/rich-results — confirm Person schema with no errors |
| OG images — WhatsApp share preview | ⏳ PENDING | Send a trainer profile URL on WhatsApp to yourself — confirm branded OG image card appears |
| /join multi-step flow with auto-save | ⏳ PENDING | Go through all 3 steps, close browser after step 1, reopen — confirm step 2 pre-filled |
| Profile completeness widget — real data | ⏳ PENDING | Log in to /dashboard — confirm completeness shows real percentage, not "0%" |
| PWA Lighthouse audit passing | ⏳ PENDING | Chrome DevTools → Lighthouse → Progressive Web App on /dashboard — confirm green score |
| 5+ UAE trainer profiles live and complete | ⏳ PENDING | Seed cohort gate — not yet started |
| 3+ US trainer profiles live and complete | ⏳ PENDING | Seed cohort gate — not yet started |

## Open Issues

- **Sentry DSN not configured**: Set `PUBLIC_SENTRY_DSN` in Netlify and `SENTRY_DSN` in Supabase secrets. Then run smoke tests per plan Task 3.
- **Idempotency table**: Migration exists and code is correct — verify the migration is applied in the production DB via Supabase SQL editor: `SELECT table_name FROM information_schema.tables WHERE table_name = 'processed_webhook_events';`
- **Manual verifications pending**: Legal pages, consent UI, payment router currency, schema.org, OG images, Phase 2b regression checks — require browser + Stripe dashboard access.
