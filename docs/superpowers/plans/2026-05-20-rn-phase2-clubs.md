# TrainedBy React Native — Phase 2: Clubs, Check-in & Find

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all Phase 1 placeholder screens with real data — members see their enrolled clubs on the Home tab, can check in daily, view streaks, browse coaches on Find, and tap through to a trainer profile.

**Architecture:** All data fetches go directly to Supabase JS client (no edge functions except `submit-checkin` which requires auth). The app queries `club_members`, `clubs`, `missions`, `checkins`, and `trainers` tables with the existing RLS policies. Navigation uses Expo Router's `router.push()` for stack-based drill-down from Home → Club, and Find → Trainer.

**Tech Stack:** Expo Router v3, Supabase JS, React Native core components (FlatList, ScrollView, Pressable), no third-party UI libraries.

---

## Critical context for the implementer

- Supabase project: `mezhtdbfyvkshpuplqqw`
- Client is at `lib/supabase.ts` — import as `import { supabase, EDGE_BASE } from '../../lib/supabase'`
- Auth session: `supabase.auth.getSession()` or use the `useAuth()` hook from `context/auth.tsx`
- `club_members.user_id` matches `auth.uid()` — RLS enforces this
- Streak is stored per-checkin as `checkins.streak_day` — get the MAX to find current streak
- Today's mission: `missions.day_number` = number of days since `clubs.starts_at` (1-indexed)
- `submit-checkin` edge function requires JWT in Authorization header, body: `{ club_id, mission_id, user_id }`
- Trainers table: always look up by `email` or `slug`, never by `auth_id`
- `get-trainer` edge function: `GET /get-trainer?slug=<slug>` returns full trainer + packages

---

## File Map

```
trainedby-app/
  app/
    (tabs)/
      index.tsx           MODIFY — replace placeholder with enrolled clubs list
      find.tsx            MODIFY — replace placeholder with trainer search + list
    club/
      [id].tsx            CREATE — club detail: today's mission + check-in + leaderboard
    trainer/
      [slug].tsx          CREATE — trainer profile: bio, stats, clubs, subscribe link
  components/
    ClubCard.tsx          CREATE — reusable club card used on Home tab
    TrainerCard.tsx       CREATE — reusable trainer card used on Find tab
    MissionCard.tsx       CREATE — today's mission display with check-in button
    StreakBadge.tsx       CREATE — streak number display (flame + number)
```

---

## Task 1: ClubCard component

**Files:**
- Create: `trainedby-app/components/ClubCard.tsx`

- [ ] **Step 1: Create components directory and ClubCard.tsx**

```bash
mkdir -p /Users/bobanpepic/trainedby-app/components
```

```typescript
// components/ClubCard.tsx
import { View, Text, Pressable, StyleSheet } from 'react-native';

export type Club = {
  id: string;
  slug: string;
  name: string;
  goal: string;
  duration_days: number;
  is_free: boolean;
  price_cents: number | null;
  starts_at: string | null;
  status: string;
  trainer: {
    name: string;
    slug: string;
    avatar_url: string | null;
  } | null;
  streak?: number;
  checked_in_today?: boolean;
};

type Props = {
  club: Club;
  onPress: () => void;
};

export default function ClubCard({ club, onPress }: Props) {
  const daysSince = club.starts_at
    ? Math.floor((Date.now() - new Date(club.starts_at).getTime()) / 86400000) + 1
    : null;

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]} onPress={onPress}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{club.name}</Text>
          <Text style={styles.goal} numberOfLines={1}>{club.goal}</Text>
          {club.trainer && (
            <Text style={styles.trainer}>by {club.trainer.name}</Text>
          )}
        </View>
        <View style={styles.right}>
          {club.streak != null && club.streak > 0 && (
            <View style={styles.streak}>
              <Text style={styles.streakNum}>{club.streak}</Text>
              <Text style={styles.streakLabel}>day streak</Text>
            </View>
          )}
          {daysSince != null && (
            <Text style={styles.day}>Day {daysSince}/{club.duration_days}</Text>
          )}
          {club.checked_in_today && (
            <View style={styles.checkedBadge}>
              <Text style={styles.checkedText}>✓ Done</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  name: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 },
  goal: { fontSize: 13, color: '#888', marginBottom: 4 },
  trainer: { fontSize: 12, color: '#555' },
  right: { alignItems: 'flex-end', gap: 6 },
  streak: { alignItems: 'center' },
  streakNum: { fontSize: 22, fontWeight: '900', color: '#FF5C00' },
  streakLabel: { fontSize: 10, color: '#FF5C00', fontWeight: '600' },
  day: { fontSize: 11, color: '#555' },
  checkedBadge: {
    backgroundColor: 'rgba(0,200,100,0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  checkedText: { fontSize: 11, color: '#00c864', fontWeight: '700' },
});
```

- [ ] **Step 2: Commit**

```bash
cd /Users/bobanpepic/trainedby-app
git add components/ClubCard.tsx
git commit -m "feat: add ClubCard component"
```

---

## Task 2: StreakBadge and TrainerCard components

**Files:**
- Create: `trainedby-app/components/StreakBadge.tsx`
- Create: `trainedby-app/components/TrainerCard.tsx`

- [ ] **Step 1: Create StreakBadge.tsx**

```typescript
// components/StreakBadge.tsx
import { View, Text, StyleSheet } from 'react-native';

export default function StreakBadge({ streak }: { streak: number }) {
  if (streak === 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.flame}>🔥</Text>
      <Text style={styles.num}>{streak}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: 'rgba(255,92,0,0.15)',
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
  },
  flame: { fontSize: 13 },
  num: { fontSize: 14, fontWeight: '800', color: '#FF5C00' },
});
```

- [ ] **Step 2: Create TrainerCard.tsx**

```typescript
// components/TrainerCard.tsx
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';

export type Trainer = {
  id: string;
  slug: string;
  name: string | null;
  title: string | null;
  avatar_url: string | null;
  city: string | null;
  specialties: string[] | string | null;
  avg_rating: number | string | null;
  review_count: number | null;
  reps_verified: boolean | null;
};

type Props = {
  trainer: Trainer;
  onPress: () => void;
};

function getSpecialties(s: string[] | string | null): string {
  if (!s) return '';
  if (Array.isArray(s)) return s.slice(0, 2).join(' · ');
  try { const arr = JSON.parse(s); return Array.isArray(arr) ? arr.slice(0, 2).join(' · ') : s; }
  catch { return s; }
}

export default function TrainerCard({ trainer, onPress }: Props) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]} onPress={onPress}>
      <View style={styles.row}>
        {trainer.avatar_url ? (
          <Image source={{ uri: trainer.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {(trainer.name ?? '?')[0].toUpperCase()}
            </Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{trainer.name}</Text>
            {trainer.reps_verified && <Text style={styles.badge}>✓ REPs</Text>}
          </View>
          {trainer.title && <Text style={styles.title}>{trainer.title}</Text>}
          {trainer.city && <Text style={styles.city}>{trainer.city}</Text>}
          <Text style={styles.spec}>{getSpecialties(trainer.specialties)}</Text>
        </View>
        {trainer.avg_rating && Number(trainer.avg_rating) > 0 && (
          <View style={styles.rating}>
            <Text style={styles.ratingNum}>★ {Number(trainer.avg_rating).toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({trainer.review_count ?? 0})</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: '#2a2a2a',
  },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarPlaceholder: { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { fontSize: 22, fontWeight: '700', color: '#fff' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  name: { fontSize: 15, fontWeight: '700', color: '#fff' },
  badge: { fontSize: 10, color: '#FF5C00', fontWeight: '700', borderWidth: 1, borderColor: '#FF5C00', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1 },
  title: { fontSize: 12, color: '#888', marginBottom: 2 },
  city: { fontSize: 11, color: '#555', marginBottom: 2 },
  spec: { fontSize: 11, color: '#666' },
  rating: { alignItems: 'flex-end' },
  ratingNum: { fontSize: 13, fontWeight: '700', color: '#FFD700' },
  ratingCount: { fontSize: 11, color: '#555' },
});
```

- [ ] **Step 3: Commit**

```bash
cd /Users/bobanpepic/trainedby-app
git add components/StreakBadge.tsx components/TrainerCard.tsx
git commit -m "feat: add StreakBadge and TrainerCard components"
```

---

## Task 3: Home tab — enrolled clubs feed

**Files:**
- Modify: `trainedby-app/app/(tabs)/index.tsx`

The Home tab fetches the user's active club memberships, calculates today's streak per club, and checks whether the user already checked in today. It renders a `FlatList` of `ClubCard`s that navigate to `club/[id]`.

- [ ] **Step 1: Replace app/(tabs)/index.tsx**

```typescript
// app/(tabs)/index.tsx
import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/auth';
import ClubCard, { type Club } from '../../components/ClubCard';

type MembershipRow = {
  club_id: string;
  clubs: {
    id: string;
    slug: string;
    name: string;
    goal: string;
    duration_days: number;
    is_free: boolean;
    price_cents: number | null;
    starts_at: string | null;
    status: string;
    trainers: {
      name: string;
      slug: string;
      avatar_url: string | null;
    } | null;
  };
};

export default function HomeScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClubs = useCallback(async () => {
    if (!session?.user) return;

    const { data: memberships } = await supabase
      .from('club_members')
      .select(`
        club_id,
        clubs (
          id, slug, name, goal, duration_days, is_free, price_cents,
          starts_at, status,
          trainers ( name, slug, avatar_url )
        )
      `)
      .eq('user_id', session.user.id)
      .eq('status', 'active');

    if (!memberships || memberships.length === 0) {
      setClubs([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const clubIds = (memberships as MembershipRow[]).map(m => m.club_id);

    // Get today's date range
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // Get today's check-ins for all clubs
    const { data: todayCheckins } = await supabase
      .from('checkins')
      .select('club_id')
      .eq('user_id', session.user.id)
      .in('club_id', clubIds)
      .gte('completed_at', todayStart.toISOString())
      .lt('completed_at', todayEnd.toISOString());

    const checkedInToday = new Set((todayCheckins ?? []).map((c: { club_id: string }) => c.club_id));

    // Get max streak per club
    const { data: streaks } = await supabase
      .from('checkins')
      .select('club_id, streak_day')
      .eq('user_id', session.user.id)
      .in('club_id', clubIds)
      .order('streak_day', { ascending: false });

    const streakMap: Record<string, number> = {};
    for (const row of (streaks ?? []) as { club_id: string; streak_day: number }[]) {
      if (!streakMap[row.club_id]) streakMap[row.club_id] = row.streak_day;
    }

    const result: Club[] = (memberships as MembershipRow[])
      .filter(m => m.clubs)
      .map(m => ({
        id: m.clubs.id,
        slug: m.clubs.slug,
        name: m.clubs.name,
        goal: m.clubs.goal,
        duration_days: m.clubs.duration_days,
        is_free: m.clubs.is_free,
        price_cents: m.clubs.price_cents,
        starts_at: m.clubs.starts_at,
        status: m.clubs.status,
        trainer: m.clubs.trainers,
        streak: streakMap[m.club_id] ?? 0,
        checked_in_today: checkedInToday.has(m.club_id),
      }));

    setClubs(result);
    setLoading(false);
    setRefreshing(false);
  }, [session]);

  useFocusEffect(useCallback(() => { fetchClubs(); }, [fetchClubs]));

  function handleRefresh() {
    setRefreshing(true);
    fetchClubs();
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FF5C00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Clubs</Text>
      {clubs.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>No active clubs yet.</Text>
          <Text style={styles.emptySub}>Find a coach and join a club to get started.</Text>
        </View>
      ) : (
        <FlatList
          data={clubs}
          keyExtractor={c => c.id}
          renderItem={({ item }) => (
            <ClubCard
              club={item}
              onPress={() => router.push(`/club/${item.id}`)}
            />
          )}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#FF5C00" />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  heading: {
    fontSize: 28, fontWeight: '900', color: '#fff',
    padding: 16, paddingBottom: 4, letterSpacing: -0.5,
  },
  empty: { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#555', textAlign: 'center' },
});
```

- [ ] **Step 2: Commit**

```bash
cd /Users/bobanpepic/trainedby-app
git add "app/(tabs)/index.tsx"
git commit -m "feat: home tab shows enrolled clubs with streaks and check-in status"
```

---

## Task 4: Club detail screen — mission + check-in + leaderboard

**Files:**
- Create: `trainedby-app/app/club/[id].tsx`

The club detail screen loads the club, finds today's mission by day number, checks if the user already checked in today, and calls `submit-checkin` edge function on button press.

- [ ] **Step 1: Create club directory**

```bash
mkdir -p /Users/bobanpepic/trainedby-app/app/club
```

- [ ] **Step 2: Create app/club/[id].tsx**

```typescript
// app/club/[id].tsx
import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { supabase, EDGE_BASE } from '../../lib/supabase';
import { useAuth } from '../../context/auth';
import StreakBadge from '../../components/StreakBadge';

type Mission = {
  id: string;
  day_number: number;
  title: string;
  description: string | null;
  type: string;
};

type LeaderEntry = {
  user_id: string;
  streak_day: number;
  display_name: string | null;
};

type ClubDetail = {
  id: string;
  name: string;
  goal: string;
  duration_days: number;
  starts_at: string | null;
  status: string;
  trainer: { name: string; slug: string } | null;
};

export default function ClubDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const router = useRouter();

  const [club, setClub] = useState<ClubDetail | null>(null);
  const [mission, setMission] = useState<Mission | null>(null);
  const [streak, setStreak] = useState(0);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const load = useCallback(async () => {
    if (!id || !session?.user) return;

    const { data: clubData } = await supabase
      .from('clubs')
      .select('id, name, goal, duration_days, starts_at, status, trainers(name, slug)')
      .eq('id', id)
      .single();

    if (!clubData) { setLoading(false); return; }

    setClub({
      id: clubData.id,
      name: clubData.name,
      goal: clubData.goal,
      duration_days: clubData.duration_days,
      starts_at: clubData.starts_at,
      status: clubData.status,
      trainer: Array.isArray(clubData.trainers) ? clubData.trainers[0] ?? null : clubData.trainers,
    });

    // Today's day number
    const dayNum = clubData.starts_at
      ? Math.floor((Date.now() - new Date(clubData.starts_at).getTime()) / 86400000) + 1
      : 1;

    // Today's mission
    const { data: missionData } = await supabase
      .from('missions')
      .select('id, day_number, title, description, type')
      .eq('club_id', id)
      .eq('day_number', Math.min(dayNum, clubData.duration_days))
      .maybeSingle();

    setMission(missionData ?? null);

    // Check if already checked in today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const { data: todayCheckin } = await supabase
      .from('checkins')
      .select('id, streak_day')
      .eq('club_id', id)
      .eq('user_id', session.user.id)
      .gte('completed_at', todayStart.toISOString())
      .lt('completed_at', todayEnd.toISOString())
      .maybeSingle();

    setCheckedInToday(!!todayCheckin);

    // Current streak: max streak_day from checkins
    const { data: streakRow } = await supabase
      .from('checkins')
      .select('streak_day')
      .eq('club_id', id)
      .eq('user_id', session.user.id)
      .order('streak_day', { ascending: false })
      .limit(1)
      .maybeSingle();

    setStreak(streakRow?.streak_day ?? 0);

    // Leaderboard: top 10 streaks in this club
    const { data: topStreaks } = await supabase
      .from('checkins')
      .select('user_id, streak_day')
      .eq('club_id', id)
      .order('streak_day', { ascending: false })
      .limit(50);

    // Dedupe to max streak per user
    const maxByUser: Record<string, number> = {};
    for (const row of (topStreaks ?? []) as { user_id: string; streak_day: number }[]) {
      if (!maxByUser[row.user_id] || row.streak_day > maxByUser[row.user_id]) {
        maxByUser[row.user_id] = row.streak_day;
      }
    }

    const board = Object.entries(maxByUser)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([user_id, streak_day]) => ({
        user_id,
        streak_day,
        display_name: user_id === session.user.id ? 'You' : `Member`,
      }));

    setLeaderboard(board);
    setLoading(false);
  }, [id, session]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function handleCheckIn() {
    if (!mission || !session?.user || !club) return;
    setChecking(true);

    const { data: { session: freshSession } } = await supabase.auth.getSession();
    const token = freshSession?.access_token;
    if (!token) { setChecking(false); Alert.alert('Error', 'Not authenticated'); return; }

    const res = await fetch(`${EDGE_BASE}/submit-checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        club_id: club.id,
        mission_id: mission.id,
        user_id: session.user.id,
      }),
    });

    const json = await res.json();
    setChecking(false);

    if (!res.ok) {
      Alert.alert('Check-in failed', json.error ?? 'Something went wrong');
      return;
    }

    setCheckedInToday(true);
    setStreak(json.streak_day ?? streak + 1);
    Alert.alert('✅ Checked in!', `Day ${json.streak_day ?? streak + 1} streak`);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FF5C00" />
      </View>
    );
  }

  if (!club) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Club not found</Text>
      </View>
    );
  }

  const dayNum = club.starts_at
    ? Math.floor((Date.now() - new Date(club.starts_at).getTime()) / 86400000) + 1
    : 1;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <StreakBadge streak={streak} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Club info */}
        <Text style={styles.clubName}>{club.name}</Text>
        <Text style={styles.goal}>{club.goal}</Text>
        <Text style={styles.progress}>
          Day {Math.min(dayNum, club.duration_days)} of {club.duration_days}
          {club.trainer && ` · ${club.trainer.name}`}
        </Text>

        {/* Today's mission */}
        <View style={styles.missionCard}>
          <Text style={styles.missionLabel}>TODAY'S MISSION</Text>
          {mission ? (
            <>
              <Text style={styles.missionTitle}>{mission.title}</Text>
              {mission.description && (
                <Text style={styles.missionDesc}>{mission.description}</Text>
              )}
            </>
          ) : (
            <Text style={styles.missionDesc}>No mission for today yet.</Text>
          )}

          <Pressable
            style={[styles.checkInBtn, (checkedInToday || !mission) && styles.checkInBtnDone]}
            onPress={handleCheckIn}
            disabled={checkedInToday || !mission || checking}
          >
            {checking ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.checkInText}>
                {checkedInToday ? '✓ Checked in today' : 'Check in'}
              </Text>
            )}
          </Pressable>
        </View>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Streak Leaderboard</Text>
            {leaderboard.map((entry, i) => (
              <View
                key={entry.user_id}
                style={[styles.leaderRow, entry.user_id === session?.user?.id && styles.leaderRowMe]}
              >
                <Text style={styles.leaderRank}>{i + 1}</Text>
                <Text style={styles.leaderName}>
                  {entry.user_id === session?.user?.id ? 'You' : `Member ${i + 1}`}
                </Text>
                <Text style={styles.leaderStreak}>🔥 {entry.streak_day}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#888', fontSize: 16 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: '#1a1a1a',
  },
  back: { padding: 4 },
  backText: { color: '#FF5C00', fontSize: 16, fontWeight: '600' },
  clubName: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 6, letterSpacing: -0.5 },
  goal: { fontSize: 15, color: '#888', marginBottom: 4 },
  progress: { fontSize: 12, color: '#555', marginBottom: 24 },
  missionCard: {
    backgroundColor: '#1a1a1a', borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: '#2a2a2a', marginBottom: 24,
  },
  missionLabel: { fontSize: 10, fontWeight: '700', color: '#FF5C00', letterSpacing: 1.5, marginBottom: 12 },
  missionTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 10 },
  missionDesc: { fontSize: 14, color: '#888', lineHeight: 22, marginBottom: 20 },
  checkInBtn: {
    backgroundColor: '#FF5C00', borderRadius: 14, padding: 16, alignItems: 'center',
  },
  checkInBtnDone: { backgroundColor: '#2a2a2a' },
  checkInText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#666', marginBottom: 12, letterSpacing: 0.5 },
  leaderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1a1a1a',
  },
  leaderRowMe: { backgroundColor: 'rgba(255,92,0,0.06)', borderRadius: 8, paddingHorizontal: 8 },
  leaderRank: { width: 24, fontSize: 13, fontWeight: '700', color: '#555' },
  leaderName: { flex: 1, fontSize: 14, color: '#fff' },
  leaderStreak: { fontSize: 14, fontWeight: '700', color: '#FF5C00' },
});
```

- [ ] **Step 3: Commit**

```bash
cd /Users/bobanpepic/trainedby-app
git add app/club/
git commit -m "feat: club detail screen with mission, check-in, and streak leaderboard"
```

---

## Task 5: Find tab — trainer search and list

**Files:**
- Modify: `trainedby-app/app/(tabs)/find.tsx`

The Find tab queries the `trainers` table directly, supports text search by name, and paginates with 20 trainers per page via `FlatList` infinite scroll.

- [ ] **Step 1: Replace app/(tabs)/find.tsx**

```typescript
// app/(tabs)/find.tsx
import { useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TextInput,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import TrainerCard, { type Trainer } from '../../components/TrainerCard';

const PAGE_SIZE = 20;

export default function FindScreen() {
  const router = useRouter();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const searchRef = useRef('');

  const fetchTrainers = useCallback(async (reset = false) => {
    const query = searchRef.current;
    const offset = reset ? 0 : offsetRef.current;

    if (reset) { setLoading(true); setTrainers([]); }
    else setLoadingMore(true);

    let req = supabase
      .from('trainers')
      .select('id, slug, name, title, avatar_url, city, specialties, avg_rating, review_count, reps_verified')
      .eq('verification_status', 'verified')
      .order('avg_rating', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (query.trim()) {
      req = req.ilike('name', `%${query.trim()}%`);
    }

    const { data } = await req;
    const rows = (data ?? []) as Trainer[];

    setTrainers(prev => reset ? rows : [...prev, ...rows]);
    offsetRef.current = offset + rows.length;
    setHasMore(rows.length === PAGE_SIZE);
    setLoading(false);
    setLoadingMore(false);
  }, []);

  // Initial load
  useState(() => { fetchTrainers(true); });

  function handleSearch(text: string) {
    setSearch(text);
    searchRef.current = text;
    offsetRef.current = 0;
    setHasMore(true);
    fetchTrainers(true);
  }

  function handleEndReached() {
    if (!loadingMore && hasMore) fetchTrainers(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Find Coaches</Text>
      <TextInput
        style={styles.search}
        placeholder="Search by name..."
        placeholderTextColor="#444"
        value={search}
        onChangeText={handleSearch}
        autoCorrect={false}
        autoCapitalize="none"
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#FF5C00" />
        </View>
      ) : (
        <FlatList
          data={trainers}
          keyExtractor={t => t.id}
          renderItem={({ item }) => (
            <TrainerCard
              trainer={item}
              onPress={() => router.push(`/trainer/${item.slug}`)}
            />
          )}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator color="#FF5C00" style={{ paddingVertical: 16 }} /> : null
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.empty}>No coaches found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  heading: { fontSize: 28, fontWeight: '900', color: '#fff', padding: 16, paddingBottom: 8, letterSpacing: -0.5 },
  search: {
    backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14,
    color: '#fff', fontSize: 15, marginHorizontal: 16, marginBottom: 8,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  empty: { fontSize: 15, color: '#555' },
});
```

- [ ] **Step 2: Commit**

```bash
cd /Users/bobanpepic/trainedby-app
git add "app/(tabs)/find.tsx"
git commit -m "feat: find tab with trainer search and infinite scroll"
```

---

## Task 6: Trainer profile screen

**Files:**
- Create: `trainedby-app/app/trainer/[slug].tsx`

The trainer profile calls the existing `get-trainer` edge function (no auth required) and displays bio, stats, active clubs, and a link to their video library.

- [ ] **Step 1: Create trainer directory**

```bash
mkdir -p /Users/bobanpepic/trainedby-app/app/trainer
```

- [ ] **Step 2: Create app/trainer/[slug].tsx**

```typescript
// app/trainer/[slug].tsx
import { useState, useEffect } from 'react';
import {
  View, Text, Image, ScrollView, Pressable,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { EDGE_BASE } from '../../lib/supabase';

type TrainerFull = {
  id: string;
  slug: string;
  name: string | null;
  title: string | null;
  bio: string | null;
  avatar_url: string | null;
  city: string | null;
  years_experience: number | null;
  clients_trained: number | null;
  avg_rating: number | string | null;
  review_count: number | null;
  reps_verified: boolean | null;
  specialties: string[] | string | null;
  subscription_price_cents: number | null;
};

type Club = {
  id: string;
  slug: string;
  name: string;
  goal: string;
  status: string;
  price_cents: number | null;
  is_free: boolean;
};

function getSpecialties(s: string[] | string | null): string[] {
  if (!s) return [];
  if (Array.isArray(s)) return s;
  try { const arr = JSON.parse(s); return Array.isArray(arr) ? arr : []; }
  catch { return [s]; }
}

export default function TrainerProfileScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [trainer, setTrainer] = useState<TrainerFull | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`${EDGE_BASE}/get-trainer?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(data => {
        setTrainer(data.trainer ?? data);
        setClubs(data.clubs ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#FF5C00" /></View>;
  }

  if (!trainer) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Trainer not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Go back</Text>
        </Pressable>
      </View>
    );
  }

  const specs = getSpecialties(trainer.specialties);
  const price = trainer.subscription_price_cents
    ? `AED ${Math.round(trainer.subscription_price_cents / 100)}/mo`
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero */}
        <View style={styles.hero}>
          {trainer.avatar_url ? (
            <Image source={{ uri: trainer.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {(trainer.name ?? '?')[0].toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.name}>{trainer.name}</Text>
          {trainer.title && <Text style={styles.title}>{trainer.title}</Text>}
          {trainer.city && <Text style={styles.city}>{trainer.city}</Text>}
          {trainer.reps_verified && (
            <View style={styles.repsBadge}>
              <Text style={styles.repsText}>✓ REPs Verified</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {trainer.years_experience != null && (
            <View style={styles.stat}>
              <Text style={styles.statNum}>{trainer.years_experience}</Text>
              <Text style={styles.statLabel}>Years exp</Text>
            </View>
          )}
          {trainer.clients_trained != null && trainer.clients_trained > 0 && (
            <View style={styles.stat}>
              <Text style={styles.statNum}>{trainer.clients_trained}+</Text>
              <Text style={styles.statLabel}>Clients</Text>
            </View>
          )}
          {trainer.avg_rating && Number(trainer.avg_rating) > 0 && (
            <View style={styles.stat}>
              <Text style={styles.statNum}>★ {Number(trainer.avg_rating).toFixed(1)}</Text>
              <Text style={styles.statLabel}>{trainer.review_count ?? 0} reviews</Text>
            </View>
          )}
        </View>

        {/* Specialties */}
        {specs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specialties</Text>
            <View style={styles.tags}>
              {specs.map(s => (
                <View key={s} style={styles.tag}>
                  <Text style={styles.tagText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bio */}
        {trainer.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{trainer.bio}</Text>
          </View>
        )}

        {/* Video library */}
        {price && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Video Library</Text>
            <Text style={styles.subtext}>Subscribe for {price} to access all workouts and tutorials.</Text>
          </View>
        )}

        {/* Clubs */}
        {clubs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Clubs</Text>
            {clubs.map(club => (
              <Pressable
                key={club.id}
                style={styles.clubRow}
                onPress={() => router.push(`/club/${club.id}`)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.clubName}>{club.name}</Text>
                  <Text style={styles.clubGoal} numberOfLines={1}>{club.goal}</Text>
                </View>
                <Text style={styles.clubPrice}>
                  {club.is_free ? 'Free' : club.price_cents ? `AED ${Math.round(club.price_cents / 100)}` : ''}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorText: { color: '#888', fontSize: 16, marginBottom: 16 },
  header: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: { alignSelf: 'flex-start' },
  backText: { color: '#FF5C00', fontSize: 16, fontWeight: '600' },
  back: { color: '#FF5C00', fontSize: 15 },
  hero: { alignItems: 'center', padding: 24, paddingBottom: 16 },
  avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: 12 },
  avatarPlaceholder: { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { fontSize: 40, fontWeight: '700', color: '#fff' },
  name: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 4 },
  title: { fontSize: 14, color: '#888', marginBottom: 2 },
  city: { fontSize: 13, color: '#555', marginBottom: 8 },
  repsBadge: { backgroundColor: 'rgba(255,92,0,0.15)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4 },
  repsText: { fontSize: 12, color: '#FF5C00', fontWeight: '700' },
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 32, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#1a1a1a', marginBottom: 8 },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 2 },
  statLabel: { fontSize: 11, color: '#555' },
  section: { padding: 16, paddingTop: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#555', letterSpacing: 1, marginBottom: 12 },
  bio: { fontSize: 15, color: '#aaa', lineHeight: 24 },
  subtext: { fontSize: 14, color: '#888', lineHeight: 22 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#1a1a1a', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#2a2a2a' },
  tagText: { fontSize: 12, color: '#aaa' },
  clubRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  clubName: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 3 },
  clubGoal: { fontSize: 12, color: '#666' },
  clubPrice: { fontSize: 13, fontWeight: '700', color: '#FF5C00' },
});
```

- [ ] **Step 3: Commit**

```bash
cd /Users/bobanpepic/trainedby-app
git add app/trainer/
git commit -m "feat: trainer profile screen with stats, bio, and clubs"
```

---

## Task 7: Smoke test

No new files — verify each screen end-to-end in the simulator.

- [ ] **Step 1: Start the dev server**

```bash
cd /Users/bobanpepic/trainedby-app
npx expo start --clear
```

- [ ] **Step 2: Verify Home tab**

Sign in as `bobanpepic@gmail.com`. Home tab should show "No active clubs yet" (since no club membership exists). This is correct — the empty state confirms the data fetch works.

- [ ] **Step 3: Verify Find tab**

Tap Find. Should show a list of trainers from the database (there are sample trainers). Search "Sarah" — should filter results.

- [ ] **Step 4: Verify trainer profile**

Tap a trainer card. Profile screen should load with their details, bio, and clubs.

- [ ] **Step 5: Verify navigation back**

Tap ‹ Back. Should return to Find tab.

- [ ] **Step 6: Verify club detail deep link (manual DB setup)**

In Supabase dashboard, insert a test club member row for `bobanpepic@gmail.com`:

```sql
-- First get the user's id from auth.users
-- Then find an active club id
-- Then insert:
INSERT INTO club_members (club_id, user_id) 
VALUES ('<club_id>', '<user_id>');
```

Reload the app. Home tab should show the club card. Tap it — club detail screen loads with today's mission and check-in button.

- [ ] **Step 7: Final commit**

```bash
cd /Users/bobanpepic/trainedby-app
git commit --allow-empty -m "chore: Phase 2 complete — clubs, check-in, find, trainer profile verified"
```
