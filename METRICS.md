# TrainedBy — Platform Metrics

*Updated: 2026-05-04. Query Supabase to refresh.*

---

## Platform

| Metric | Value |
|--------|-------|
| Markets live | 10 domains |
| Languages | 4 (EN, FR, IT, ES) |
| Payment providers | 2 (Stripe, Razorpay) |
| Edge functions deployed | 55 |

## Traction

| Metric | Value |
|--------|-------|
| Trainer profiles | [query: SELECT COUNT(*) FROM trainers] |
| Leads captured | [query: SELECT COUNT(*) FROM leads] |
| Active markets (≥1 trainer) | [query: SELECT COUNT(DISTINCT market) FROM trainers] |

## Infrastructure

| Service | Plan | Region |
|---------|------|--------|
| Supabase | Pro | ap-southeast-1 |
| Netlify | Pro | Global CDN |
| Sentry | Developer | US |
| Resend | Scale | Global |

## Performance

*Run Lighthouse on https://trainedby.ae to refresh.*

| Page | LCP | CLS | FCP |
|------|-----|-----|-----|
| Trainer profile | — | — | — |
| /join | — | — | — |
| /dashboard | — | — | — |

## How to Refresh

```bash
# Trainer count
supabase db query "SELECT COUNT(*) FROM trainers" --project-ref mezhtdbfyvkshpuplqqw

# Leads count
supabase db query "SELECT COUNT(*) FROM leads" --project-ref mezhtdbfyvkshpuplqqw
```
