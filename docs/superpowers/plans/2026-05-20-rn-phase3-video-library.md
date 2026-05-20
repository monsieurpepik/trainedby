# RN Phase 3 — Video Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the video library tab (Netflix-style coach rows, teaser+lock gating) and video player screen (Mux HLS via expo-video, signed tokens for paid content).

**Architecture:** Three new/replaced files — `VideoCard` component, `library.tsx` tab (replaces stub), `video/[id].tsx` player screen. No backend changes — `videos` table, `coach_subscriptions` table, and `get-video-token` edge function are all live. Data loaded in parallel on tab focus; subscription set gates every card in memory.

**Tech Stack:** expo-video 3.0.16 (already installed), expo-web-browser 15.0.11 (already installed), expo-linear-gradient, @expo/vector-icons (Ionicons), Supabase JS client.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `trainedby-app/components/VideoCard.tsx` | **Create** | Reusable video thumbnail card with lock overlay |
| `trainedby-app/app/(tabs)/library.tsx` | **Replace** | Library tab — parallel data load, coach rows, subscribe sheet |
| `trainedby-app/app/video/[id].tsx` | **Create** | Video player — token fetch, expo-video HLS, pull-up info panel |

---

## Task 1: VideoCard component

**Files:**
- Create: `trainedby-app/components/VideoCard.tsx`

Context: This card is used in horizontal coach rows in the library tab. It shows a thumbnail, duration badge, title overlay, and a full-card lock overlay when `locked={true}`. Follows the same photo-card pattern as `TrainerCard.tsx` — full-bleed image, LinearGradient overlay, absolute-positioned text.

- [ ] **Step 1: Create the file**

```tsx
// trainedby-app/components/VideoCard.tsx
import { View, Text, Image, Pressable, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const CARD_WIDTH = (Dimensions.get('window').width - 48) / 2.3;

export type VideoItem = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  is_free: boolean;
  mux_playback_id: string;
  trainer_id: string;
};

type Props = {
  video: VideoItem;
  locked: boolean;
  onPress: () => void;
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VideoCard({ video, locked, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
      onPress={onPress}
    >
      {video.thumbnail_url ? (
        <Image source={{ uri: video.thumbnail_url }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]} />
      )}

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.82)']}
        locations={[0.4, 1]}
        style={styles.gradient}
      />

      {video.duration_seconds != null && (
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{formatDuration(video.duration_seconds)}</Text>
        </View>
      )}

      <Text style={styles.title} numberOfLines={2}>{video.title}</Text>

      {locked && (
        <View style={styles.lockOverlay}>
          <Ionicons name="lock-closed" size={26} color="rgba(255,255,255,0.9)" />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.4,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1C1714',
  },
  thumb: { position: 'absolute', inset: 0, width: '100%', height: '100%' } as any,
  thumbPlaceholder: { backgroundColor: '#2A2018' },
  gradient: { position: 'absolute', inset: 0 } as any,
  durationBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
  },
  durationText: { fontSize: 10, color: '#fff', fontWeight: '600' },
  title: {
    position: 'absolute', bottom: 10, left: 10, right: 10,
    fontSize: 13, fontWeight: '600', color: '#fff', lineHeight: 17,
  },
  lockOverlay: {
    position: 'absolute', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center', alignItems: 'center',
  } as any,
});
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd trainedby-app && npx tsc --noEmit 2>&1 | head -20`

Expected: no errors referencing `VideoCard.tsx`

- [ ] **Step 3: Commit**

```bash
git add trainedby-app/components/VideoCard.tsx
git commit -m "feat: add VideoCard component with thumbnail, duration badge, lock overlay"
```

---

## Task 2: Library tab

**Files:**
- Replace: `trainedby-app/app/(tabs)/library.tsx`

Context: This replaces the current stub. Loads videos + subscriptions in parallel on tab focus. Groups videos by coach in-memory. Renders a vertical `FlatList` of coach sections, each with a horizontal `FlatList` of `VideoCard`s. Unsubscribed coaches show free videos + a lock card that opens a subscribe bottom sheet (`Modal`). The subscribe sheet calls `create-checkout` edge function and opens the returned URL in `expo-web-browser`. After browser closes, data reloads.

The `create-checkout` edge function URL is: `${EDGE_BASE}/create-checkout` — POST with `{ trainer_id: string }` and user JWT Bearer token. Returns `{ url: string }` (Stripe Checkout URL).

- [ ] **Step 1: Replace the stub with the full implementation**

```tsx
// trainedby-app/app/(tabs)/library.tsx
import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet,
  ActivityIndicator, Dimensions, Image, Modal,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { supabase, EDGE_BASE } from '../../lib/supabase';
import { useAuth } from '../../context/auth';
import VideoCard, { type VideoItem } from '../../components/VideoCard';

const CARD_WIDTH = (Dimensions.get('window').width - 48) / 2.3;

type VideoRow = VideoItem & {
  trainers: {
    id: string;
    name: string;
    slug: string;
    avatar_url: string | null;
    subscription_price_cents: number | null;
  };
};

type CoachRow = {
  trainer: {
    id: string;
    name: string;
    slug: string;
    avatar_url: string | null;
  };
  videos: VideoItem[];
  isSubscribed: boolean;
  subscription_price_cents: number | null;
};

type SubscribeSheet = {
  trainerName: string;
  trainerId: string;
  priceCents: number | null;
} | null;

export default function LibraryScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<CoachRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheet, setSheet] = useState<SubscribeSheet>(null);
  const [subscribing, setSubscribing] = useState(false);

  const load = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);

    const [{ data: videosData }, { data: subsData }] = await Promise.all([
      supabase
        .from('videos')
        .select('id, title, thumbnail_url, duration_seconds, is_free, mux_playback_id, trainer_id, trainers(id, name, slug, avatar_url, subscription_price_cents)')
        .eq('status', 'ready')
        .order('created_at', { ascending: false }),
      supabase
        .from('coach_subscriptions')
        .select('trainer_id')
        .eq('subscriber_id', session.user.id)
        .in('status', ['active', 'trialing']),
    ]);

    const subscribedIds = new Set((subsData ?? []).map((s: { trainer_id: string }) => s.trainer_id));

    const trainerMap = new Map<string, {
      trainer: CoachRow['trainer'];
      videos: VideoItem[];
      subscription_price_cents: number | null;
    }>();

    for (const v of (videosData ?? []) as VideoRow[]) {
      const t = v.trainers;
      if (!t) continue;
      if (!trainerMap.has(t.id)) {
        trainerMap.set(t.id, {
          trainer: { id: t.id, name: t.name, slug: t.slug, avatar_url: t.avatar_url },
          videos: [],
          subscription_price_cents: t.subscription_price_cents,
        });
      }
      trainerMap.get(t.id)!.videos.push({
        id: v.id, title: v.title, thumbnail_url: v.thumbnail_url,
        duration_seconds: v.duration_seconds, is_free: v.is_free,
        mux_playback_id: v.mux_playback_id, trainer_id: v.trainer_id,
      });
    }

    const coachRows: CoachRow[] = Array.from(trainerMap.values()).map(
      ({ trainer, videos, subscription_price_cents }) => ({
        trainer,
        videos,
        isSubscribed: subscribedIds.has(trainer.id),
        subscription_price_cents,
      })
    );

    setRows(coachRows);
    setLoading(false);
  }, [session]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function handleSubscribe() {
    if (!sheet || !session) return;
    setSubscribing(true);

    const { data: { session: fresh } } = await supabase.auth.getSession();
    const token = fresh?.access_token;
    if (!token) { setSubscribing(false); return; }

    const res = await fetch(`${EDGE_BASE}/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ trainer_id: sheet.trainerId }),
    });
    const json = await res.json();
    setSubscribing(false);
    setSheet(null);

    if (json.url) {
      await WebBrowser.openBrowserAsync(json.url);
      load();
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#FF5C00" />
      </View>
    );
  }

  if (rows.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.heading}>Library</Text>
        <Text style={styles.emptyText}>No videos yet — check back soon.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Library</Text>

      <FlatList
        data={rows}
        keyExtractor={r => r.trainer.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => {
          const visibleVideos = item.isSubscribed
            ? item.videos.slice(0, 8)
            : item.videos.filter(v => v.is_free).slice(0, 2);
          const hasLocked = !item.isSubscribed && item.videos.some(v => !v.is_free);

          return (
            <View style={styles.coachSection}>
              <Pressable
                style={styles.rowHeader}
                onPress={() => router.push(`/trainer/${item.trainer.slug}`)}
              >
                {item.trainer.avatar_url ? (
                  <Image source={{ uri: item.trainer.avatar_url }} style={styles.coachAvatar} />
                ) : (
                  <View style={[styles.coachAvatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarInitial}>
                      {(item.trainer.name ?? '?')[0].toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text style={styles.coachName} numberOfLines={1}>{item.trainer.name}</Text>
                <Text style={styles.seeAll}>See all →</Text>
              </Pressable>

              <FlatList
                horizontal
                data={visibleVideos}
                keyExtractor={v => v.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
                renderItem={({ item: video }) => (
                  <VideoCard
                    video={video}
                    locked={false}
                    onPress={() =>
                      router.push({
                        pathname: '/video/[id]',
                        params: {
                          id: video.id,
                          title: video.title,
                          is_free: video.is_free ? '1' : '0',
                          playback_id: video.mux_playback_id,
                        },
                      })
                    }
                  />
                )}
                ListFooterComponent={
                  hasLocked ? (
                    <Pressable
                      style={styles.lockCard}
                      onPress={() =>
                        setSheet({
                          trainerName: item.trainer.name,
                          trainerId: item.trainer.id,
                          priceCents: item.subscription_price_cents,
                        })
                      }
                    >
                      <Ionicons name="lock-closed" size={26} color="rgba(255,255,255,0.7)" />
                      {item.subscription_price_cents != null && (
                        <Text style={styles.lockPrice}>
                          AED {Math.round(item.subscription_price_cents / 100)}/mo
                        </Text>
                      )}
                    </Pressable>
                  ) : null
                }
              />
            </View>
          );
        }}
      />

      <Modal
        visible={!!sheet}
        transparent
        animationType="slide"
        onRequestClose={() => setSheet(null)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setSheet(null)} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>{sheet?.trainerName}</Text>
          {sheet?.priceCents != null && (
            <Text style={styles.sheetPrice}>
              AED {Math.round(sheet.priceCents / 100)} / month
            </Text>
          )}
          <Text style={styles.sheetSub}>Subscribe to unlock the full video library</Text>
          <Pressable
            style={[styles.sheetBtn, subscribing && { opacity: 0.6 }]}
            onPress={handleSubscribe}
            disabled={subscribing}
          >
            {subscribing
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.sheetBtnText}>Subscribe</Text>
            }
          </Pressable>
          <Pressable onPress={() => setSheet(null)}>
            <Text style={styles.sheetCancel}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0B0A' },
  center: { justifyContent: 'center', alignItems: 'center' },
  heading: {
    fontSize: 28, fontWeight: '900', color: '#fff',
    padding: 16, paddingBottom: 12, letterSpacing: -0.5,
  },
  emptyText: { fontSize: 15, color: 'rgba(255,255,255,0.35)', marginTop: 8 },

  coachSection: { marginBottom: 28 },
  rowHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, marginBottom: 12, gap: 10,
  },
  coachAvatar: { width: 32, height: 32, borderRadius: 16 },
  avatarPlaceholder: {
    backgroundColor: '#2A2018', justifyContent: 'center', alignItems: 'center',
  },
  avatarInitial: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
  coachName: { flex: 1, fontSize: 15, fontWeight: '600', color: '#fff' },
  seeAll: { fontSize: 13, color: '#FF5C00', fontWeight: '600' },

  lockCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.4,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  lockPrice: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },

  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: '#1C1714',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 28, paddingBottom: 48,
    alignItems: 'center',
  },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 },
  sheetPrice: { fontSize: 28, fontWeight: '200', color: '#FF5C00', marginBottom: 8 },
  sheetSub: { fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 24, textAlign: 'center' },
  sheetBtn: {
    backgroundColor: '#FF5C00', borderRadius: 14,
    paddingVertical: 16, paddingHorizontal: 48,
    alignItems: 'center', marginBottom: 16, width: '100%',
  },
  sheetBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sheetCancel: { fontSize: 15, color: 'rgba(255,255,255,0.4)' },
});
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd trainedby-app && npx tsc --noEmit 2>&1 | head -30`

Expected: no errors referencing `library.tsx`

- [ ] **Step 3: Smoke test on simulator**

Run: `npx expo start` in `trainedby-app/`, open on iOS Simulator, tap Library tab.

Expected: coach rows appear (or spinner → empty state if no videos in DB). No crash.

- [ ] **Step 4: Commit**

```bash
git add trainedby-app/app/\(tabs\)/library.tsx
git commit -m "feat: library tab — Netflix coach rows, teaser gating, subscribe sheet"
```

---

## Task 3: Video player screen

**Files:**
- Create: `trainedby-app/app/video/[id].tsx`

Context: Receives navigation params `{ id, title, is_free, playback_id }` from the library tap. For free videos (`is_free === '1'`), constructs the Mux HLS URL directly. For paid, POSTs to `get-video-token` with user JWT, gets `{ token, playback_id }` back, then builds the signed URL. Uses `expo-video` v3's `useVideoPlayer` hook + `VideoView` component. The player is initialized with `null` and updated via `player.replace(url)` once the URL is ready — this avoids the hook-inside-condition problem. Pull-up info panel below the video mirrors the trainer profile pattern.

`expo-video` v3 API:
- `useVideoPlayer(source, setup?)` — `source` can be `null` initially
- `player.replace(source)` — swap the video source at runtime
- `player.play()` — start playback
- `<VideoView player={player} style={...} allowsFullscreen contentFit="contain" />`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p trainedby-app/app/video
```

```tsx
// trainedby-app/app/video/[id].tsx
import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable,
  ActivityIndicator, Dimensions, ScrollView,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase, EDGE_BASE } from '../../lib/supabase';

const SCREEN_WIDTH = Dimensions.get('window').width;
const VIDEO_HEIGHT = SCREEN_WIDTH * (9 / 16);

export default function VideoPlayerScreen() {
  const { id, title, is_free, playback_id } = useLocalSearchParams<{
    id: string;
    title: string;
    is_free: string;
    playback_id: string;
  }>();
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingToken, setLoadingToken] = useState(true);

  const player = useVideoPlayer(null, () => {});

  useEffect(() => {
    async function prepare() {
      if (is_free === '1') {
        setVideoUrl(`https://stream.mux.com/${playback_id}.m3u8`);
        setLoadingToken(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setError('Not authenticated');
        setLoadingToken(false);
        return;
      }

      const res = await fetch(`${EDGE_BASE}/get-video-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ video_id: id }),
      });
      const json = await res.json();
      setLoadingToken(false);

      if (!res.ok) {
        setError(
          json.error === 'Subscription required'
            ? 'Active subscription required to watch this video.'
            : 'Could not load video. Try again.'
        );
        return;
      }

      const url = json.token
        ? `https://stream.mux.com/${json.playback_id}.m3u8?token=${json.token}`
        : `https://stream.mux.com/${json.playback_id}.m3u8`;
      setVideoUrl(url);
    }

    prepare();
  }, [id, is_free, playback_id]);

  useEffect(() => {
    if (videoUrl) {
      player.replace(videoUrl);
      player.play();
    }
  }, [videoUrl, player]);

  return (
    <View style={styles.container}>
      {/* Back button — above video area */}
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>‹</Text>
      </Pressable>

      {/* Video */}
      <View style={styles.videoContainer}>
        {error ? (
          <View style={styles.videoPlaceholder}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : loadingToken ? (
          <View style={styles.videoPlaceholder}>
            <ActivityIndicator color="#FF5C00" />
          </View>
        ) : (
          <VideoView
            player={player}
            style={styles.video}
            allowsFullscreen
            contentFit="contain"
          />
        )}
      </View>

      {/* Pull-up info panel */}
      <ScrollView style={styles.pullUp} contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <Text style={styles.videoTitle}>{title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{is_free === '1' ? 'Free' : 'Premium'}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0B0A' },

  backBtn: {
    position: 'absolute', top: 56, left: 16,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 10,
  },
  backText: { color: '#fff', fontSize: 22, lineHeight: 28 },

  videoContainer: {
    marginTop: 100,
    width: SCREEN_WIDTH,
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
  },
  video: { width: '100%', height: '100%' },
  videoPlaceholder: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  errorText: {
    color: 'rgba(255,255,255,0.55)', fontSize: 14,
    textAlign: 'center', paddingHorizontal: 32, lineHeight: 22,
  },

  pullUp: {
    marginTop: -24,
    backgroundColor: '#0D0B0A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 1,
  },
  videoTitle: {
    fontSize: 20, fontWeight: '700', color: '#fff',
    marginBottom: 12, letterSpacing: -0.3,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,92,0,0.12)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,92,0,0.25)',
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#FF5C00' },
});
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd trainedby-app && npx tsc --noEmit 2>&1 | head -30`

Expected: no errors referencing `video/[id].tsx`

- [ ] **Step 3: Smoke test on simulator**

1. Sign in, tap Library tab
2. Tap a free video card (if any in DB) — player should open, HLS stream should load
3. Tap back button — should return to library
4. Tap a locked video's lock card → subscribe sheet should appear

Expected: no crashes, video plays if `mux_playback_id` is valid in DB.

- [ ] **Step 4: Fix library tab background color**

The library tab stub had `#0a0a0a` — already replaced in Task 2 with `#0D0B0A`. Verify the Library tab icon in the tab bar matches the active state. Open `app/(tabs)/_layout.tsx` and confirm `library` tab entry exists:

```tsx
<Tabs.Screen
  name="library"
  options={{
    title: 'Library',
    tabBarIcon: ({ focused }) => <TabIcon name="play-circle" focused={focused} />,
  }}
/>
```

This line already exists — no change needed. Just verify it's there.

- [ ] **Step 5: Commit**

```bash
git add trainedby-app/app/video/
git commit -m "feat: video player screen — Mux HLS, signed token, pull-up info panel"
```

---

## Self-Review Checklist

### Spec coverage
- ✅ Library tab: Netflix coach rows — Task 2
- ✅ Free teaser visible to all, paid locked — Task 2 (`visibleVideos` filter logic)
- ✅ Lock card → subscribe sheet → Stripe → `expo-web-browser` — Task 2
- ✅ Reload after browser closes — Task 2 (`load()` after `openBrowserAsync`)
- ✅ VideoCard component with thumbnail, duration, lock overlay — Task 1
- ✅ Video player — free URL direct, paid via `get-video-token` — Task 3
- ✅ Pull-up info panel on player — Task 3
- ✅ `useFocusEffect` for tab refresh — Task 2
- ✅ Empty state — Task 2

### Type consistency
- `VideoItem` defined in `VideoCard.tsx`, imported by `library.tsx` ✅
- `CoachRow.trainer` shape used consistently in row header rendering ✅
- `SubscribeSheet` type covers all fields used in the Modal ✅
- Player params: `id`, `title`, `is_free` (string '1'/'0'), `playback_id` — consistent between library push and player read ✅

### No placeholders
- All code is complete and runnable ✅
- No "handle edge cases" or "add validation" without specifics ✅
