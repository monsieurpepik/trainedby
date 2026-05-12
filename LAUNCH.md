# TrainedBy — Launch Gate

## Hard Gates

All 8 items must be ✅ before signups open.

| Gate | Status | Verified by | Date |
|------|--------|-------------|------|
| Legal pages render | ✅ | Claude Code | 2026-05-12 |
| Cookie consent banner | ✅ | Claude Code | 2026-05-12 |
| Consent checkboxes on /join and lead forms | ✅ | Claude Code | 2026-05-12 |
| Google Rich Results Test passes | ⬜ | — | — |
| WhatsApp OG card shows trainer branding | ⬜ | — | — |
| Stripe shows correct currency per market | ⬜ | — | — |
| Sentry has ≥ 1 confirmed live event | ✅ | Claude Code | 2026-05-12 |
| CI pipeline blocks failing PRs | ✅ | Claude Code | 2026-05-04 |

> **Gates 4–7** require manual verification on the live deployment:
> - Gate 4: Test https://trainedby.ae/sarah-al-mansoori at https://search.google.com/test/rich-results
> - Gate 5: Share a URL in WhatsApp or check https://www.opengraph.xyz
> - Gate 6: Verify STRIPE_PRICE_PRO_MONTHLY / STRIPE_PRICE_PRO_ANNUAL env vars are set in Netlify with correct currency prices
> - Gate 7: Set PUBLIC_SENTRY_DSN in Netlify env vars, deploy, then run `Sentry.captureException(new Error('launch gate test'))` in browser console on production

---

## Seed Cohort Progress

| Market | Target | Complete |
|--------|--------|---------|
| UAE | 5 trainers ≥ 80% | 0 / 5 |
| US | 3 trainers ≥ 80% | 0 / 3 |

---

## Open Signups Checklist

When all hard gates ✅ and seed cohort targets met:

- [ ] Remove waitlist gate from `/join` (set `waitlistEnabled: false` in `market.ts` for ae and com)
- [ ] Enable email capture on homepage hero (set `signupsEnabled: true`)
- [ ] Post on LinkedIn
- [ ] Activate Telegram bot monitoring (`@TrainedByCEO_bot` weekly digest)
- [ ] Set Google Analytics conversion goal on `/dashboard` (first login)

---

## Post-Launch Monitoring

**Daily (first 2 weeks):**
- Check Sentry for new errors
- Check `@TrainedByCEO_bot` for new leads and signups
- Review Stripe for payment failures

**Weekly:**
- Check profile completeness scores — reach out to any trainer below 60%
- Review friction log from seed cohort
- Run Lighthouse on trainedby.ae
