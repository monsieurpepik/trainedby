import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Props {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function SubscriptionSettings({ supabaseUrl, supabaseAnonKey }: Props) {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [state, setState] = useState<'loading' | 'ready' | 'saving' | 'saved' | 'noauth'>('loading');
  const [trainerId, setTrainerId] = useState<string | null>(null);

  const sb = useMemo(() => createClient(supabaseUrl, supabaseAnonKey), [supabaseUrl, supabaseAnonKey]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { setState('noauth'); return; }

      const { data: trainer } = await sb
        .from('trainers')
        .select('id,subscription_price_cents')
        .eq('email', user.email)
        .maybeSingle();

      if (!trainer) { setState('noauth'); return; }
      setTrainerId(trainer.id);
      setCurrentPrice(trainer.subscription_price_cents ?? null);
      if (trainer.subscription_price_cents) {
        setPriceInput(String(Math.round(trainer.subscription_price_cents / 100)));
      }
      setState('ready');
    }
    load();
  }, [sb]);

  async function save() {
    if (!trainerId) return;
    const cents = priceInput ? Math.round(parseFloat(priceInput) * 100) : null;
    setState('saving');

    const { error } = await sb
      .from('trainers')
      .update({ subscription_price_cents: cents })
      .eq('id', trainerId);

    if (!error) {
      setCurrentPrice(cents);
      setState('saved');
      setTimeout(() => setState('ready'), 2000);
    } else {
      console.error('Save failed:', error.message);
      setState('ready');
    }
  }

  if (state === 'loading') return <div style={{ padding: '40px 16px', color: '#555', fontFamily: 'Manrope, system-ui, sans-serif', textAlign: 'center' }}>Loading…</div>;
  if (state === 'noauth') {
    if (typeof window !== 'undefined') window.location.href = '/join';
    return null;
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '32px 16px 80px', fontFamily: 'Manrope, system-ui, sans-serif', color: '#fff' }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 6 }}>Subscription settings</h1>
      <p style={{ fontSize: 14, color: '#888', marginBottom: 32 }}>
        Set a monthly price for access to your full video library. Leave blank to disable subscriptions.
      </p>

      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 12, color: '#888', fontWeight: 600, display: 'block', marginBottom: 8 }}>Monthly price (AED)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 16, color: '#555' }}>AED</div>
          <input
            type="number"
            min="0"
            step="1"
            value={priceInput}
            onChange={e => setPriceInput(e.target.value)}
            placeholder="e.g. 49"
            style={{ flex: 1, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px', color: '#fff', fontSize: 16, fontFamily: 'inherit', outline: 'none' }}
          />
          <div style={{ fontSize: 14, color: '#555' }}>/month</div>
        </div>
        <div style={{ fontSize: 11, color: '#555', marginTop: 6 }}>You keep 80% · TrainedBy takes 20%</div>
      </div>

      {currentPrice && (
        <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, padding: '14px 16px', marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: '#a78bfa', fontWeight: 700, marginBottom: 4 }}>Current price</div>
          <div style={{ fontSize: 16, color: '#fff', fontWeight: 700 }}>AED {Math.round(currentPrice / 100)}/month</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>You earn AED {Math.round(currentPrice / 100 * 0.8)}/subscriber/month</div>
        </div>
      )}

      <button
        onClick={save}
        disabled={state === 'saving'}
        style={{ background: state === 'saved' ? 'rgba(74,222,128,0.15)' : '#7c3aed', border: state === 'saved' ? '1px solid rgba(74,222,128,0.3)' : 'none', borderRadius: 8, padding: '13px 28px', fontSize: 14, fontWeight: 700, color: state === 'saved' ? '#4ade80' : '#fff', cursor: state === 'saving' ? 'not-allowed' : 'pointer', opacity: state === 'saving' ? 0.6 : 1, fontFamily: 'inherit', width: '100%' }}
      >
        {state === 'saving' ? 'Saving…' : state === 'saved' ? 'Saved ✓' : 'Save price'}
      </button>
    </div>
  );
}
