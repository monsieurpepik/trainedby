# Launch Verification Runbook

**Date:** 2026-05-04
**Verifier:** [name]
**Status:** IN PROGRESS

Each item must be checked manually and marked ✅ with evidence (screenshot path or command output).

---

## Hard Gates (all must pass before open signups)

### 1. Legal pages render in incognito

Open each URL in a fresh incognito window. Check: page loads, no blank content, no console errors.

| Page | URL | Status | Evidence |
|------|-----|--------|----------|
| Privacy Policy | https://trainedby.ae/privacy | ⬜ | — |
| Terms of Service | https://trainedby.ae/terms | ⬜ | — |
| Cookie Policy | https://trainedby.ae/cookie-policy | ⬜ | — |

**How to check:** Open incognito → navigate to URL → open DevTools Console → screenshot page with no errors.

---

### 2. Cookie consent banner

- [ ] Banner appears on first visit (incognito, trainedby.ae)
- [ ] Banner does not appear after accepting (reload same session)
- [ ] Banner reappears in a new incognito session

**Evidence:** Screenshot of banner on first visit.

---

### 3. Consent checkboxes on /join and lead forms

- [ ] `/join` — "I agree to terms" checkbox present and required (form doesn't submit unchecked)
- [ ] Lead form on `/[slug]` — consent checkbox present and required

**Evidence:** Screenshot of each form with checkbox visible.

---

### 4. Google Rich Results Test — trainer profile

1. Go to https://search.google.com/test/rich-results
2. Enter a live trainer profile URL (e.g., `https://trainedby.ae/sarah-al-mansoori`)
3. Verify: `Person` structured data detected, no errors

- [ ] Rich Results Test passes with no errors
- [ ] `Person` type detected

**Evidence:** Screenshot of Rich Results Test result page.

---

### 5. WhatsApp OG card

1. Open WhatsApp (mobile or web)
2. Send `https://trainedby.ae/[trainer-slug]` to yourself
3. Wait 30 seconds for link preview to generate

- [ ] Branded OG card appears (trainer name, photo, market logo)
- [ ] Not the generic fallback image

**Evidence:** Screenshot of WhatsApp link preview.

---

### 6. Stripe currency verification

Check that the payment router sends the correct currency per market.

```bash
# In Stripe Dashboard → Payments → filter by recent test payments
# Or check the payment-router edge function logs:
supabase functions logs payment-router --project-ref mezhtdbfyvkshpuplqqw | head -50
```

- [ ] `ae` market → AED currency in Stripe dashboard
- [ ] `com` market → USD currency in Stripe dashboard

**Evidence:** Screenshot of Stripe Payments dashboard showing both currencies.

---

### 7. Sentry live

- [ ] At least 1 confirmed event in Sentry dashboard
- [ ] Event is from the frontend (not a smoke test error from > 24 hours ago)

**Evidence:** Screenshot of Sentry Issues page with at least 1 event and timestamp.

---

### 8. CI pipeline blocking PRs

- [ ] Open a test PR to `staging`
- [ ] GitHub Actions CI workflow appears in the PR Checks section
- [ ] If CI fails, PR is blocked (merge button greyed out)

**Evidence:** Screenshot of PR with CI checks visible.

---

## Gate Summary

| Gate | Status | Evidence file |
|------|--------|---------------|
| Legal pages | ⬜ | — |
| Cookie consent | ⬜ | — |
| Consent checkboxes | ⬜ | — |
| Google Rich Results | ⬜ | — |
| WhatsApp OG card | ⬜ | — |
| Stripe currency | ⬜ | — |
| Sentry live | ⬜ | — |
| CI pipeline | ⬜ | — |

**All gates ✅ → open signups → LinkedIn post**
