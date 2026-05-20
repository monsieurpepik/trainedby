# RN Phase 4 — Live Streaming Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the live streaming tab (active session list) and watch screen (HLS video + real-time chat + animated season drop bar) for the TrainedBy React Native app.

**Architecture:** Three files — `LiveDropBar` component (isolated, animated), `live.tsx` tab (list + 30s poll), `live/[id].tsx` watch screen (join via edge function, expo-video, Supabase Realtime chat + drops). All backend is live; no DB or edge function changes required.

**Tech Stack:** expo-video 3.0.16, expo-web-browser 15.0.11, Supabase Realtime broadcast, React Native `Animated` (no extra library), @expo/vector-icons.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `trainedby-app/components/LiveDropBar.tsx` | **Create** | Animated drop bar — slide up/down, dismiss pill, countdown, claim button |
| `trainedby-app/app/(tabs)/live.tsx` | **Replace** | Live session list with pulsing LIVE dot, 30s auto-refresh |
| `trainedby-app/app/live/[id].tsx` | **Create** | Watch screen — join, HLS player, chat, drop bar wiring |

---

## Task 1: LiveDropBar component

**Files:**
- Create: `trainedby-app/components/LiveDropBar.tsx`

Context: Isolated display component. Receives `drop` (null when inactive) and a pre-created `animValue` from the parent. Slides up from bottom when drop activates, collapses to a pill when dismissed. Countdown ticks locally from `ends_at`. Calls `onClaim(priceCents)` — parent handles Stripe. Parent animates show/hide by calling `Animated.timing` on `animValue` directly (not via this component).

- [ ] **Step 1: Create the file**

```tsx
// trainedby-app/components/LiveDropBar.tsx
import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';

export type DropTier = {
  price_cents: number;
  spots: number;
  label: string;
};

export type ActiveDrop = {
  tiers: DropTier[];
  spots_remaining: number;
  ends_at: string; // ISO timestamp
};

type Props = {
  drop: ActiveDrop | null;
  animValue: Animated.Value;
  onClaim: (priceCents: number) => void;
};

function formatCountdown(endsAt: string): string {
  const remaining = Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000));
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function LiveDropBar({ drop, animValue, onClaim }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [countdown, setCountdown] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!drop) {
      setDismissed(false);
      return;
    }
    setCountdown(formatCountdown(drop.ends_at));
    intervalRef.current = setInterval(() => {
      setCountdown(formatCountdown(drop.ends_at));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [drop]);

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [220, 0],
  });

  if (!drop) return null;

  if (dismissed) {
    return (
      <Animated.View style={[styles.pillWrap, { transform: [{ translateY }] }]}>
        <Pressable style={styles.pill} onPress={() => setDismissed(false)}>
          <Text style={styles.pillText}>🔥 Drop active — tap to view</Text>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.bar, { transform: [{ translateY }] }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔥 Season Drop</Text>
        <Pressable onPress={() => setDismissed(true)} style={styles.dismissBtn}>
          <Text style={styles.dismissText}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.spotsRow}>
        <Text style={styles.spotsText}>{drop.spots_remaining} spot{drop.spots_remaining !== 1 ? 's' : ''} remaining</Text>
        <Text style={styles.countdown}>Ends in {countdown}</Text>
      </View>

      {drop.tiers.map((tier, i) => (
        <View key={i} style={styles.tierRow}>
          <Text style={styles.tierLabel}>{tier.label}</Text>
          <Text style={styles.tierPrice}>AED {Math.round(tier.price_cents / 100)}</Text>
        </View>
      ))}

      <Pressable
        style={styles.claimBtn}
        onPress={() => onClaim(drop.tiers[0].price_cents)}
      >
        <Text style={styles.claimText}>Claim a Spot</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#1C1714',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 40,
    borderTopWidth: 1, borderColor: 'rgba(255,92,0,0.2)',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#FF5C00' },
  dismissBtn: { padding: 4 },
  dismissText: { fontSize: 16, color: 'rgba(255,255,255,0.4)' },
  spotsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  spotsText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  countdown: { fontSize: 13, color: 'rgba(255,255,255,0.4)', fontVariant: ['tabular-nums'] as any },
  tierRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  tierLabel: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  tierPrice: { fontSize: 14, fontWeight: '600', color: '#fff' },
  claimBtn: {
    backgroundColor: '#FF5C00', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 16,
  },
  claimText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  pillWrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    alignItems: 'center', paddingBottom: 20,
  },
  pill: {
    backgroundColor: '#FF5C00', borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  pillText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd trainedby-app && npx tsc --noEmit 2>&1 | grep -i "LiveDropBar\|liveDrop" | head -10`

Expected: no errors referencing LiveDropBar.tsx

- [ ] **Step 3: Commit**

```bash
cd trainedby-app && git add components/LiveDropBar.tsx && git commit -m "feat: add LiveDropBar — animated slide-up drop bar with countdown and dismiss pill"
```

---

## Task 2: Live tab

**Files:**
- Replace: `trainedby-app/app/(tabs)/live.tsx`

Context: Replaces the stub. Queries `live_sessions` where `status = 'live'`, joined with `trainers` and `live_attendees` aggregate count. Refreshes on focus AND every 30 seconds via interval (cleared on blur). Each card shows a pulsing red LIVE dot (React Native `Animated.loop`), coach name, session title, attendee count, optional 🔥 Drop badge, and a Join button. Tapping anything routes to `/live/[id]`.

- [ ] **Step 1: Replace the stub**

```tsx
// trainedby-app/app/(tabs)/live.tsx
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet,
  ActivityIndicator, Image, Animated,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

type LiveSession = {
  id: string;
  title: string;
  is_season_drop: boolean;
  trainer: { name: string; avatar_url: string | null } | null;
  attendee_count: number;
};

function PulseDot() {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);
  return <Animated.View style={[styles.dot, { opacity }]} />;
}

export default function LiveScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('live_sessions')
        .select('id, title, is_season_drop, trainers(name, avatar_url), live_attendees(count)')
        .eq('status', 'live')
        .order('starts_at', { ascending: false });

      const rows: LiveSession[] = (data ?? []).map((s: any) => {
        const trainer = Array.isArray(s.trainers) ? s.trainers[0] ?? null : s.trainers;
        const countArr = Array.isArray(s.live_attendees) ? s.live_attendees : [];
        return {
          id: s.id,
          title: s.title,
          is_season_drop: s.is_season_drop,
          trainer: trainer ? { name: trainer.name, avatar_url: trainer.avatar_url } : null,
          attendee_count: countArr[0]?.count ?? 0,
        };
      });

      setSessions(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      intervalRef.current = setInterval(load, 30000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, [load])
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#FF5C00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Live</Text>
      <FlatList
        data={sessions}
        keyExtractor={s => s.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
            onPress={() => router.push(`/live/${item.id}` as any)}
          >
            <View style={styles.cardLeft}>
              {item.trainer?.avatar_url ? (
                <Image source={{ uri: item.trainer.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarInitial}>
                    {(item.trainer?.name ?? '?')[0].toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.cardInfo}>
                <View style={styles.liveRow}>
                  <PulseDot />
                  <Text style={styles.liveLabel}>LIVE</Text>
                  {item.is_season_drop && (
                    <View style={styles.dropPill}>
                      <Text style={styles.dropPillText}>🔥 Drop</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.trainerName}>{item.trainer?.name}</Text>
                <Text style={styles.sessionTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.attendeeCount}>{item.attendee_count} watching</Text>
              </View>
            </View>
            <View style={styles.joinBtn}>
              <Text style={styles.joinText}>Join</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No live sessions right now — check back soon.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0B0A' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  heading: {
    fontSize: 28, fontWeight: '900', color: '#fff',
    padding: 16, paddingBottom: 8, letterSpacing: -0.5,
  },
  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: { backgroundColor: '#2A2018', justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
  cardInfo: { flex: 1 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ff3b30' },
  liveLabel: { fontSize: 10, fontWeight: '700', color: '#ff3b30', letterSpacing: 1.5 },
  dropPill: {
    backgroundColor: 'rgba(255,92,0,0.15)',
    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1, borderColor: 'rgba(255,92,0,0.3)',
  },
  dropPillText: { fontSize: 10, color: '#FF5C00', fontWeight: '600' },
  trainerName: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 2 },
  sessionTitle: { fontSize: 15, fontWeight: '600', color: '#fff', marginBottom: 2 },
  attendeeCount: { fontSize: 12, color: 'rgba(255,255,255,0.3)' },
  joinBtn: {
    backgroundColor: '#FF5C00', borderRadius: 20,
    paddingHorizontal: 18, paddingVertical: 10,
  },
  joinText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  emptyText: { fontSize: 15, color: 'rgba(255,255,255,0.35)', textAlign: 'center' },
});
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd trainedby-app && npx tsc --noEmit 2>&1 | grep "live.tsx" | head -10`

Expected: no errors in the new file.

- [ ] **Step 3: Commit**

```bash
cd trainedby-app && git add "app/(tabs)/live.tsx" && git commit -m "feat: live tab — session list with pulsing LIVE dot, season drop badge, 30s refresh"
```

---

## Task 3: Watch screen

**Files:**
- Create: `trainedby-app/app/live/[id].tsx`

Context: The most complex screen in the app — three concurrent systems:
1. **Join + video**: POST to `join-live-session` → get signed Mux token → `expo-video` player
2. **Chat**: Supabase Realtime broadcast channel `chat:{id}` — receive + send messages, 50-message rolling buffer
3. **Drops**: Supabase Realtime broadcast channel `drops:{id}` — receive `drop_start`/`spot_claimed`/`drop_end` events → animate `LiveDropBar`

All three Realtime channels are unsubscribed on unmount. Player is paused on unmount. Join errors are surfaced with readable messages.

Layout (top to bottom): back button (absolute overlay) → video (16:9) → chat FlatList (flex: 1) → chat input (bottom) → LiveDropBar (absolute, above input, slides up from bottom).

`join-live-session` edge function:
- URL: `POST ${EDGE_BASE}/join-live-session`
- Body: `{ live_session_id: id }`
- Auth: `Authorization: Bearer <user JWT>`
- Success: `{ playback_token, mux_playback_id, title, trainer_name, is_season_drop, drop_tiers }`
- Errors: `{ error: 'session_not_live' }` | `{ error: 'Unauthorized' }`

`claim-live-drop-spot` edge function:
- URL: `POST ${EDGE_BASE}/claim-live-drop-spot`
- Body: `{ live_session_id: id, tier_price_cents: number }`
- Auth: `Authorization: Bearer <user JWT>`
- Success: `{ checkout_url: string }`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p trainedby-app/app/live
```

- [ ] **Step 2: Create the watch screen**

```tsx
// trainedby-app/app/live/[id].tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator,
  Dimensions, TextInput, FlatList, KeyboardAvoidingView,
  Platform, Animated,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { supabase, EDGE_BASE } from '../../lib/supabase';
import { useAuth } from '../../context/auth';
import LiveDropBar, { type ActiveDrop } from '../../components/LiveDropBar';

const SCREEN_WIDTH = Dimensions.get('window').width;
const VIDEO_HEIGHT = Math.round(SCREEN_WIDTH * 9 / 16);

type ChatMessage = {
  user_id: string;
  display_name: string;
  text: string;
  ts: number;
};

type SessionMeta = {
  title: string;
  trainer_name: string;
  is_season_drop: boolean;
};

export default function LiveWatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const router = useRouter();

  // Join state
  const [meta, setMeta] = useState<SessionMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(true);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const chatListRef = useRef<FlatList>(null);
  const chatChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Drop state
  const [activeDrop, setActiveDrop] = useState<ActiveDrop | null>(null);
  const dropAnimValue = useRef(new Animated.Value(0)).current;
  const dropChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Video player — null source until join succeeds
  const player = useVideoPlayer(null, () => {});

  // ── Join ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id || !session?.user) return;
    let cancelled = false;

    async function join() {
      try {
        const { data: { session: fresh } } = await supabase.auth.getSession();
        const token = fresh?.access_token;
        if (!token) { setError('Not authenticated'); return; }

        const res = await fetch(`${EDGE_BASE}/join-live-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ live_session_id: id }),
        });
        const json = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setError(
            json.error === 'session_not_live' ? 'This session has ended.' :
            json.error === 'Unauthorized' ? 'Subscribe to join live sessions.' :
            'Could not join session.'
          );
          return;
        }

        setMeta({
          title: json.title,
          trainer_name: json.trainer_name,
          is_season_drop: json.is_season_drop ?? false,
        });

        const url = `https://stream.mux.com/${json.mux_playback_id}.m3u8?token=${json.playback_token}`;
        player.replace(url);
        player.play();
      } catch {
        if (!cancelled) setError('Could not join session.');
      } finally {
        if (!cancelled) setJoining(false);
      }
    }

    join();
    return () => { cancelled = true; };
  }, [id, session]);

  // ── Chat Realtime ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`chat:${id}`)
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        setMessages(prev => {
          const next = [...prev, payload as ChatMessage];
          return next.length > 50 ? next.slice(-50) : next;
        });
        setTimeout(() => chatListRef.current?.scrollToEnd({ animated: true }), 50);
      })
      .subscribe();

    chatChannelRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, [id]);

  // ── Drops Realtime ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`drops:${id}`)
      .on('broadcast', { event: 'drop_start' }, ({ payload }) => {
        setActiveDrop(payload as ActiveDrop);
        Animated.timing(dropAnimValue, {
          toValue: 1, duration: 350, useNativeDriver: true,
        }).start();
      })
      .on('broadcast', { event: 'spot_claimed' }, ({ payload }) => {
        setActiveDrop(prev =>
          prev ? { ...prev, spots_remaining: payload.spots_remaining } : prev
        );
      })
      .on('broadcast', { event: 'drop_end' }, () => {
        Animated.timing(dropAnimValue, {
          toValue: 0, duration: 250, useNativeDriver: true,
        }).start(() => setActiveDrop(null));
      })
      .subscribe();

    dropChannelRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, [id]);

  // ── Player cleanup ────────────────────────────────────────────────────────
  useEffect(() => {
    return () => { player.pause(); };
  }, [player]);

  // ── Chat actions ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    const text = inputText.trim();
    if (!text || !chatChannelRef.current || !session?.user) return;
    chatChannelRef.current.send({
      type: 'broadcast',
      event: 'message',
      payload: {
        user_id: session.user.id,
        display_name: session.user.email?.split('@')[0] ?? 'Member',
        text,
        ts: Date.now(),
      },
    });
    setInputText('');
  }, [inputText, session]);

  // ── Claim drop ────────────────────────────────────────────────────────────
  const handleClaim = useCallback(async (priceCents: number) => {
    if (!session?.user) return;
    try {
      const { data: { session: fresh } } = await supabase.auth.getSession();
      const token = fresh?.access_token;
      if (!token) return;

      const res = await fetch(`${EDGE_BASE}/claim-live-drop-spot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ live_session_id: id, tier_price_cents: priceCents }),
      });
      const json = await res.json();
      if (json.checkout_url) {
        await WebBrowser.openBrowserAsync(json.checkout_url);
      }
    } catch {
      // silently ignore — user can try again
    }
  }, [id, session]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (joining) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#FF5C00" />
        <Text style={styles.joiningText}>Joining session…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={styles.backLink}>← Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Back button — absolute over video */}
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>‹</Text>
      </Pressable>

      {/* Video */}
      <View style={styles.videoContainer}>
        <VideoView
          player={player}
          style={styles.video}
          allowsFullscreen
          contentFit="cover"
        />
        {meta && (
          <View style={styles.videoOverlay}>
            <Text style={styles.overlayTrainer}>{meta.trainer_name}</Text>
            <Text style={styles.overlayTitle} numberOfLines={1}>{meta.title}</Text>
          </View>
        )}
      </View>

      {/* Chat messages */}
      <FlatList
        ref={chatListRef}
        data={messages}
        keyExtractor={(m, i) => `${m.user_id}-${m.ts}-${i}`}
        style={styles.chatList}
        contentContainerStyle={{ padding: 12, paddingBottom: 4 }}
        renderItem={({ item }) => {
          const isOwn = item.user_id === session?.user?.id;
          return (
            <View style={[styles.msgRow, isOwn && styles.msgRowOwn]}>
              <Text style={[styles.msgName, isOwn && styles.msgNameOwn]}>
                {item.display_name}
              </Text>
              <Text style={styles.msgText}>{item.text}</Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.chatEmpty}>No messages yet — say hello!</Text>
        }
      />

      {/* Chat input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Say something…"
          placeholderTextColor="rgba(255,255,255,0.3)"
          onSubmitEditing={sendMessage}
          returnKeyType="send"
          blurOnSubmit={false}
        />
        <Pressable onPress={sendMessage} style={styles.sendBtn}>
          <Text style={styles.sendText}>→</Text>
        </Pressable>
      </View>

      {/* Drop bar — absolute, slides up over input */}
      <LiveDropBar
        drop={activeDrop}
        animValue={dropAnimValue}
        onClaim={handleClaim}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0B0A' },
  center: { justifyContent: 'center', alignItems: 'center', padding: 32 },
  joiningText: { color: 'rgba(255,255,255,0.4)', marginTop: 12, fontSize: 14 },
  errorText: { color: 'rgba(255,255,255,0.6)', fontSize: 16, textAlign: 'center' },
  backLink: { color: '#FF5C00', fontSize: 15 },

  backBtn: {
    position: 'absolute', top: 56, left: 16,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 10,
  },
  backText: { color: '#fff', fontSize: 22, lineHeight: 28 },

  videoContainer: { width: SCREEN_WIDTH, height: VIDEO_HEIGHT + 100 },
  video: { width: '100%', height: '100%' },
  videoOverlay: {
    position: 'absolute', bottom: 12, left: 16, right: 16,
  },
  overlayTrainer: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 2 },
  overlayTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },

  chatList: { flex: 1 },
  chatEmpty: {
    color: 'rgba(255,255,255,0.25)', textAlign: 'center',
    fontSize: 13, marginTop: 20,
  },
  msgRow: { marginBottom: 10 },
  msgRowOwn: { alignItems: 'flex-end' },
  msgName: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 2 },
  msgNameOwn: { color: '#FF5C00' },
  msgText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 20 },

  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, gap: 10,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)',
  },
  input: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    color: '#fff', fontSize: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FF5C00',
    justifyContent: 'center', alignItems: 'center',
  },
  sendText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
```

- [ ] **Step 3: Verify TypeScript**

Run: `cd trainedby-app && npx tsc --noEmit 2>&1 | head -30`

Expected: no errors in the new file. Pre-existing errors in `index.tsx` are acceptable.

- [ ] **Step 4: Verify app starts**

Run: `cd trainedby-app && npx expo start --no-dev` (or standard `npx expo start`)

Open iOS Simulator. Navigate to the Live tab. Expected: "No live sessions right now" empty state (no crash).

- [ ] **Step 5: Commit**

```bash
cd trainedby-app && git add app/live/ && git commit -m "feat: live watch screen — join, HLS video, real-time chat, drop bar integration"
```

---

## Self-Review

### Spec coverage
- ✅ Live tab: session list, pulsing dot, attendee count, season drop badge — Task 2
- ✅ 30s interval refresh + useFocusEffect — Task 2
- ✅ Watch screen: join → signed token → expo-video — Task 3
- ✅ Error cases: session_not_live, Unauthorized, network failure — Task 3
- ✅ Chat: Realtime broadcast subscribe/send, 50-message rolling buffer — Task 3
- ✅ Drop bar: Realtime drop_start/spot_claimed/drop_end → animate — Task 3
- ✅ Drop bar: slide up/pill dismiss/countdown/claim — Task 1
- ✅ Claim → claim-live-drop-spot → expo-web-browser — Task 3
- ✅ Cleanup: unsubscribe both channels, pause player on unmount — Task 3

### Type consistency
- `ActiveDrop` defined in `LiveDropBar.tsx`, imported by `live/[id].tsx` ✅
- `ChatMessage` defined locally in `live/[id].tsx` ✅
- `onClaim(priceCents: number)` signature matches call site `handleClaim` ✅
- `animValue: Animated.Value` created in parent, passed to bar ✅

### No placeholders
- All code is complete and runnable ✅
- Error cases are explicit, not "handle errors appropriately" ✅
- Cleanup is explicit with actual unsubscribe/pause calls ✅
