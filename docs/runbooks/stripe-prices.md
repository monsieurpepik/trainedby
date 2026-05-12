# Stripe Price IDs

Set these in Supabase → Project → Edge Functions → Manage secrets.

| Secret | Market | Currency | Plan |
|--------|--------|----------|------|
| `STRIPE_PRICE_PRO_MONTHLY` | ae | AED | Pro monthly |
| `STRIPE_PRICE_PRO_ANNUAL` | ae | AED | Pro annual |
| `STRIPE_PRICE_PREMIUM_MONTHLY` | ae | AED | Premium monthly |
| `STRIPE_PRICE_PREMIUM_ANNUAL` | ae | AED | Premium annual |
| `STRIPE_PRICE_COM_PRO_MONTHLY` | com | USD | Pro monthly |
| `STRIPE_PRICE_COM_PRO_ANNUAL` | com | USD | Pro annual |
| `STRIPE_PRICE_COM_PREMIUM_MONTHLY` | com | USD | Premium monthly |
| `STRIPE_PRICE_COM_PREMIUM_ANNUAL` | com | USD | Premium annual |

Create price IDs in Stripe Dashboard → Products → Add product.
When STRIPE_PRICE_COM_* secrets are not set, the com market falls back to ae (AED) prices.
