# TrainedBy — Current Sprint Roadmap

> Execution order: top to bottom. Check off as done.

---

## Quick Fixes (code polish)

- [ ] **QF-1** `blog.astro` — body still using `font-family: 'Inter'` (missed in DM Sans sweep)
- [ ] **QF-2** `find.astro` + `find/[city].astro` — hardcoded "TrainedBy" brand in nav/top bar
- [ ] **QF-3** `landing.astro` — dead `.footer-cta` CSS block never renders; remove "Community" link from footer

---

## Launch Gates

- [ ] **Gate 5** — WhatsApp OG card: add `og:image` to trainer profile pages so shared links preview with trainer photo + name
- [ ] **Gate 6** — Stripe currency per market: verify checkout creates sessions in AED/GBP/USD/EUR/MXN based on `market`

---

## UX Improvements

- [ ] **UX-1** Join page — multi-step progress indicator (step 1/3), inline cert number validation, success state shows live profile URL
- [ ] **UX-2** MX market config — verify `market.ts` has full `mx` entry (certBody, currency, paymentEnabled, etc.)

---

## Revenue Execution

- [ ] **REV-1** UAE trainer outreach — draft cold DM / WhatsApp template for 10 REPs UAE trainers (free Pro 90-day offer)
- [ ] **REV-2** UAE corporate wellness — one-pager pitch template for HR/office managers

---

## Completed

*(items move here when done)*
