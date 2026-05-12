# GitHub Secrets Setup

## Required secrets for CI/CD

Go to: GitHub repo → Settings → Secrets and variables → Actions → New repository secret

| Secret name | Where to get it | Used by |
|-------------|-----------------|---------|
| `SUPABASE_ACCESS_TOKEN` | Supabase Dashboard → Account → Access Tokens | `edge-functions.yml` |

## Verification

After adding the secret, push any change to `supabase/functions/` on the `staging` branch.
The `Deploy Edge Functions` workflow should appear in the Actions tab and succeed.
