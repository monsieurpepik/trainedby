# TrainedBy React Native — Phase 1: Scaffold + Auth + Navigation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A runnable Expo app with working email auth, session persistence, coach detection, and a tab navigation shell — all tabs exist with placeholder screens, auth gate redirects unauthenticated users to login.

**Architecture:** Expo SDK 52 + Expo Router v3 (file-based routing), Supabase JS client with expo-secure-store session persistence. Coach detection queries the `trainers` table after login and swaps the Find tab for a My Club tab. No new backend work — connects to the existing Supabase project `mezhtdbfyvkshpuplqqw`.

**Tech Stack:** Expo SDK 52, Expo Router v3, TypeScript, @supabase/supabase-js, expo-secure-store, react-native-url-polyfill, @expo/vector-icons (pre-installed)

---

## File Map

```
trainedby-app/                  ← new repo root (sibling to trainedby/)
  app.json                      ← Expo config — scheme, bundle IDs, plugins
  package.json                  ← main: "expo-router/entry"
  tsconfig.json                 ← strict TypeScript
  lib/
    supabase.ts                 ← Supabase client with SecureStore adapter
  context/
    auth.tsx                    ← Session, isCoach, trainerId — global React context
  app/
    _layout.tsx                 ← Root layout — AuthProvider + AuthGate
    auth/
      login.tsx                 ← Email/password sign-in + link to signup
      signup.tsx                ← Email/password registration
    (tabs)/
      _layout.tsx               ← Tab bar — 5 tabs, coach tab swap
      index.tsx                 ← Home placeholder
      find.tsx                  ← Find placeholder
      library.tsx               ← Library placeholder
      live.tsx                  ← Live placeholder
      profile.tsx               ← Profile — shows email + sign out
      coach.tsx                 ← Coach placeholder
```

---

## Task 1: Initialize Expo project

**Files:**
- Create: `trainedby-app/` (entire directory via CLI)

- [ ] **Step 1: Run create-expo-app in the parent directory**

```bash
cd /Users/bobanpepic
npx create-expo-app@latest trainedby-app --template blank-typescript
```

Expected output ends with: `✅ Your project is ready!`

- [ ] **Step 2: Verify the scaffold exists**

```bash
ls trainedby-app/
```

Expected: `App.tsx  app.json  assets/  node_modules/  package.json  tsconfig.json`

- [ ] **Step 3: Remove the default App.tsx — Expo Router replaces it**

```bash
rm /Users/bobanpepic/trainedby-app/App.tsx
```

- [ ] **Step 4: Init git**

```bash
cd /Users/bobanpepic/trainedby-app
git init
git add -A
git commit -m "chore: initialize Expo blank-typescript scaffold"
```

---

## Task 2: Install dependencies + configure app.json and package.json

**Files:**
- Modify: `trainedby-app/package.json`
- Modify: `trainedby-app/app.json`
- Modify: `trainedby-app/tsconfig.json`

- [ ] **Step 1: Install all dependencies**

```bash
cd /Users/bobanpepic/trainedby-app
npx expo install expo-router @supabase/supabase-js expo-secure-store expo-auth-session expo-web-browser expo-video react-native-url-polyfill
```

Expected: packages installed, no peer-dep errors.

- [ ] **Step 2: Set main entry point in package.json**

Open `package.json`. Change the `"main"` field (if present) or add it so it reads:

```json
{
  "main": "expo-router/entry"
}
```

Full `package.json` after edit (preserve existing fields, just ensure `"main"` is correct):

```json
{
  "name": "trainedby-app",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios"
  }
}
```

(Leave `dependencies` and `devDependencies` as installed — do not overwrite them.)

- [ ] **Step 3: Replace app.json**

```json
{
  "expo": {
    "name": "TrainedBy",
    "slug": "trainedby-app",
    "scheme": "trainedby",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "dark",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0a0a0a"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.trainedby.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0a0a0a"
      },
      "package": "com.trainedby.app"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store"
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

- [ ] **Step 4: Replace tsconfig.json**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.d.ts",
    "expo-env.d.ts"
  ]
}
```

- [ ] **Step 5: Commit**

```bash
cd /Users/bobanpepic/trainedby-app
git add -A
git commit -m "chore: install deps, configure app.json and package.json for Expo Router"
```

---

## Task 3: Create Supabase client

**Files:**
- Create: `trainedby-app/lib/supabase.ts`

- [ ] **Step 1: Create the lib directory and supabase.ts**

```bash
mkdir -p /Users/bobanpepic/trainedby-app/lib
```

- [ ] **Step 2: Write lib/supabase.ts**

```typescript
// lib/supabase.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const SUPABASE_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo';
export const EDGE_BASE = `${SUPABASE_URL}/functions/v1`;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

- [ ] **Step 3: Commit**

```bash
cd /Users/bobanpepic/trainedby-app
git add lib/supabase.ts
git commit -m "feat: add Supabase client with SecureStore session adapter"
```

---

## Task 4: Create auth context

**Files:**
- Create: `trainedby-app/context/auth.tsx`

The context exposes `session`, `isCoach`, `trainerId`, and `loading`. After any login event it queries `trainers.eq('email', user.email)` — if a row exists the user is a coach.

- [ ] **Step 1: Create the context directory**

```bash
mkdir -p /Users/bobanpepic/trainedby-app/context
```

- [ ] **Step 2: Write context/auth.tsx**

```typescript
// context/auth.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextValue = {
  session: Session | null;
  isCoach: boolean;
  trainerId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  isCoach: false,
  trainerId: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isCoach, setIsCoach] = useState(false);
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) {
        detectCoach(session.user.email);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.email) {
        detectCoach(session.user.email);
      } else {
        setIsCoach(false);
        setTrainerId(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function detectCoach(email: string) {
    const { data } = await supabase
      .from('trainers')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    setIsCoach(!!data);
    setTrainerId(data?.id ?? null);
    setLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ session, isCoach, trainerId, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

- [ ] **Step 3: Commit**

```bash
cd /Users/bobanpepic/trainedby-app
git add context/auth.tsx
git commit -m "feat: add auth context with session persistence and coach detection"
```

---

## Task 5: Create login and signup screens

**Files:**
- Create: `trainedby-app/app/auth/login.tsx`
- Create: `trainedby-app/app/auth/signup.tsx`

- [ ] **Step 1: Create auth directory**

```bash
mkdir -p /Users/bobanpepic/trainedby-app/app/auth
```

- [ ] **Step 2: Write app/auth/login.tsx**

```typescript
// app/auth/login.tsx
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signIn() {
    if (!email || !password) {
      Alert.alert('Error', 'Enter your email and password.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert('Sign in failed', error.message);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>TrainedBy</Text>
      <Text style={styles.sub}>Sign in to your account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#555"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#555"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.btn} onPress={signIn} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Signing in…' : 'Sign in'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/auth/signup')}>
        <Text style={styles.link}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#0a0a0a', padding: 32,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32, fontWeight: '900', color: '#fff',
    marginBottom: 8, letterSpacing: -1,
  },
  sub: { fontSize: 14, color: '#888', marginBottom: 40 },
  input: {
    backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16,
    color: '#fff', fontSize: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  btn: {
    backgroundColor: '#FF5C00', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { color: '#888', textAlign: 'center', marginTop: 24, fontSize: 14 },
});
```

- [ ] **Step 3: Write app/auth/signup.tsx**

```typescript
// app/auth/signup.tsx
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUp() {
    if (!email || !password) {
      Alert.alert('Error', 'Enter your email and password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert('Sign up failed', error.message);
    } else {
      Alert.alert('Check your email', 'We sent a confirmation link.', [
        { text: 'OK', onPress: () => router.replace('/auth/login') },
      ]);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.sub}>Join TrainedBy</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#555"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Password (min 6 chars)"
        placeholderTextColor="#555"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.btn} onPress={signUp} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Creating account…' : 'Sign up'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/auth/login')}>
        <Text style={styles.link}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#0a0a0a', padding: 32,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32, fontWeight: '900', color: '#fff',
    marginBottom: 8, letterSpacing: -1,
  },
  sub: { fontSize: 14, color: '#888', marginBottom: 40 },
  input: {
    backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16,
    color: '#fff', fontSize: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  btn: {
    backgroundColor: '#FF5C00', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { color: '#888', textAlign: 'center', marginTop: 24, fontSize: 14 },
});
```

- [ ] **Step 4: Commit**

```bash
cd /Users/bobanpepic/trainedby-app
git add app/auth/login.tsx app/auth/signup.tsx
git commit -m "feat: add login and signup screens"
```

---

## Task 6: Create root layout with auth gate

**Files:**
- Create: `trainedby-app/app/_layout.tsx`

The root layout wraps everything in `AuthProvider` and redirects unauthenticated users to `/auth/login`. Once logged in, it redirects away from auth screens to `/`.

- [ ] **Step 1: Create app/_layout.tsx**

```typescript
// app/_layout.tsx
import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '../context/auth';

function AuthGate() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === 'auth';
    if (!session && !inAuth) {
      router.replace('/auth/login');
    } else if (session && inAuth) {
      router.replace('/');
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#FF5C00" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/bobanpepic/trainedby-app
git add app/_layout.tsx
git commit -m "feat: add root layout with auth gate"
```

---

## Task 7: Create tab layout with coach tab swap

**Files:**
- Create: `trainedby-app/app/(tabs)/_layout.tsx`

All 6 tab screens are defined. Coaches see Home / My Club / Library / Live / Profile. Members see Home / Find / Library / Live / Profile. The unused tab is hidden with `href: null`.

- [ ] **Step 1: Create (tabs) directory**

```bash
mkdir -p /Users/bobanpepic/trainedby-app/app/\(tabs\)
```

- [ ] **Step 2: Write app/(tabs)/_layout.tsx**

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { useAuth } from '../../context/auth';
import { Ionicons } from '@expo/vector-icons';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, [IconName, IconName]> = {
  home:       ['home',        'home-outline'],
  search:     ['search',      'search-outline'],
  people:     ['people',      'people-outline'],
  'play-circle': ['play-circle', 'play-circle-outline'],
  radio:      ['radio',       'radio-outline'],
  person:     ['person',      'person-outline'],
};

function icon(name: string, focused: boolean) {
  const [active, inactive] = TAB_ICONS[name] ?? ['ellipse', 'ellipse-outline'];
  return <Ionicons name={focused ? active : inactive} size={24} color={focused ? '#FF5C00' : '#666'} />;
}

export default function TabLayout() {
  const { isCoach } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0a0a0a', borderTopColor: '#1a1a1a' },
        tabBarActiveTintColor: '#FF5C00',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => icon('home', focused),
        }}
      />
      <Tabs.Screen
        name="find"
        options={{
          title: 'Find',
          href: isCoach ? null : undefined,
          tabBarIcon: ({ focused }) => icon('search', focused),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'My Club',
          href: isCoach ? undefined : null,
          tabBarIcon: ({ focused }) => icon('people', focused),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ focused }) => icon('play-circle', focused),
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: 'Live',
          tabBarIcon: ({ focused }) => icon('radio', focused),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => icon('person', focused),
        }}
      />
    </Tabs>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/bobanpepic/trainedby-app
git add "app/(tabs)/_layout.tsx"
git commit -m "feat: add tab layout with coach/member tab swap"
```

---

## Task 8: Create all tab placeholder screens

**Files:**
- Create: `trainedby-app/app/(tabs)/index.tsx`
- Create: `trainedby-app/app/(tabs)/find.tsx`
- Create: `trainedby-app/app/(tabs)/library.tsx`
- Create: `trainedby-app/app/(tabs)/live.tsx`
- Create: `trainedby-app/app/(tabs)/coach.tsx`
- Create: `trainedby-app/app/(tabs)/profile.tsx`

Profile is not a placeholder — it shows the signed-in email and a working sign-out button. The others are labeled placeholders ready for Phase 2/3/4.

- [ ] **Step 1: Write app/(tabs)/index.tsx**

```typescript
// app/(tabs)/index.tsx
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.sub}>Your active clubs will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center', padding: 32 },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 8 },
  sub: { fontSize: 14, color: '#555', textAlign: 'center' },
});
```

- [ ] **Step 2: Write app/(tabs)/find.tsx**

```typescript
// app/(tabs)/find.tsx
import { View, Text, StyleSheet } from 'react-native';

export default function FindScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find Coaches</Text>
      <Text style={styles.sub}>Browse and search coaches — coming in Phase 2.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center', padding: 32 },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 8 },
  sub: { fontSize: 14, color: '#555', textAlign: 'center' },
});
```

- [ ] **Step 3: Write app/(tabs)/library.tsx**

```typescript
// app/(tabs)/library.tsx
import { View, Text, StyleSheet } from 'react-native';

export default function LibraryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Video Library</Text>
      <Text style={styles.sub}>Your subscribed coaches' videos — coming in Phase 3.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center', padding: 32 },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 8 },
  sub: { fontSize: 14, color: '#555', textAlign: 'center' },
});
```

- [ ] **Step 4: Write app/(tabs)/live.tsx**

```typescript
// app/(tabs)/live.tsx
import { View, Text, StyleSheet } from 'react-native';

export default function LiveScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live</Text>
      <Text style={styles.sub}>Active live sessions — coming in Phase 4.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center', padding: 32 },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 8 },
  sub: { fontSize: 14, color: '#555', textAlign: 'center' },
});
```

- [ ] **Step 5: Write app/(tabs)/coach.tsx**

```typescript
// app/(tabs)/coach.tsx
import { View, Text, StyleSheet } from 'react-native';

export default function CoachScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Club</Text>
      <Text style={styles.sub}>Member roster and check-ins — coming in Phase 4.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center', padding: 32 },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 8 },
  sub: { fontSize: 14, color: '#555', textAlign: 'center' },
});
```

- [ ] **Step 6: Write app/(tabs)/profile.tsx — working sign-out**

```typescript
// app/(tabs)/profile.tsx
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../context/auth';

export default function ProfileScreen() {
  const { session, isCoach, signOut } = useAuth();

  function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.email}>{session?.user?.email}</Text>
      {isCoach && <Text style={styles.badge}>Coach account</Text>}
      <TouchableOpacity style={styles.btn} onPress={handleSignOut}>
        <Text style={styles.btnText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center',
    alignItems: 'center', padding: 32,
  },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 16 },
  email: { fontSize: 14, color: '#888', marginBottom: 8 },
  badge: {
    fontSize: 12, color: '#FF5C00', fontWeight: '700',
    borderWidth: 1, borderColor: '#FF5C00', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4, marginBottom: 16,
  },
  btn: {
    marginTop: 32, backgroundColor: '#1a1a1a', borderRadius: 12,
    padding: 16, paddingHorizontal: 40,
    borderWidth: 1, borderColor: '#333',
  },
  btnText: { color: '#ff5555', fontSize: 16, fontWeight: '700' },
});
```

- [ ] **Step 7: Commit**

```bash
cd /Users/bobanpepic/trainedby-app
git add "app/(tabs)/"
git commit -m "feat: add tab placeholder screens + working profile/sign-out"
```

---

## Task 9: Smoke test on simulator

This task has no files to create — it verifies the app runs correctly end-to-end.

- [ ] **Step 1: Start the dev server**

```bash
cd /Users/bobanpepic/trainedby-app
npx expo start
```

Press `i` for iOS simulator or `a` for Android emulator.

- [ ] **Step 2: Verify unauthenticated redirect**

Expected: App opens directly to the Login screen. No tab bar visible.

- [ ] **Step 3: Sign in with a real account**

Use an existing account from the TrainedBy Supabase project (create one at trainedby.ae if needed, or use the Supabase dashboard to create a test user).

Expected: After sign in, tab bar appears. Home screen shows "Your active clubs will appear here."

- [ ] **Step 4: Verify coach tab swap**

Sign in with an email that matches a row in the `trainers` table (e.g. a trainer's email from the web app).

Expected: "My Club" tab appears instead of "Find". Profile screen shows "Coach account" badge.

- [ ] **Step 5: Verify sign out**

Tap Profile → Sign out → Confirm.

Expected: Tab bar disappears, Login screen appears. On next app launch (kill + reopen), Login screen appears (session not persisted after sign out).

- [ ] **Step 6: Verify session persistence**

Sign in, then kill and reopen the app without signing out.

Expected: App goes directly to Home tab — no login screen. Session was persisted in SecureStore.

- [ ] **Step 7: Final commit**

```bash
cd /Users/bobanpepic/trainedby-app
git add -A
git commit -m "chore: Phase 1 complete — scaffold, auth, navigation verified on simulator"
```

---

## What comes next

- **Phase 2:** Home feed + clubs — `app/(tabs)/index.tsx` pulls enrolled clubs from `club_members`, `app/club/[id].tsx` shows today's mission + check-in button + streak leaderboard
- **Phase 3:** Video library — `app/(tabs)/library.tsx` lists subscribed videos, `app/video/[id].tsx` plays Mux signed HLS
- **Phase 4:** Live streaming + coach dashboard — `app/live/[id].tsx` with Mux live player + Supabase Realtime chat + drop bar; `app/(tabs)/coach.tsx` member roster
