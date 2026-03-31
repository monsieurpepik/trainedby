# TrainedBy.ae

**Verified personal trainer profiles for the UAE.**

A full-stack SaaS platform that gives UAE personal trainers a professional, REPs-verified profile page with WhatsApp lead capture, session packages, fitness assessment tool, and analytics dashboard.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML/CSS/JS + Tailwind CSS |
| Backend | Supabase (Postgres + Deno Edge Functions) |
| Auth | Magic link via email (Resend) |
| Payments | Stripe (subscriptions) |
| Email | Resend |
| Hosting | Netlify (frontend) + Supabase (backend) |
| Storage | Supabase Storage (trainer images) |

---

## Pages

| File | URL | Description |
|---|---|---|
| `landing.html` | `/` | Marketing homepage |
| `index.html` | `/:slug` | Public trainer profile page |
| `join.html` | `/join` | Trainer onboarding flow |
| `edit.html` | `/edit` | Profile editor (auth required) |
| `dashboard.html` | `/dashboard` | Analytics & leads (auth required) |
| `pricing.html` | `/pricing` | Pricing plans |

---

## Deploy in 5 Steps

### Step 1 — Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `sql/001_schema.sql`
3. Go to **Storage** → create a bucket called `trainer-images` (set to **Public**)
4. Copy your **Project URL** and **anon key** from Settings → API
5. Copy your **service role key** from Settings → API (keep this secret)

### Step 2 — Resend

1. Create an account at [resend.com](https://resend.com)
2. Add and verify your domain (`trainedby.ae`)
3. Create an API key and copy it

### Step 3 — Stripe

1. Create products in your Stripe dashboard:
   - **Pro Monthly** — AED 99/mo recurring
   - **Pro Annual** — AED 948/yr recurring
   - **Premium Monthly** — AED 199/mo recurring
   - **Premium Annual** — AED 1,908/yr recurring
2. Copy the Price IDs for each product
3. Set up a webhook pointing to your Supabase edge function URL:
   `https://your-project-ref.supabase.co/functions/v1/stripe-webhook`
   - Events to listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

### Step 4 — Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Set secrets (from .env)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
supabase secrets set RESEND_API_KEY=...
supabase secrets set STRIPE_SECRET_KEY=...
supabase secrets set STRIPE_WEBHOOK_SECRET=...
supabase secrets set STRIPE_PRICE_PRO_MONTHLY=...
supabase secrets set STRIPE_PRICE_PRO_ANNUAL=...
supabase secrets set STRIPE_PRICE_PREMIUM_MONTHLY=...
supabase secrets set STRIPE_PRICE_PREMIUM_ANNUAL=...
supabase secrets set ADMIN_EMAIL=hello@trainedby.ae
supabase secrets set IP_HASH_SALT=your-random-string

# Deploy all edge functions
supabase functions deploy send-magic-link
supabase functions deploy verify-magic-link
supabase functions deploy get-trainer
supabase functions deploy update-trainer
supabase functions deploy register-trainer
supabase functions deploy submit-lead
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy verify-reps
supabase functions deploy weekly-stats
```

### Step 5 — Deploy Frontend to Netlify

1. Push this repo to GitHub
2. Connect to [Netlify](https://netlify.com)
3. Set build settings:
   - **Build command:** `npm run build` (or leave blank for static)
   - **Publish directory:** `.`
4. Add environment variables in Netlify dashboard:
   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_ANON_KEY` — your Supabase anon key
5. Point your domain `trainedby.ae` to Netlify

---

## Update SUPABASE_URL in HTML files

Before deploying, replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` in all HTML files with your actual values. Or use a build script:

```bash
# Quick find-and-replace
find . -name "*.html" -exec sed -i 's/YOUR_SUPABASE_URL/https:\/\/your-project-ref.supabase.co/g' {} \;
find . -name "*.html" -exec sed -i 's/YOUR_SUPABASE_ANON_KEY/your-anon-key/g' {} \;
```

---

## Edge Functions Reference

| Function | Method | Auth | Description |
|---|---|---|---|
| `send-magic-link` | POST | None | Send sign-in email |
| `verify-magic-link` | POST | None | Verify token, return trainer |
| `get-trainer` | GET | None | Public trainer profile + packages |
| `register-trainer` | POST | None | Create new trainer account |
| `update-trainer` | POST | Bearer token | Save profile changes |
| `submit-lead` | POST | None | Submit lead from profile |
| `create-checkout` | POST | Bearer token | Create Stripe checkout session |
| `stripe-webhook` | POST | Stripe sig | Handle Stripe events |
| `verify-reps` | POST | Bearer token | Submit REPs verification request |
| `weekly-stats` | GET | Bearer token | Dashboard analytics |

---

## Pricing

| Plan | Price | Key Features |
|---|---|---|
| **Free** | AED 0/mo | Profile, REPs badge, 3 packages, basic analytics |
| **Pro** | AED 99/mo | Unlimited packages, WhatsApp notifications, priority search, gallery |
| **Premium** | AED 199/mo | Up to 5 profiles, gym page, featured spotlight |

---

## Roadmap

- [ ] Arabic language support
- [ ] Trainer search / directory page
- [ ] Online booking with calendar integration
- [ ] Nutrition plan builder
- [ ] Client progress tracking portal
- [ ] Custom domain support (Premium)
- [ ] trainedby.com global expansion

---

## License

Private — all rights reserved. Built for TrainedBy.ae.
