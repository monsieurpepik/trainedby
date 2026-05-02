import { useState, useEffect } from 'react';
import type { Review } from './types';

const SUPABASE_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo';

const STAR_FILLED = '#1A1411';
const STAR_EMPTY = 'rgba(0,0,0,0.12)';

interface ReviewsProps {
  trainerId: string;
}

interface ReviewsState {
  loading: boolean;
  reviews: Review[];
  total: number;
  error: boolean;
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= Math.round(rating) ? STAR_FILLED : STAR_EMPTY, fontSize: size }}>
          ★
        </span>
      ))}
    </span>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const name = review.client_name || 'Client';
  const initials = name.substring(0, 2).toUpperCase();
  const dateStr = review.created_at
    ? new Date(review.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : '';

  return (
    <div style={{ background: '#F8F7F5', borderRadius: '12px', padding: '16px 18px', marginBottom: '10px' }}>
      <div style={{ marginBottom: '10px' }}>
        <Stars rating={review.rating ?? 0} size={12} />
      </div>
      {review.review_text && (
        <div style={{ fontSize: '13px', fontWeight: 300, color: '#4A4440', lineHeight: 1.6, marginBottom: '12px' }}>
          {review.review_text}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '11px', fontWeight: 600,
          color: 'var(--text-secondary)', flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ fontSize: '13px', fontWeight: 400, color: '#111111' }}>{name}</div>
        {dateStr && (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{dateStr}</div>
        )}
      </div>
    </div>
  );
}

export default function Reviews({ trainerId }: ReviewsProps) {
  const [state, setState] = useState<ReviewsState>({
    loading: true,
    reviews: [],
    total: 0,
    error: false,
  });

  useEffect(() => {
    if (!trainerId) return;

    async function fetchReviews() {
      try {
        const r = await fetch(
          `${SUPABASE_URL}/rest/v1/reviews?trainer_id=eq.${trainerId}&booking_id=not.is.null&order=created_at.desc&limit=2`,
          {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              Prefer: 'count=exact',
            },
          }
        );
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const rawTotal = parseInt(r.headers.get('content-range')?.split('/')[1] ?? '0', 10);
        const total = isNaN(rawTotal) ? 0 : rawTotal;
        const reviews: Review[] = await r.json();
        setState({ loading: false, reviews, total, error: false });
      } catch {
        setState({ loading: false, reviews: [], total: 0, error: true });
      }
    }

    fetchReviews();
  }, [trainerId]);

  if (state.loading) {
    return (
      <div className="tb-reviews">
        <div className="tb-section-label" style={{ marginBottom: '12px' }}>Reviews</div>
        <div className="tb-reviews-loading">Loading reviews...</div>
      </div>
    );
  }

  // Hide section entirely if no reviews (spec requirement)
  if (state.reviews.length === 0 || state.total === 0) return null;

  const avg = state.reviews.reduce((a, b) => a + (b.rating ?? 0), 0) / state.reviews.length;

  return (
    <div className="tb-reviews">
      <div className="tb-section-label" style={{ marginBottom: '12px' }}>Reviews</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <div style={{ fontSize: '32px', fontWeight: 200, letterSpacing: '-0.02em', color: '#111111', lineHeight: 1 }}>
          {avg.toFixed(1)}
        </div>
        <div>
          <div style={{ display: 'flex', gap: '2px', marginBottom: '3px' }}>
            <Stars rating={avg} />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            from {state.total} verified client{state.total !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
      {state.reviews.map((rv, i) => (
        <ReviewCard key={rv.id ?? i} review={rv} />
      ))}
    </div>
  );
}
