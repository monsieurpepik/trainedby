# TrainedBy RN Phase 5 — Cohorts Design Spec

## Goal

Build the cohort feature for the TrainedBy React Native app. When a member claims a season drop spot and payment confirms, they are instantly placed into a private coaching cohort with up to 11 other members. The cohort has a persistent group chat and a body doubling room (a low-friction space to work out together, with optional trainer HLS stream). No new infrastructure required — Mux streaming and Supabase Realtime already exist.

## Architecture

**New screens:**
- `app/cohort/[id].tsx` — cohort screen: chat-first, room status bar pinned at top
- `app/cohort/room/[id].tsx` — body doubling room: hybrid HLS video (when trainer streaming) or presence avatars (when no stream)

**Modified screens:**
- `app/live/[id].tsx` — adds cohort welcome card after drop claim confirmed
- `app/(tabs)/profile.tsx` — adds "My Cohorts" section at top with notification badge

**New backend tables:**
- `cohorts` — `id, trainer_id, live_session_id, title, starts_at, ends_at, status`
- `cohort_members` — `id, cohort_id, user_id, joined_at`
- `cohort_rooms` — `id, cohort_id, mux_playback_id (nullable), status (open/closed), opened_at, closed_at`
- `cohort_messages` — `id, cohort_id, user_id, display_name, text, created_at` (persistent, last 200 fetched on load)

**New edge functions:**
- `confirm-cohort-claim` — new function; the existing `stripe-webhook` edge function is modified to call this when a `checkout.session.completed` event matches a `live_drop_claims.stripe_checkout_id`
- `open-cohort-room` — trainer opens a body doubling room (web dashboard)
- `join-cohort-room` — member joins room, returns signed Mux token if trainer is streaming
- `close-cohort-room` — trainer closes the room

**Supabase Realtime channels:**
- `cohort-chat:{cohortId}` — broadcast channel for group chat messages
- `cohort-room:{cohortId}` — broadcast channel for room events: `room_opened`, `room_closed`, `presence_update`, `cohort_confirmed`

---

## Flow 1: Drop Claim → Instant Cohort Activation

1. Member claims drop spot on watch screen → Stripe Checkout opens via `expo-web-browser`
2. Stripe webhook fires → `confirm-cohort-claim` edge function:
   - Creates `cohorts` row: `title`, `trainer_id`, `live_session_id`, `starts_at` (now), `ends_at` (now + 8 weeks), `status = 'active'`
   - Creates `cohort_members` row for this member
   - Broadcasts `cohort_confirmed` event on `cohort-room:{live_session_id}` with `{ cohort_id, trainer_name, title, starts_at }`
3. Watch screen is subscribed to `cohort-room:{live_session_id}` — receives `cohort_confirmed`
4. Drop bar animates out → welcome card slides up from bottom of watch screen:
   - Trainer avatar + name
   - Cohort title
   - "You're in! 🎉" heading
   - First session date
   - "Open your cohort →" orange CTA button
5. Member taps CTA → `router.push('/cohort/' + cohort_id)`

**Watch screen Realtime subscription (addition to existing):**
```ts
const cohortChannel = supabase.channel(`cohort-room:${id}`)
  .on('broadcast', { event: 'cohort_confirmed' }, ({ payload }) => {
    setCohortConfirmed(payload); // triggers welcome card
  })
  .subscribe();
```

---

## Flow 2: Profile Tab — My Cohorts Section

On `app/(tabs)/profile.tsx`:

- On mount + `useFocusEffect`: query `cohort_members` joined with `cohorts` for `user_id = auth.uid()` and `cohorts.status = 'active'`
- If active cohorts exist: render "My Cohorts" section above subscriptions
- Tab icon badge: subscribe to `cohort-room:{cohortId}` for each active cohort — when `room_opened` event fires, show badge dot on Profile tab icon (`unread` local state)

**Cohort card (in profile):**
```
┌──────────────────────────────────┐
│  🔥  8-Week Strength Build       │
│      Ahmed Al Rashid             │
│      Week 3 of 8 · 11 members   │
│      Next session Fri 6pm  [→]  │
└──────────────────────────────────┘
```

- Orange left border when room is active (green dot + "Room open")
- Tap anywhere → `router.push('/cohort/' + cohort.id)`
- Week number: `Math.ceil((Date.now() - new Date(cohort.starts_at).getTime()) / (7 * 24 * 60 * 60 * 1000))`

---

## Screen: Cohort (`app/cohort/[id].tsx`)

### Layout

```
┌─────────────────────────────┐
│ [‹]  8-Week Strength Build  │  ← header, week + member count
├─────────────────────────────┤
│  ● Ahmed in the room · 4   [Join]│  ← sticky room status bar
│    working out                   │  (green when active, grey when not)
├─────────────────────────────┤
│  Chat messages (FlatList)   │
│  scrolls to bottom on new   │
│                             │
│  Ahmed   Room open 💪       │
│  Sara K. Day 3 done ✅      │
│          See you all 🔥 You │
│                             │
├─────────────────────────────┤
│ [ Type a message... ]  [→]  │  ← KeyboardAvoidingView
└─────────────────────────────┘
```

### Data loading

On mount:
1. Fetch cohort details: `supabase.from('cohorts').select('id, title, starts_at, ends_at, status, trainer_id, trainers(name, avatar_url)').eq('id', id).single()`
2. Fetch member count: `supabase.from('cohort_members').select('count').eq('cohort_id', id)`
3. Fetch last 200 messages: `supabase.from('cohort_messages').select('*').eq('cohort_id', id).order('created_at', { ascending: true }).limit(200)`
4. Fetch active room: `supabase.from('cohort_rooms').select('*').eq('cohort_id', id).eq('status', 'open').maybeSingle()`

### Chat

Subscribe on mount:
```ts
const chatChannel = supabase.channel(`cohort-chat:${id}`)
  .on('broadcast', { event: 'message' }, ({ payload }) => {
    setMessages(prev => [...prev, payload].slice(-200));
    flatListRef.current?.scrollToEnd({ animated: true });
  })
  .subscribe();
```

Send message — broadcast + write to DB:
```ts
async function sendMessage() {
  const text = inputTextRef.current.trim();
  if (!text) return;
  const msg = {
    cohort_id: id,
    user_id: session.user.id,
    display_name: session.user.email?.split('@')[0] ?? 'Member',
    text,
    created_at: new Date().toISOString(),
  };
  chatChannel.send({ type: 'broadcast', event: 'message', payload: msg });
  await supabase.from('cohort_messages').insert(msg);
  inputRef.current?.clear();
}
```

### Room status bar

Subscribe on mount:
```ts
const roomChannel = supabase.channel(`cohort-room:${id}`)
  .on('broadcast', { event: 'room_opened' }, ({ payload }) => {
    setActiveRoom(payload); // { room_id, mux_playback_id, member_count }
  })
  .on('broadcast', { event: 'room_closed' }, () => {
    setActiveRoom(null);
  })
  .on('broadcast', { event: 'presence_update' }, ({ payload }) => {
    setActiveRoom(prev => prev ? { ...prev, member_count: payload.member_count } : prev);
  })
  .subscribe();
```

Room bar states:
- `activeRoom === null`: `background: '#1C1714'`, grey dot, "No room open" muted text — no Join button
- `activeRoom !== null`: `background: '#1a2a1a'`, green pulsing dot, "Ahmed in the room · {count} working out", orange "Join" button → `router.push('/cohort/room/' + activeRoom.room_id)`

### Cleanup on unmount
```ts
useEffect(() => () => {
  chatChannel.unsubscribe();
  roomChannel.unsubscribe();
}, []);
```

---

## Screen: Body Doubling Room (`app/cohort/room/[id].tsx`)

### Navigation params
`{ id: string }` — room ID from `cohort_rooms` table

### On mount
1. Call `join-cohort-room` with `{ room_id: id }` + user JWT
2. Response: `{ mux_playback_id, playback_token, cohort_id, member_count }` — `mux_playback_id` is null if trainer not streaming
3. Subscribe to `cohort-room:{cohort_id}` for presence updates and `room_closed`

### Layout (trainer streaming)
```
┌─────────────────────────────┐
│ [‹] Room · 8-Week Strength  │
├─────────────────────────────┤
│                             │
│   expo-video HLS stream     │  ← 16:9, same as watch screen
│   ● LIVE                    │
│                             │
├─────────────────────────────┤
│ Working out now             │
│ [●][●][●][●] +7 more       │  ← presence avatars (green ring = in room)
├─────────────────────────────┤
│  Chat messages (FlatList)   │
│  scrolls to bottom on new   │
├─────────────────────────────┤
│ [ Cheer the group... ] [→]  │
└─────────────────────────────┘
```

### Layout (no trainer stream — presence only)
```
┌─────────────────────────────┐
│ [‹] Room · 8-Week Strength  │
├─────────────────────────────┤
│                             │
│   Working out together      │  ← centered heading
│   [●][●][●][●][●]          │  ← presence avatars, larger
│   5 members in the room     │
│                             │
├─────────────────────────────┤
│  Chat messages (FlatList)   │
├─────────────────────────────┤
│ [ Cheer the group... ] [→]  │
└─────────────────────────────┘
```

### Video player (when streaming)
```ts
const player = useVideoPlayer(null);
if (mux_playback_id && playback_token) {
  player.replace(`https://stream.mux.com/${mux_playback_id}.m3u8?token=${playback_token}`);
  player.play();
}
```

### Presence avatars
Fetched once on mount from `cohort_members` joined with `users(avatar_url, display_name)`. Green ring shown on all — presence is implicit (you're in the room if you're on this screen). Count updated via `presence_update` broadcast.

### Room closed handling
```ts
roomChannel.on('broadcast', { event: 'room_closed' }, () => {
  player.pause();
  router.back();
});
```

### Cleanup on unmount
```ts
useEffect(() => () => {
  roomChannel.unsubscribe();
  player.pause();
}, []);
```

---

## Backend: `confirm-cohort-claim` Edge Function

Called by the existing Stripe webhook after a `live_drop_claims` payment succeeds.

```ts
// Input: { live_session_id, user_id, tier_price_cents, stripe_checkout_id }
// 1. Upsert cohort (may already exist if multiple claims for same session)
const { data: cohort } = await supabase
  .from('cohorts')
  .upsert({
    trainer_id: session.trainer_id,
    live_session_id,
    title: session.title,
    starts_at: new Date().toISOString(),
    ends_at: new Date(Date.now() + 8 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  }, { onConflict: 'live_session_id' })
  .select().single();

// 2. Insert cohort_member
await supabase.from('cohort_members').insert({ cohort_id: cohort.id, user_id });

// 3. Broadcast cohort_confirmed on cohort-room:{live_session_id}
await supabase.channel(`cohort-room:${live_session_id}`).send({
  type: 'broadcast',
  event: 'cohort_confirmed',
  payload: {
    cohort_id: cohort.id,
    title: cohort.title,
    trainer_name: session.trainer_name,
    starts_at: cohort.starts_at,
  },
});
```

---

## Data Types

```ts
type Cohort = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  status: 'active' | 'completed';
  trainer: { name: string; avatar_url: string | null };
  member_count: number;
};

type CohortMessage = {
  id: string;
  cohort_id: string;
  user_id: string;
  display_name: string;
  text: string;
  created_at: string;
};

type CohortRoom = {
  id: string;
  cohort_id: string;
  mux_playback_id: string | null;
  status: 'open' | 'closed';
  member_count: number;
};
```

---

## Gating Rules

| User state | Access |
|---|---|
| `cohort_members.user_id = auth.uid()` for this cohort | Full access — chat + room |
| Trainer of this cohort | Full access + can open/close room |
| Anyone else | 403 from edge functions; RLS blocks direct table access |

---

## Cohort Lifecycle

| Status | Chat | Room | Profile card |
|---|---|---|---|
| `active` | Read + write | Can be opened | Shows week + next session |
| `completed` | Read-only | Cannot be opened | Shows "Completed ✓" badge |

Status set to `completed` by a daily `pg_cron` job: `UPDATE cohorts SET status = 'completed' WHERE ends_at < now() AND status = 'active'`.

---

## Out of Scope

- Trainer opening rooms from the phone (web dashboard only for Phase 5)
- Push notifications when room opens or trainer messages
- Member video/camera (presence avatars only — no WebRTC)
- Milestone stream automation (Phase 7)
- Multiple simultaneous cohorts per drop session (one cohort per `live_session_id`)
- In-app cohort creation by trainer (trainer creates drop via web dashboard)
