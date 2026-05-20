# TrainedBy RN Phase 4 — Live Streaming Design Spec

## Goal

Build the live streaming tab and watch screen for the TrainedBy React Native app. Members browse active sessions, join via a signed Mux token, watch HLS video, chat in real time, and claim limited season drop spots during the stream. No backend changes required — all edge functions and tables are already live.

## Architecture

**New/replaced files:**
- `app/(tabs)/live.tsx` — replaces stub; lists active sessions
- `app/live/[id].tsx` — watch screen; video + chat + drop bar
- `components/LiveDropBar.tsx` — isolated animated drop bar component

**No backend changes.** All infrastructure is live:
- `live_sessions` table — `id, trainer_id, club_id, title, mux_playback_id, status, is_season_drop, drop_tiers, starts_at`
- `live_attendees` table — tracks who joined
- `live_drop_claims` table — tracks claimed spots
- `join-live-session` edge function — verifies access, returns signed playback token
- `claim-live-drop-spot` edge function — returns Stripe Checkout URL
- Supabase Realtime broadcast — `chat:{sessionId}` and `drops:{sessionId}` channels

**Tech:**
- `expo-video` 3.0.16 — HLS playback (already installed)
- `expo-web-browser` 15.0.11 — Stripe Checkout (already installed)
- `react-native` `Animated` — drop bar slide animation (no extra library)
- Supabase JS client — Realtime channels

---

## Screen 1: Live Tab (`app/(tabs)/live.tsx`)

### Layout

```
┌─────────────────────────────┐
│  Live                       │  ← 28px heading
├─────────────────────────────┤
│ [●LIVE] [avatar] Coach Name │
│  Session title              │
│  42 watching    [  Join  ]  │
├─────────────────────────────┤
│ [●LIVE] [avatar] ...        │
└─────────────────────────────┘
```

### Data loading

`useFocusEffect` triggers load on tab focus. Additionally, a `setInterval` every 30 seconds refreshes the list to catch newly started sessions. Interval cleared on unmount.

```ts
supabase
  .from('live_sessions')
  .select('id, title, is_season_drop, starts_at, trainers(id, name, slug, avatar_url)')
  .eq('status', 'live')
  .order('starts_at', { ascending: false })
```

Attendee count: separate query per session is too expensive. Instead, select `live_attendees(count)` as an aggregate in the join:

```ts
.select('id, title, is_season_drop, starts_at, trainers(name, avatar_url), live_attendees(count)')
```

### Session card

- Left: coach avatar (32px circle) + coach name (14px, white) + session title (16px, fontWeight 600, white)
- Live indicator: 8px pulsing red dot (`Animated.loop` opacity 1→0.3) + "LIVE" text (10px, red, letterSpacing 1.5)
- Season drop badge: if `is_season_drop`, small orange "🔥 Drop" pill
- Right: attendee count (12px, muted) + "Join" button (orange, pill shape)
- Tap anywhere on card → `router.push('/live/' + session.id)`

### Empty state

"No live sessions right now — check back soon." centered, muted text.

---

## Screen 2: Watch Screen (`app/live/[id].tsx`)

### Join flow

On mount:
1. `POST /join-live-session` with `{ live_session_id: id }` + user JWT
2. Response: `{ playback_token, mux_playback_id, title, trainer_name, is_season_drop, drop_tiers }`
3. Build HLS URL: `https://stream.mux.com/{mux_playback_id}.m3u8?token={playback_token}`
4. Init `expo-video` player with null → `player.replace(url)` → `player.play()`
5. Subscribe to Realtime channels (see below)

Error cases:
- `session_not_live` → show "This session has ended" with back button
- `Unauthorized` / subscription check fail → show "Subscribe to join live sessions" with back link to trainer profile

### Layout

```
┌─────────────────────────────┐
│ [‹]                         │  ← back button overlay, top 56
│                             │
│     expo-video  (16:9)      │
│                             │
│  Coach Name · Session Title │  ← gradient overlay at video bottom
├─────────────────────────────┤
│  Chat messages (FlatList)   │
│  scrolls to bottom on new   │
│  message                    │
│                             │
├─────────────────────────────┤
│ [  Type a message...  ] [→] │  ← KeyboardAvoidingView
└─────────────────────────────┘
         ↑ LiveDropBar slides up from here when active
```

### Chat — Realtime

Subscribe on mount, unsubscribe on unmount:

```ts
const chatChannel = supabase.channel(`chat:${id}`)
  .on('broadcast', { event: 'message' }, ({ payload }) => {
    setMessages(prev => {
      const next = [...prev, payload];
      return next.length > 50 ? next.slice(-50) : next;
    });
  })
  .subscribe();
```

Send message:

```ts
chatChannel.send({
  type: 'broadcast',
  event: 'message',
  payload: {
    user_id: session.user.id,
    display_name: session.user.email?.split('@')[0] ?? 'Member',
    text: inputText.trim(),
    ts: Date.now(),
  },
});
```

Message shape:
```ts
type ChatMessage = {
  user_id: string;
  display_name: string;
  text: string;
  ts: number;
};
```

Chat UI: `FlatList` with `ref` for `scrollToEnd`. Own messages aligned right with orange name. Others left with white name. Message text 14px, `rgba(255,255,255,0.85)`.

### Drop bar — Realtime

Subscribe on mount:

```ts
const dropChannel = supabase.channel(`drops:${id}`)
  .on('broadcast', { event: 'drop_start' }, ({ payload }) => {
    setActiveDrop(payload); // { tiers, spots_remaining, ends_at }
    showDropBar();
  })
  .on('broadcast', { event: 'spot_claimed' }, ({ payload }) => {
    setActiveDrop(prev => prev ? { ...prev, spots_remaining: payload.spots_remaining } : prev);
  })
  .on('broadcast', { event: 'drop_end' }, () => {
    hideDropBar();
    setActiveDrop(null);
  })
  .subscribe();
```

`showDropBar()` / `hideDropBar()` animate the `LiveDropBar` (see component below).

### Cleanup on unmount

```ts
useEffect(() => {
  return () => {
    chatChannel.unsubscribe();
    dropChannel.unsubscribe();
    player.pause();
  };
}, []);
```

---

## Component: LiveDropBar (`components/LiveDropBar.tsx`)

### Props

```ts
type DropTier = {
  price_cents: number;
  spots: number;
  label: string;
};

type ActiveDrop = {
  tiers: DropTier[];
  spots_remaining: number;
  ends_at: string; // ISO timestamp
};

type Props = {
  drop: ActiveDrop | null;
  sessionId: string;
  onClaim: (priceCents: number) => void; // parent handles Stripe
  animValue: Animated.Value; // passed from parent
};
```

### Animation

Parent creates `animValue = useRef(new Animated.Value(0)).current`.

`showDropBar()` in parent:
```ts
Animated.timing(animValue, {
  toValue: 1,
  duration: 350,
  useNativeDriver: true,
}).start();
```

`hideDropBar()`:
```ts
Animated.timing(animValue, {
  toValue: 0,
  duration: 250,
  useNativeDriver: true,
}).start();
```

In `LiveDropBar`, translate Y from bottom:

```ts
const translateY = animValue.interpolate({
  inputRange: [0, 1],
  outputRange: [200, 0],
});
```

`position: 'absolute'`, `bottom: 0`, `left: 0`, `right: 0`.

### Dismissed pill

State: `dismissed: boolean` (local to bar component).

When user taps the dismiss chevron: set `dismissed = true`, bar shrinks to a 36px pill pinned bottom-center ("🔥 Drop active — tap to view"). Tap pill: `dismissed = false`, full bar re-appears.

When `drop` becomes null (drop_end): bar hides fully regardless of dismissed state.

### Bar UI (full state)

```
┌─────────────────────────────────┐
│  🔥 Season Drop        [  ✕  ] │
│  AED 299  ·  3 spots left       │
│  AED 499  ·  1 spot  left       │
│  Ends in  02:47                 │
│  ┌──────────────────────────┐   │
│  │       Claim a Spot       │   │ ← orange button
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

- Background: `#1C1714`, `borderTopLeftRadius: 24`, `borderTopRightRadius: 24`
- Countdown: local `setInterval` ticking from `ends_at - now()`, shown as `MM:SS`, cleared on unmount/drop_end
- Tiers: map `drop.tiers` to rows; each row shows price + remaining spots
- "Claim" button: if multiple tiers, show a tier picker first (simple modal with tier options), then call `onClaim(priceCents)`

### Claim flow (in watch screen parent)

```ts
async function handleClaim(priceCents: number) {
  const { data: { session: fresh } } = await supabase.auth.getSession();
  const token = fresh?.access_token;
  if (!token) return;

  const res = await fetch(`${EDGE_BASE}/claim-live-drop-spot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ live_session_id: id, tier_price_cents: priceCents }),
  });
  const json = await res.json();
  if (json.checkout_url) {
    await WebBrowser.openBrowserAsync(json.checkout_url);
  }
}
```

---

## Data Types

```ts
type LiveSession = {
  id: string;
  title: string;
  is_season_drop: boolean;
  starts_at: string | null;
  trainer: { name: string; avatar_url: string | null; slug: string };
  attendee_count: number;
};

type ChatMessage = {
  user_id: string;
  display_name: string;
  text: string;
  ts: number;
};

type DropTier = {
  price_cents: number;
  spots: number;
  label: string;
};

type ActiveDrop = {
  tiers: DropTier[];
  spots_remaining: number;
  ends_at: string;
};
```

---

## Gating Rules

| User state | Live session access |
|---|---|
| Subscriber to coach | Full access — `join-live-session` returns token |
| Club member (session has `club_id`) | Full access — `join-live-session` checks `club_members` |
| Neither | `join-live-session` returns 403 — show subscribe prompt |

---

## Out of Scope

- Coach starting a stream from the phone (RTMP from mobile camera)
- Push notifications when a session goes live
- Recording/replay of ended sessions
- Reactions (emoji) during stream
- Moderation (mute/block in chat)
