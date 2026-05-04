# Sentry Setup

## Status
Code is fully wired. Only env vars need to be set.

## Step 1 — Create a Sentry project
1. Go to sentry.io → New Project → JavaScript (Astro)
2. Note your DSN (format: `https://xxx@oNNN.ingest.sentry.io/NNN`)

## Step 2 — Set env vars in Netlify
Go to: Netlify → Site → Environment variables → Add

| Variable | Value |
|----------|-------|
| `PUBLIC_SENTRY_DSN` | Your Sentry DSN from step 1 |
| `SENTRY_AUTH_TOKEN` | Sentry → Settings → Auth Tokens → Create new token (scope: `project:releases`, `org:read`) |

Trigger a redeploy after setting these.

## Step 3 — Set env vars in Supabase
Go to: Supabase Dashboard → Project → Edge Functions → Manage secrets

| Secret | Value |
|--------|-------|
| `SENTRY_DSN` | Same DSN from step 1 |

## Step 4 — Smoke test (frontend)
1. Open trainedby.ae in a browser
2. Open DevTools Console
3. Run: `throw new Error("Sentry smoke test")`
4. Check Sentry dashboard → Issues → confirm the error appears within 30 seconds

## Step 5 — Smoke test (edge function)
1. Call the health edge function: `curl https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1/health`
2. Check Sentry dashboard → Issues for any edge function errors from the past hour

## Evidence
Screenshot the Sentry Issues page showing at least 1 event. Save it as `docs/runbooks/sentry-evidence.png`.
