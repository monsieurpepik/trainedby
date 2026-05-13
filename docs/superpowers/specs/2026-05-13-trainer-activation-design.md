# Trainer Activation — Production Readiness Spec (Option B)

**Date:** 2026-05-13  
**Goal:** A UAE trainer who joins trainedby.ae can complete their profile and have a working, shareable page within 5 minutes — without hitting a broken link, a missing field, or a dashboard that lies to them.  
**Milestone:** First 10 real REPs UAE trainers (seed cohort). Waitlist still on.

---

## Scope

13 identified bugs across 4 categories. This spec addresses all of them in a single cohesive implementation.

| # | Bug | Category |
|---|-----|----------|
| 1 | After join, trainer sees success screen but clicking "Complete Profile" requires re-authentication | Broken flow |
| 2 | `join.astro` inserts trainer directly — no market stored, no welcome email, no CEO notification | Broken flow |
| 3 | `verify-magic-link` CORS only allows `trainedby.ae` — dashboard broken for all other markets | Broken flow |
| 4 | `join.astro` line 318 links to `/edit.html` — 404 | Broken flow |
| 5 | `dashboard.astro` line 1146 links to `/edit.html` — 404 | Broken flow |
| 6 | WhatsApp/phone not editable in `/edit` | Data gap |
| 7 | City not editable in `/edit` | Data gap |
| 8 | `update-trainer` doesn't accept phone, whatsapp, or city | Data gap |
| 9 | `verify-magic-link` returns minimal `safeTrainer` — bio, instagram, packages, city missing | Dashboard lies |
| 10 | Packages checklist always false (packages not in safeTrainer) | Dashboard lies |
| 11 | "Profile shared" hardcoded to `false` with no completion logic | Dashboard lies |
| 12 | New trainer arrives on /edit with no welcome signal — no prompt to add photo first | UX hole |
| 13 | Welcome email never fires from current join flow | UX hole |

---

## Architecture

### The Join → Edit Pipeline (Bugs 1, 2, 4, 13)

**Current flow:**
```
join.astro → OTP verify → sb.from('trainers').insert() [direct] → show success screen
                                                                        ↓
                                                        "Complete Profile" → /dashboard (no auth)
                                                                        ↓
                                                        dashboard shows "Sign In" screen
```

**Target flow:**
```
join.astro → OTP verify → sb.from('trainers').insert() [+ market field]
                                                     ↓
                                    create magic_links token (15 min)
                                                     ↓
                                    call lifecycle-email (type:'welcome') fire-and-forget
                                                     ↓
                                    call CEO agent notify fire-and-forget
                                                     ↓
                                    window.location.href = '/edit?token=TOKEN&new=1'
```

The edit page already handles `?token=` — it calls `verify-magic-link`, gets a session, populates the form. Adding `?new=1` triggers a welcome banner on the edit page: "You're live! Add a photo so clients can find you."

**No change to register-trainer edge function.** The direct insert in join.astro is fine — it's simpler. We just need to add the post-insert steps that were missing.

### CORS Fix (Bug 3)

`verify-magic-link` ALLOWED_ORIGINS must include all market domains. Import `MARKET_DOMAINS` from `_shared/market_url.ts` and spread them:

```typescript
import { MARKET_DOMAINS } from '../_shared/market_url.ts';

const ALLOWED_ORIGINS = [
  ...Object.values(MARKET_DOMAINS),
  'http://localhost:3000',
  'http://localhost:4323',
  'http://127.0.0.1:5500',
  ...(Deno.env.get('STAGING_URL') ? [Deno.env.get('STAGING_URL')!] : []),
];
```

### safeTrainer Expansion (Bug 9, 10)

`verify-magic-link` returns a `safeTrainer` with only 8 fields. Dashboard checklist, edit form pre-population, and profile completeness all need more.

**New safeTrainer:**
```typescript
const safeTrainer = {
  // identity
  id: trainer.id,
  slug: trainer.slug,
  name: trainer.name,
  email: trainer.email,
  title: trainer.title,
  plan: trainer.plan,
  // verification
  reps_verified: trainer.reps_verified,
  reps_number: trainer.reps_number,
  verification_status: trainer.verification_status,
  // profile content (needed for checklist + edit form)
  avatar_url: trainer.avatar_url,
  bio: trainer.bio,
  city: trainer.city,
  instagram: trainer.instagram,
  specialties: trainer.specialties,
  accepting_clients: trainer.accepting_clients,
  // contact (needed for edit form)
  phone: trainer.phone,
  whatsapp: trainer.whatsapp,
  // completeness signal
  packages_count: 0,  // filled in below via separate query
};

// Fetch packages count — cheap, single query, needed for checklist
const { count: pkgCount } = await sb
  .from('session_packages')
  .select('id', { count: 'exact', head: true })
  .eq('trainer_id', trainer.id);
safeTrainer.packages_count = pkgCount ?? 0;
```

Fields excluded from safeTrainer (never exposed to browser): `stripe_customer_id`, `stripe_connect_id`, `service_role_key`, `magic_link_token`, `ip_hash`.

### Edit Page: Phone + City Fields (Bugs 6, 7, 12)

Add two fields in `/edit` between the existing "Instagram" row and the "Availability" section:

**WhatsApp number** — text input, pre-filled from `t.whatsapp || t.phone`. Hint: "This is the number clients tap to contact you."

**City** — text input, pre-filled from `t.city`. Hint: "Shown on your profile as your location."

For new trainers (`?new=1`), render a yellow banner at the top of the edit form:
```
"Your profile is live. Add a photo and your location so clients can find you."
[link: View my profile →]
```
This banner is dismissed once avatar_url is set (checked on save).

### update-trainer: Accept Phone + City (Bug 8)

Add to the `fields` array:
```typescript
const fields = [
  "name","title","bio","years_experience","clients_trained",
  "specialties","accepting_clients","instagram","tiktok","youtube",
  "phone","whatsapp","city",   // ← new
  "training_modes","video_intro_url"  // ← also missing currently
];
```

Also add `training_modes` and `video_intro_url` — they are sent by `saveAll()` in edit.astro but silently dropped by update-trainer. Trainer's availability toggle and video intro never save.

### Dashboard Checklist Fixes (Bugs 10, 11)

**Packages:** Replace `t.packages && t.packages.length > 0` with `t.packages_count > 0`. Since safeTrainer now includes `packages_count`, this works without a separate fetch.

**"Profile shared":** Replace with "Share your link" — mark done when `packages_count > 0 && avatar_url`. This is a reasonable proxy: a trainer with a photo and packages has built a real profile worth sharing. The checklist becomes a completion flow, not a tracking pixel.

Updated checklist items:
```javascript
const items = [
  { label: 'Profile photo added',     done: !!t.avatar_url,          action: '/edit', actionLabel: 'Add' },
  { label: 'Location set',            done: !!t.city,                 action: '/edit', actionLabel: 'Set' },
  { label: 'Bio written',             done: !!(t.bio?.length > 30),   action: '/edit', actionLabel: 'Write' },
  { label: 'Session packages added',  done: t.packages_count > 0,     action: '/edit', actionLabel: 'Add' },
  { label: 'REPs UAE verified',       done: !!t.reps_verified,        action: '/edit', actionLabel: 'Verify' },
  { label: 'Share your profile link', done: !!(t.avatar_url && t.packages_count > 0), action: null },
];
```

### Fix Broken Links (Bugs 4, 5)

| File | Line | From | To |
|------|------|------|----|
| `src/pages/join.astro` | 318 | `/edit.html` | `/edit` |
| `src/pages/dashboard.astro` | 1146 | `/edit.html` | `/edit` |

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/join.astro` | Add market to payload; post-insert: create token, fire-and-forget email + CEO notify, redirect to `/edit?token=TOKEN&new=1`; fix `/edit.html` → `/edit` |
| `src/pages/edit.astro` | Add phone/city fields; `populateForm()` reads phone/whatsapp/city; `saveAll()` sends phone/city; welcome banner for `?new=1` |
| `src/pages/dashboard.astro` | Fix `/edit.html` link; update checklist to use `packages_count`; replace "Profile shared" item |
| `supabase/functions/update-trainer/index.ts` | Add `phone`, `whatsapp`, `city`, `training_modes`, `video_intro_url` to fields array |
| `supabase/functions/verify-magic-link/index.ts` | Expand ALLOWED_ORIGINS; expand safeTrainer; add packages_count query |

---

## Data Flow Diagrams

### Join → Edit (Happy Path)
```
Trainer fills form → OTP email → enters code
  → sb.insert({ ..., market: 'ae' })
  → sb.insert into magic_links (token, 15min, trainer_id)
  → fetch lifecycle-email { type: 'welcome', trainer_id } [fire-and-forget]
  → fetch ceo-agent/notify [fire-and-forget]
  → redirect: /edit?token=TOKEN&new=1

/edit loads:
  → reads ?token from URL
  → POST verify-magic-link { token }
    → mark token used
    → issue session token (30d cookie)
    → return safeTrainer (with bio, city, phone, packages_count, ...)
  → populateForm(safeTrainer)
  → show welcome banner (new=1)
  → trainer adds photo, city, packages → Save
    → POST update-trainer { ..., city, phone, whatsapp }
```

### Dashboard Auth (All Markets)
```
Trainer on coachepar.fr → /dashboard
  → reads tb_session cookie (set by previous verify-magic-link)
  → POST verify-magic-link [origin: https://coachepar.fr]
    → CORS check: coachepar.fr ∈ ALLOWED_ORIGINS ✓ (after fix)
    → return safeTrainer
  → buildChecklist uses safeTrainer.packages_count, .bio, .city, .avatar_url ✓
```

---

## Error Handling

**Join post-insert failures are non-fatal:** If token creation fails, redirect to `/dashboard` (existing flow) instead of `/edit?token=...`. Trainer will need to request a magic link but their profile is still created.

**verify-magic-link CORS fallback:** If origin is not in ALLOWED_ORIGINS, still allow the request but set `Access-Control-Allow-Origin: null`. This prevents CORS errors from blocking non-browser clients (Telegram bot, CEO agent) while maintaining security for browser-based logins.

**update-trainer unknown fields:** Fields not in the allowlist are silently ignored. Adding new fields to the list is backward-compatible.

---

## Testing

Each fix has a corresponding regression test target:

| Fix | Test |
|-----|------|
| Auto-login after join | `tests/e2e/join.spec.ts`: after completing join, URL should be `/edit` with no auth gate visible |
| Market stored | SQL check: `trainers.market IS NOT NULL` for all records post-fix |
| CORS all markets | `profile.spec.ts`: add verify-magic-link request from fr/it/es origins |
| safeTrainer fields | Dashboard checklist renders correctly — extend `profile.spec.ts` |
| Phone/city editable | `edit.spec.ts`: fill phone + city, save, reload, values persist |
| Packages checklist | `profile.spec.ts`: after adding a package, checklist item goes green |
| Broken links | `profile.spec.ts`: all `/edit.html` references return 404 check |

---

## Out of Scope (Option C)

- WhatsApp lead notification to trainer (when client taps CTA)
- Profile view counter on dashboard
- First-week email sequence (days 1, 3, 7 post-join)
- "Profile shared" tracking via link analytics
- Trainer engagement health score
