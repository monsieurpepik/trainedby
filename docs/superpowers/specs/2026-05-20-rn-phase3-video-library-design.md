# TrainedBy RN Phase 3 — Video Library Design Spec

## Goal

Build the video library tab and video player screen for the TrainedBy React Native app. Members browse coach video libraries, free teasers are visible to all, full libraries unlock on active subscription. Playback is via Mux HLS through `expo-video` with signed tokens for paid content.

## Architecture

**New files:**
- `app/(tabs)/library.tsx` — Library tab, Netflix-style coach rows (replaces stub)
- `app/video/[id].tsx` — Video player screen (new)
- `components/VideoCard.tsx` — Reusable video thumbnail card

**No backend changes required.** All backend is already live:
- `videos` table — `id, title, thumbnail_url, duration_seconds, is_free, mux_playback_id, trainer_id, status`
- `coach_subscriptions` table — `trainer_id, subscriber_id, status`
- `get-video-token` edge function — verifies subscription, returns signed Mux JWT for paid videos
- `create-checkout` edge function — creates Stripe Checkout session for new subscriptions

**Tech:**
- `expo-video` — Mux HLS playback (already in spec, install if missing: `expo install expo-video`)
- `expo-web-browser` — Stripe Checkout (already in spec)
- Supabase JS client — same as all other screens

---

## Screen 1: Library Tab (`app/(tabs)/library.tsx`)

### Layout

```
┌─────────────────────────────┐
│  Library            [28px]  │  ← heading, same as Home/Find
├─────────────────────────────┤
│  [avatar] Ahmed Al Rashid → │  ← coach row header, tappable
│  ┌──────┐ ┌──────┐ ┌──────┐│  ← horizontal video cards
│  │ 🔒   │ │      │ │ peek │ │
│  └──────┘ └──────┘ └──────┘│
├─────────────────────────────┤
│  [avatar] Sara Fitness    → │
│  ┌──────┐ ┌──────┐ ┌──────┐│
│  │      │ │      │ │ 🔒   │ │
│  └──────┘ └──────┘ └──────┘│
└─────────────────────────────┘
```

### Data loading

Two parallel Supabase queries on mount (`useFocusEffect` to refresh on tab re-focus):

**Query 1 — all ready videos with trainer info:**
```ts
supabase
  .from('videos')
  .select('id, title, thumbnail_url, duration_seconds, is_free, mux_playback_id, trainer_id, trainers(id, name, slug, avatar_url)')
  .eq('status', 'ready')
  .order('created_at', { ascending: false })
```

**Query 2 — user's active subscriptions:**
```ts
supabase
  .from('coach_subscriptions')
  .select('trainer_id')
  .eq('subscriber_id', session.user.id)
  .in('status', ['active', 'trialing'])
```

Both run in `Promise.all`. Results processed in-memory:
- Group videos by `trainer_id` → `Map<string, Video[]>`
- Build `Set<string>` of subscribed trainer IDs
- Each coach row knows `isSubscribed` instantly — no per-card network calls

### Coach row

- **Header**: 32px avatar circle + coach name (fontWeight 600) + "See all →" right-aligned, tappable → `router.push('/trainer/' + slug)`
- **Video list**: horizontal `FlatList`, `showsHorizontalScrollIndicator={false}`
- **Card width**: `(SCREEN_WIDTH - 48) / 2.3` — shows a peek of the third card to signal scrollability
- **Card spacing**: `gap: 10` between cards
- Unsubscribed coaches: show up to 2 `is_free` videos + 1 lock card if they have paid content
- Subscribed coaches: show all videos (max 8 in the row, "See all →" in header navigates to full list)

### Lock card

Same size as VideoCard. Dark overlay (`rgba(0,0,0,0.75)`) over a blurred thumbnail. Center: lock icon (Ionicons `lock-closed`, 24px, white) + coach subscription price below (`AED X/mo`). Tap → subscription bottom sheet.

### Subscription bottom sheet

Simple `Modal` (no extra library). Slides up from bottom on lock card tap:
- Coach avatar + name + price
- "Subscribe" button → calls `create-checkout` edge function with `{ trainer_id, price_cents }` → opens returned URL in `expo-web-browser`
- "Cancel" dismisses
- After browser closes: re-run both queries to refresh subscription state

### Empty state

Only shown if `videos` table returns zero ready videos at all (no coaches have uploaded yet). Single centered message: "No videos yet — check back soon." In practice this should never appear since coaches have existing content.

---

## Screen 2: Video Player (`app/video/[id].tsx`)

### Navigation params

```ts
{ id: string; title: string; is_free: boolean; playback_id: string }
```

All params passed from library tap — player has everything it needs to start loading immediately without an extra DB query.

### Playback flow

```
is_free = true
  → URL = `https://stream.mux.com/{playback_id}.m3u8`
  → mount expo-video immediately

is_free = false
  → POST /get-video-token  { video_id: id }  with user JWT
  → returns { token, playback_id }
  → URL = `https://stream.mux.com/{playback_id}.m3u8?token={token}`
  → mount expo-video
```

Token fetch shown as `ActivityIndicator` overlay on black screen. If token fetch fails (subscription lapsed) → show error with "Manage subscription" link.

### Layout

```
┌─────────────────────────────┐
│  [‹]              (back btn)│  ← absolute overlay, top 56
│                             │
│   expo-video (16:9 ratio)   │  ← full width, aspect ratio locked
│                             │
├─────────────────────────────┤  ← pull-up panel, same pattern as trainer profile
│  Video Title         [bold] │
│  Coach Name         [muted] │
│  Duration · free/paid badge │
│                             │
│  Description text           │
└─────────────────────────────┘
```

- Video: `width: SCREEN_WIDTH`, `height: SCREEN_WIDTH * 9/16`
- Pull-up panel: `marginTop: -24`, `borderTopLeftRadius: 24`, `borderTopRightRadius: 24`, `backgroundColor: '#0D0B0A'`
- Back button: circular overlay same as trainer profile hero
- `expo-video` `contentFit: 'cover'`, `allowsFullscreen: true`

---

## Component: VideoCard (`components/VideoCard.tsx`)

### Props
```ts
type Props = {
  video: {
    id: string;
    title: string;
    thumbnail_url: string | null;
    duration_seconds: number | null;
    is_free: boolean;
    mux_playback_id: string;
    trainer_id: string;
  };
  locked: boolean;
  onPress: () => void;
};
```

### Visual structure
- **Container**: `width: CARD_WIDTH`, `height: CARD_WIDTH * 1.4`, `borderRadius: 16`, `overflow: hidden`, `backgroundColor: '#1C1714'`
- **Thumbnail**: full-bleed `Image`, `resizeMode: 'cover'`
- **Gradient**: bottom 50% fade `['transparent', 'rgba(0,0,0,0.8)']`
- **Title**: bottom-left, 13px, fontWeight 600, white, 2 lines max
- **Duration badge**: top-right, `MM:SS` formatted, 10px, dark pill `rgba(0,0,0,0.6)`
- **Lock overlay** (when `locked`): full-card `rgba(0,0,0,0.65)` + centered `lock-closed` icon 28px white + price label below

### Duration format
```ts
function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
```

---

## Data Types

```ts
type Video = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  is_free: boolean;
  mux_playback_id: string;
  trainer_id: string;
};

type VideoTrainer = {
  id: string;
  name: string;
  slug: string;
  avatar_url: string | null;
  videos: Video[];
  isSubscribed: boolean;
};
```

---

## Gating Rules

| User state | Free video | Paid video |
|---|---|---|
| Not subscribed to coach | Play directly | Show lock card → subscribe sheet |
| Subscribed (active/trialing) | Play directly | Fetch token → play |
| Subscription lapsed | Play directly | Token fetch returns 403 → "Manage subscription" |

---

## Install Requirement

```bash
npx expo install expo-video expo-web-browser
```

`expo-web-browser` may already be installed (referenced in spec). Verify before installing.

---

## Out of Scope

- Full-screen video player landscape mode (handled by `allowsFullscreen` on `expo-video`)
- Comments or likes on videos
- Download for offline
- Coach-filtered browse (accessing via trainer profile "Browse Videos" → library tab is sufficient for MVP)
- Push notifications when new videos are uploaded
