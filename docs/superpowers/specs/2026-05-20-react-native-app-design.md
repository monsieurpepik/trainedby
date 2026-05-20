# TrainedBy React Native App — Design Spec

## Goal

A native iOS + Android app for TrainedBy that serves both members (daily check-ins, video library, live streaming) and coaches (club dashboard, shoutouts). Built on Expo managed workflow, connecting to the existing Supabase backend with no new backend work required for MVP.

## Architecture

**Stack:**
- Expo SDK 52, Expo Router v3, TypeScript
- `@supabase/supabase-js` — same client as web
- `expo-video` — Mux HLS playback
- `expo-secure-store` — session persistence
- `expo-auth-session` — Google OAuth
- `expo-web-browser` — Stripe Checkout (live drops)
- EAS Build (cloud compilation), EAS Submit (store delivery)

**Repo:** `trainedby-app/` — new directory alongside the web repo. Calls the same Supabase project (`mezhtdbfyvkshpuplqqw`) and same edge functions. No shared build tooling with the web.

**Routing:** Expo Router v3 file-based routing. Routes mirror web URL structure where practical.

**Coach detection:** After session loads, query `trainers.eq('email', user.email)`. If a row exists, `isCoach = true` in a global React context. Coach flag swaps the "Find" tab for "My Club" tab and unlocks coach dashboard screens.

## Navigation Structure

```
app/
  _layout.tsx               Root layout — auth gate, session provider, coach context
  auth/
    login.tsx               Email + Google OAuth sign-in
    signup.tsx              New user registration
  (tabs)/
    _layout.tsx             Bottom tab bar (member: Home/Find/Library/Live/Profile)
    index.tsx               Home — enrolled clubs, streak summary, upcoming live today
    find.tsx                Browse coaches — card grid, search, infinite scroll
    library.tsx             Video library — all videos from subscribed coaches
    live.tsx                Active live sessions right now
    coach.tsx               Coach dashboard tab (replaces Find for coaches)
    profile.tsx             Auth state, sign out, notification prefs
  club/
    [id].tsx                Club detail — today's mission, check-in button, streak leaderboard
  trainer/
    [slug].tsx              Trainer profile — bio, clubs, video link, subscribe button
  live/
    [id].tsx                Live watch — Mux HLS player, chat, attendee count, drop bar
  video/
    [id].tsx                VOD player — signed Mux token, title, description
  coach/
    shoutout.tsx            Send shoutout to whole club
```

## Screen Inventory

### Member screens

| Screen | Key behaviour |
|--------|--------------|
| Home `(tabs)/index` | Lists clubs user is enrolled in (from `club_members`), streak for each, any live sessions starting today |
| Find `(tabs)/find` | Paginated coach cards (20 at a time), search by name/specialty, tap → `trainer/[slug]` |
| Library `(tabs)/library` | Videos from all coaches the user subscribes to; filter by trainer; free videos visible to all |
| Live `(tabs)/live` | `live_sessions` with status=live; attendee count; Join button → `live/[id]` |
| Profile `(tabs)/profile` | Signed-in state, display name, sign out; link to manage subscription on web |
| Club detail `club/[id]` | Today's mission text, Check In button (calls `check-in` edge function), public streak leaderboard, season number and day counter |
| Trainer profile `trainer/[slug]` | Bio, stats, active clubs, Subscribe button (opens Stripe Checkout via `expo-web-browser`), Browse Videos button → `library` tab pre-filtered to this trainer |
| Live watch `live/[id]` | `expo-video` HLS stream (signed token from `join-live-session`), Supabase Realtime chat, attendee count, LiveDropBar (claim button → Stripe via `expo-web-browser`) |
| Video player `video/[id]` | `expo-video` with signed token from `get-video-token`; free videos use public URL (no token fetch) |

### Coach screens (replaces Find tab)

| Screen | Key behaviour |
|--------|--------------|
| Coach dashboard `(tabs)/coach` | Member list with today's check-in status (green/grey), total checked in today vs total members |
| Shoutout `coach/shoutout` | Calls shoutout edge function, confirmation toast, back to dashboard |

### Auth screens

| Screen | Key behaviour |
|--------|--------------|
| Login `auth/login` | Email/password + Google OAuth via `expo-auth-session`; on success → Home |
| Signup `auth/signup` | Email/password registration; on success → Home |

## Data Flow

### Auth
- `supabase.auth.signInWithPassword()` / `signInWithOAuth({ provider: 'google' })`
- Session stored via custom `expo-secure-store` storage adapter passed to `createClient()`
- App load: `supabase.auth.getSession()` → if valid session, skip login screen
- Trainer detection: query `trainers.eq('email', session.user.email)` once after login; store result in React context

### Club check-in
- `POST` to `check-in` edge function with `{ clubId }`
- Optimistic UI: increment streak display immediately, revert on error
- Refetch club data on screen focus (`useFocusEffect`)

### Video playback
1. If `video.is_free`: play `https://stream.mux.com/{playbackId}.m3u8` directly
2. If paid: `GET /get-video-token?videoId={id}` → signed JWT
3. `expo-video` source: `https://stream.mux.com/{playbackId}.m3u8?token={jwt}`

### Live watch
1. `GET /join-live-session?sessionId={id}` → signed playback token (4h) + session metadata
2. `expo-video` plays Mux live HLS stream
3. Supabase Realtime broadcast `chat:{sessionId}` → 50-message rolling buffer
4. Supabase Realtime broadcast `drops:{sessionId}` → tier_update events → drop bar
5. Claim spot → `POST /claim-live-drop-spot` → returns Stripe Checkout URL → `expo-web-browser.openBrowserAsync(url)`

### Stripe / subscriptions
- All payment flows open Stripe Checkout in `expo-web-browser` (no in-app purchase)
- After browser closes, refetch subscription status to update gating

### Pagination
- All list screens use Supabase `.range(offset, offset + 19)` cursor
- `FlatList onEndReached` triggers next page fetch
- Loading state shown as footer spinner

## Out of Scope (post-MVP)

- Going live from phone camera (coach RTMP streaming)
- Push notifications (daily mission reminders, live session alerts)
- In-app payments via Apple Pay / Google Pay
- Offline mode / downloaded videos
- Android TV / Apple TV

## Testing

- Manual smoke test on iOS Simulator and Android Emulator via `expo start`
- EAS Build for device testing before store submission
- No automated tests in MVP — validate golden paths manually: sign in, join club, check in, watch video, join live session
