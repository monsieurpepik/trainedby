# TrainedBy.ae — Supabase Capabilities Brief

TrainedBy leverages Supabase as a complete backend-as-a-service, utilizing its PostgreSQL database, REST APIs, Edge Functions, and Storage capabilities to deliver a fast, secure, and scalable platform for personal trainers.

## 1. Database & Schema (PostgreSQL)
The platform runs on a robust relational schema with 14 tables, ensuring data integrity and fast queries:
- **Core Entities:** `trainers`, `session_packages`, `specialties`
- **Engagement:** `reviews`, `transformations`, `checkins`
- **Lead Generation:** `leads`, `bookings`, `events`
- **System:** `magic_links`, `profile_views`, `referrals`

**Key Feature:** The database uses PostgreSQL triggers (e.g., `update_trainer_rating()`) to automatically recalculate a trainer's average rating and review count whenever a new verified review is added, ensuring the frontend always displays real-time, accurate data without complex application logic.

## 2. Edge Functions (Deno)
TrainedBy uses 10 Supabase Edge Functions to handle secure business logic, third-party integrations, and operations that shouldn't be exposed to the client:
- **Authentication:** `send-otp` and `verify-magic-link` handle passwordless login via Resend emails.
- **Profile Management:** `register-trainer` and `update-trainer` manage onboarding and profile edits.
- **Lead Capture:** `submit-lead` and `book-session` securely process client inquiries and trigger WhatsApp notifications for Pro/Premium trainers.
- **AI Integration:** `ai-bio-writer` securely calls the OpenAI API to generate professional trainer bios based on their specialties and experience.
- **Monetization:** `create-checkout` securely interfaces with Stripe to generate subscription checkout sessions based on the trainer's selected plan.

## 3. Auto-generated REST API (PostgREST)
For read-heavy, public-facing operations, the frontend directly queries the Supabase REST API, eliminating the need for custom backend endpoints:
- **Trainer Directory:** The `/find.html` page queries `/rest/v1/trainers` with client-side filtering for specialties and training modes.
- **Reviews & Transformations:** The profile page fetches verified reviews and transformation photos directly from the database using REST endpoints with built-in filtering (`verified=eq.true`).

## 4. Storage
Supabase Storage manages the `trainer-images` bucket, handling profile photos, cover images, and transformation gallery uploads. The bucket is configured for public access, allowing fast image delivery directly to the frontend.

## 5. Security & Row Level Security (RLS)
While the current implementation relies heavily on Edge Functions for write operations, the architecture supports PostgreSQL Row Level Security (RLS) to ensure trainers can only edit their own profiles and leads, providing enterprise-grade security at the database level.

## Running the Demo
A Python script (`supabase_demo.py`) has been provided to showcase these capabilities in action. It demonstrates fetching trainers, retrieving specific profiles via Edge Functions, submitting leads, fetching reviews, and generating AI bios.

Run the demo using:
```bash
python3 supabase_demo.py
```
