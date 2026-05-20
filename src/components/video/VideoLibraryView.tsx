import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { VideoLibrary } from './VideoLibrary';

interface Trainer {
  id: string;
  name: string;
  slug: string;
  title?: string | null;
  avatar_url?: string | null;
  subscription_price_cents: number | null;
}

interface Video {
  id: string;
  title: string;
  description?: string | null;
  duration_seconds?: number | null;
  thumbnail_url?: string | null;
  is_free: boolean;
  status: string;
  mux_playback_id?: string | null;
}

interface Props {
  trainerSlug: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function VideoLibraryView({ trainerSlug, supabaseUrl, supabaseAnonKey }: Props) {
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [subscribing, setSubscribing] = useState(false);

  const sb = createClient(supabaseUrl, supabaseAnonKey);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await sb.auth.getSession();
      const token = session?.access_token ?? null;
      setAccessToken(token);

      // Fetch trainer — note: trainers table uses 'name' not 'full_name'
      const { data: trainerData, error: trainerErr } = await sb
        .from('trainers')
        .select('id,name,slug,title,avatar_url,subscription_price_cents')
        .eq('slug', trainerSlug)
        .maybeSingle();

      if (trainerErr || !trainerData) { setState('error'); return; }
      setTrainer(trainerData as Trainer);

      // Fetch videos
      const { data: videosData } = await sb
        .from('videos')
        .select('id,title,description,duration_seconds,thumbnail_url,is_free,status,mux_playback_id')
        .eq('trainer_id', trainerData.id)
        .order('created_at', { ascending: false });
      setVideos((videosData ?? []) as Video[]);

      // Subscriber count
      const { count: subCount } = await sb
        .from('coach_subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('trainer_id', trainerData.id)
        .eq('status', 'active');
      setSubscriberCount(subCount ?? 0);

      // Check if current user is subscribed
      if (session?.user) {
        setUserId(session.user.id);
        const { data: sub } = await sb
          .from('coach_subscriptions')
          .select('id')
          .eq('trainer_id', trainerData.id)
          .eq('subscriber_id', session.user.id)
          .in('status', ['active', 'trialing'])
          .maybeSingle();
        setIsSubscriber(!!sub);
      }

      setState('ready');
    }
    load();
  }, [trainerSlug]);

  async function handleSubscribe() {
    if (!accessToken) {
      window.location.href = `/auth/callback?next=/${trainerSlug}/videos`;
      return;
    }
    if (!trainer) return;
    setSubscribing(true);
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/create-coach-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ trainer_id: trainer.id }),
      });
      const data = await res.json();
      if (data.checkout_url) window.location.href = data.checkout_url;
      if (data.already_subscribed) setIsSubscriber(true);
    } finally {
      setSubscribing(false);
    }
  }

  if (state === 'loading') {
    return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontFamily: 'Manrope, system-ui, sans-serif' }}>Loading…</div>;
  }
  if (state === 'error' || !trainer) {
    return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontFamily: 'Manrope, system-ui, sans-serif' }}>Coach not found.</div>;
  }

  const freeCount = videos.filter(v => v.is_free && v.status === 'ready').length;
  const totalCount = videos.filter(v => v.status === 'ready').length;
  const priceDisplay = trainer.subscription_price_cents
    ? `AED ${Math.round(trainer.subscription_price_cents / 100)}/month`
    : null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px 80px', fontFamily: 'Manrope, system-ui, sans-serif', color: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: trainer.avatar_url ? `url(${trainer.avatar_url}) center/cover` : '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
          {!trainer.avatar_url && trainer.name[0]}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 2 }}>{trainer.name}</h1>
          <div style={{ fontSize: 13, color: '#888' }}>{subscriberCount} subscribers · {totalCount} workouts</div>
        </div>
        {priceDisplay && !isSubscriber && (
          <button
            onClick={handleSubscribe}
            disabled={subscribing}
            style={{ background: '#7c3aed', border: 'none', borderRadius: 100, padding: '10px 20px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: subscribing ? 'not-allowed' : 'pointer', opacity: subscribing ? 0.6 : 1, fontFamily: 'inherit', whiteSpace: 'nowrap' }}
          >
            {subscribing ? '…' : `Subscribe · ${priceDisplay}`}
          </button>
        )}
        {isSubscriber && (
          <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 100, padding: '8px 16px', fontSize: 12, color: '#4ade80', fontWeight: 700 }}>
            Subscribed ✓
          </div>
        )}
      </div>

      {/* Subscription banner for non-subscribers with a price */}
      {!isSubscriber && priceDisplay && (
        <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              {freeCount} free previews · {totalCount - freeCount} subscriber-only workouts
            </div>
            <div style={{ fontSize: 12, color: '#888' }}>Subscribe for {priceDisplay} to access the full library</div>
          </div>
          <button
            onClick={handleSubscribe}
            disabled={subscribing}
            style={{ background: '#7c3aed', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: subscribing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
          >
            Subscribe →
          </button>
        </div>
      )}

      <VideoLibrary
        videos={videos}
        isSubscriber={isSubscriber}
        supabaseUrl={supabaseUrl}
        supabaseAnonKey={supabaseAnonKey}
        accessToken={accessToken}
        onSubscribeCta={handleSubscribe}
      />
    </div>
  );
}
