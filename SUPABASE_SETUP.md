# TrainedBy.ae — Complete Supabase Setup Guide

This guide will walk you through setting up the backend for **TrainedBy.ae** using Supabase. By the end of this guide, your database, storage, authentication, and edge functions will be fully configured and ready to connect to your frontend.

---

## Step 1: Create Your Supabase Project

1. Go to [Supabase](https://supabase.com) and sign in or create an account.
2. Click **New Project** and select your organization.
3. Enter a project name (e.g., `TrainedBy`).
4. Generate a strong database password and save it somewhere safe.
5. Choose a region closest to your target audience (e.g., **Middle East (Bahrain)** is ideal for the UAE).
6. Click **Create new project**. It will take a few minutes for the database to provision.

---

## Step 2: Get Your API Keys

Once your project is ready, you need to gather three essential keys.

1. In the Supabase dashboard, go to **Project Settings** (the gear icon at the bottom of the left sidebar).
2. Click on **API** under the Configuration section.
3. Copy the following values and paste them into your `.env` file (based on the `.env.example` provided in the codebase):
   - **Project URL** (e.g., `https://xyz.supabase.co`) $\rightarrow$ `SUPABASE_URL`
   - **Project API Keys $\rightarrow$ anon / public** $\rightarrow$ `SUPABASE_ANON_KEY`
   - **Project API Keys $\rightarrow$ service_role / secret** $\rightarrow$ `SUPABASE_SERVICE_ROLE_KEY`

> **Warning:** Never expose your `service_role` key in the frontend code. It bypasses all security rules and should only be used inside Edge Functions.

---

## Step 3: Run the SQL Schema

Your database needs tables for trainers, leads, packages, and analytics. The schema also includes Row Level Security (RLS) policies to keep data safe.

1. In the Supabase dashboard, go to the **SQL Editor** (the `</>` icon in the left sidebar).
2. Click **New query**.
3. Open the `sql/001_schema.sql` file from the TrainedBy codebase.
4. Copy the entire contents of the file and paste it into the SQL Editor.
5. Click **Run** (or press `Cmd/Ctrl + Enter`).

You should see a "Success" message. This script creates all necessary tables, indexes, RLS policies, and even inserts a sample trainer profile (`sarah`) so you can test the frontend immediately.

---

## Step 4: Set Up Storage for Images

Trainers will upload profile pictures and transformation gallery images. These need a place to live.

1. In the Supabase dashboard, go to **Storage** (the folder icon in the left sidebar).
2. Click **New Bucket**.
3. Name the bucket exactly: `trainer-images`
4. **Crucial:** Toggle the **Public bucket** switch to ON. (If it's not public, images won't load on the website).
5. Click **Save**.

The Edge Functions are already coded to upload images to this specific bucket and generate public URLs.

---

## Step 5: Deploy Edge Functions

TrainedBy uses Supabase Edge Functions to handle secure operations like sending magic links, processing Stripe payments, and updating profiles.

You will need the [Supabase CLI](https://supabase.com/docs/guides/cli) installed on your computer.

### 1. Login and Link

Open your terminal in the `trainedby` project folder and run:

```bash
# Log in to your Supabase account
supabase login

# Link the local project to your remote Supabase project
# (You can find your project reference ID in the Project Settings -> General -> Reference ID)
supabase link --project-ref your-project-ref
```

### 2. Set Environment Secrets

Edge functions need access to third-party APIs (Stripe, Resend). Run these commands in your terminal, replacing the placeholder values with your actual keys:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
supabase secrets set RESEND_API_KEY=re_your_resend_key
supabase secrets set STRIPE_SECRET_KEY=sk_live_your_stripe_key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
supabase secrets set STRIPE_PRICE_PRO_MONTHLY=price_xxx
supabase secrets set STRIPE_PRICE_PRO_ANNUAL=price_xxx
supabase secrets set STRIPE_PRICE_PREMIUM_MONTHLY=price_xxx
supabase secrets set STRIPE_PRICE_PREMIUM_ANNUAL=price_xxx
supabase secrets set ADMIN_EMAIL=hello@trainedby.ae
supabase secrets set IP_HASH_SALT=a_random_secure_string
```

### 3. Deploy the Functions

Deploy all 10 functions to your project:

```bash
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

---

## Step 6: Configure the Stripe Webhook

To automatically upgrade trainers when they pay, Stripe needs to talk to your Supabase Edge Function.

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com).
2. Navigate to **Developers** $\rightarrow$ **Webhooks**.
3. Click **Add an endpoint**.
4. Set the Endpoint URL to: `https://[YOUR_PROJECT_REF].supabase.co/functions/v1/stripe-webhook`
5. Select the following events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
6. Click **Add endpoint**.
7. Reveal the **Signing secret** (it starts with `whsec_`).
8. If you didn't set this in Step 5, update your Supabase secrets now:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_new_secret
   ```

---

## Step 7: Connect the Frontend

Finally, tell your HTML files where to find your Supabase project.

1. Open the `trainedby` folder in your code editor.
2. You need to replace the placeholder strings `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` in all `.html` files and in `js/config.js`.
3. You can do this manually, or run this command in your terminal (macOS/Linux):

```bash
find . -name "*.html" -exec sed -i '' 's|YOUR_SUPABASE_URL|https://your-project-ref.supabase.co|g' {} +
find . -name "*.html" -exec sed -i '' 's|YOUR_SUPABASE_ANON_KEY|your-actual-anon-key|g' {} +
sed -i '' 's|YOUR_SUPABASE_URL|https://your-project-ref.supabase.co|g' js/config.js
sed -i '' 's|YOUR_SUPABASE_ANON_KEY|your-actual-anon-key|g' js/config.js
```

*(Note: If you are on Windows or using a different terminal, a global find-and-replace in VS Code is the easiest method).*

---

## 🎉 You're Done!

Your backend is now fully operational. 

You can test the flow by opening `landing.html` in your browser, clicking "Get Your Page", and walking through the onboarding flow. The magic link will be sent via Resend, and the data will appear in your Supabase tables.
