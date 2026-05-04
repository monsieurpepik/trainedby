# Seed Cohort Runbook

White-glove onboarding for the first 5 UAE + 3 US trainers.

**Target:** 5 complete UAE profiles + 3 complete US profiles before open signups.
**Definition of complete:** profile completeness score ≥ 80% (photo + bio + Instagram + at least 1 package + cert uploaded).

---

## UAE Outreach Tracker

| Trainer | Contact | Outreach date | Status | Profile URL | Score |
|---------|---------|---------------|--------|-------------|-------|
| 1 | | | Pending | — | — |
| 2 | | | Pending | — | — |
| 3 | | | Pending | — | — |
| 4 | | | Pending | — | — |
| 5 | | | Pending | — | — |

## US Outreach Tracker

| Trainer | Contact | Outreach date | Status | Profile URL | Score |
|---------|---------|---------------|--------|-------------|-------|
| 1 | | | Pending | — | — |
| 2 | | | Pending | — | — |
| 3 | | | Pending | — | — |

---

## Outreach Script (WhatsApp / DM)

```
Hey [name], I'm building a platform that connects people looking for personal trainers with coaches like you. It's already live at trainedby.ae — I'd love to set up your profile for free as part of our launch. Takes 10 minutes on a call and I'll handle the setup. Interested?
```

---

## Onboarding Call Script (15 minutes)

**Before the call:**
- Create their account: POST to `register-trainer` edge function with their name, email, and market
- Send them the magic link manually (via `send-magic-link` function or the admin dashboard)

**During the call:**
1. Share screen — show them their profile URL already exists
2. Walk through dashboard: "this is your completeness score, here's what you need to fill in"
3. Photo: upload a professional headshot together (or get them to share one in the chat)
4. Bio: write it together — 2-3 sentences about specialty, years of experience, and target client
5. Instagram: paste their handle
6. Package: create 1 package together — name, description, price, sessions per month
7. Cert: upload their certification PDF or image

**After the call:**
- Confirm score is ≥ 80% in the admin dashboard
- Send them a follow-up with their profile URL and a sharing template

---

## "First Lead" Celebration Trigger

When a seed trainer gets their first lead:
1. The `lifecycle-email` function sends them a notification automatically
2. Follow up with a personal WhatsApp: "You just got your first lead — let me know how it goes!"
3. Log the lead in this tracker:

| Trainer | First lead date | Lead outcome |
|---------|-----------------|--------------|
| | | |

---

## Friction Log

Note anything that confused a seed trainer. These are product bugs, not user errors.

| Session | Pain point | Severity | Fix? |
|---------|------------|----------|------|
| | | | |

---

## Gate Condition

Seed cohort complete when:
- [ ] 5 UAE trainers with score ≥ 80%
- [ ] 3 US trainers with score ≥ 80%
- [ ] All 8 hard launch gates ✅ in `launch-verification.md`

→ Open signups → post on LinkedIn
