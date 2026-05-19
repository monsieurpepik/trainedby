// src/components/club/FollowButton.tsx
import { useState } from 'react';

interface Props {
  clubId: string;
  initialFollowing: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
  accessToken: string | null;
  onAuthRequired: () => void;
}

export function FollowButton({
  clubId,
  initialFollowing,
  supabaseUrl,
  supabaseAnonKey,
  accessToken,
  onAuthRequired,
}: Props) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!accessToken) {
      onAuthRequired();
      return;
    }
    setLoading(true);
    const fn = following ? 'unfollow-club' : 'follow-club';
    try {
      // Optimistic update
      setFollowing(!following);
      const res = await fetch(`${supabaseUrl}/functions/v1/${fn}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ club_id: clubId }),
      });
      if (!res.ok) {
        // Revert on failure
        setFollowing(following);
      }
    } catch {
      setFollowing(following);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        background: following ? 'rgba(255,255,255,0.08)' : 'transparent',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '100px',
        padding: '10px 20px',
        fontSize: '13px',
        fontWeight: 600,
        color: following ? '#fff' : '#aaa',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'Manrope, system-ui, sans-serif',
        opacity: loading ? 0.6 : 1,
        transition: 'all 0.15s',
      }}
    >
      {following ? 'Following ✓' : 'Follow free'}
    </button>
  );
}
