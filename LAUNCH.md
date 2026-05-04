# TrainedBy — Launch Gate

## Hard Gates

All 8 items must be ✅ before signups open. See [docs/runbooks/launch-verification.md](docs/runbooks/launch-verification.md) for evidence.

| Gate | Status | Verified by | Date |
|------|--------|-------------|------|
| Legal pages render | ⬜ | — | — |
| Cookie consent banner | ⬜ | — | — |
| Consent checkboxes on /join and lead forms | ⬜ | — | — |
| Google Rich Results Test passes | ⬜ | — | — |
| WhatsApp OG card shows trainer branding | ⬜ | — | — |
| Stripe shows correct currency per market | ⬜ | — | — |
| Sentry has ≥ 1 confirmed live event | ⬜ | — | — |
| CI pipeline blocks failing PRs | ✅ | Claude Code | 2026-05-04 |

---

## Seed Cohort Progress

See [docs/runbooks/seed-cohort.md](docs/runbooks/seed-cohort.md) for full tracker.

| Market | Target | Complete |
|--------|--------|---------|
| UAE | 5 trainers ≥ 80% | 0 / 5 |
| US | 3 trainers ≥ 80% | 0 / 3 |

---

## Open Signups Checklist

When all hard gates ✅ and seed cohort targets met:

- [ ] Remove waitlist gate from `/join` (set `waitlistEnabled: false` in `market.ts` for ae and com)
- [ ] Enable email capture on homepage hero (set `signupsEnabled: true`)
- [ ] Post on LinkedIn (draft in `docs/runbooks/seed-cohort.md`)
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

**Monthly:**
- Update METRICS.md with current counts
- Review ADR log — any decisions that need revisiting?
