# Pre-Launch Gate Audit
Date: 2026-05-01

## Gate Checklist

| Item | Status | Evidence / Notes |
|------|--------|-----------------|
| Sentry frontend errors | ⏳ PENDING | Code wired (`@sentry/astro`, enabled: `!!PUBLIC_SENTRY_DSN`). DSN not yet set in Netlify. Set `PUBLIC_SENTRY_DSN` + `SENTRY_AUTH_TOKEN` env vars, then smoke test. |
| Sentry edge function errors | ⏳ PENDING | Code wired (`_shared/sentry.ts`, `SENTRY_DSN` env). Not yet set in Supabase secrets. |
| Zero duplicate payment events (idempotency) | ⏳ PENDING | Verify `processed_webhook_events` table exists in prod + `stripe-webhook` and `razorpay-webhook` use it. |
| Rate limiting — send-magic-link (10/hr) | ✅ PASS | `checkRateLimit` confirmed in `supabase/functions/send-magic-link/index.ts` |
| Rate limiting — register-trainer (5/hr) | ✅ PASS | `checkRateLimit` confirmed in `supabase/functions/register-trainer/index.ts` |
| Rate limiting — submit-lead (20/hr) | ✅ PASS | `checkRateLimit` confirmed in `supabase/functions/submit-lead/index.ts` |
| Rate limiting — create-checkout (10/hr) | ✅ PASS | `checkRateLimit` confirmed in `supabase/functions/create-checkout/index.ts` |
| Rate limiting — payment-router (10/hr) | ✅ PASS | `checkRateLimit` confirmed in `supabase/functions/payment-router/index.ts` |
| Zero trainedby.ae hardcoded strings in source | ✅ PASS | All remaining hits are legitimate: market config keys (ae IS trainedby.ae), FROM_EMAILS map entries, internal ops email fallbacks, sitemap host-header fallback. No user-facing multi-market content hardcoded. Tasks 1 + 2 complete. |
| /privacy page live with correct content | ⏳ PENDING | Verify live at trainedby.ae/privacy — confirm CCPA + PDPL sections present |
| /terms page live with correct content | ⏳ PENDING | Verify live at trainedby.ae/terms — confirm liability disclaimer + cancellation terms |
| /cookie-policy page live with correct content | ⏳ PENDING | Verify live at trainedby.ae/cookie-policy — confirm cookie table with purpose column |
| Cookie consent banner on all pages | ⏳ PENDING | Test in incognito: visit trainedby.ae, confirm banner appears. Accept → reload → banner gone. Check localStorage: `tb_cookie_consent = accepted`. |
| Consent checkbox on trainer signup | ⏳ PENDING | Visit /join — confirm checkbox unchecked by default, form blocked without it |
| Consent checkbox on lead capture forms | ⏳ PENDING | Visit a trainer profile → submit lead form — confirm consent checkbox present + required |
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
- **Idempotency table**: Verify `processed_webhook_events` exists in production DB via Supabase SQL editor.
- **Manual verifications pending**: Legal pages, consent UI, payment router currency, schema.org, OG images, Phase 2b regression checks — require browser + Stripe dashboard access.
