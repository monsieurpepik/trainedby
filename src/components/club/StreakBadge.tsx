export function StreakBadge({ days }: { days: number }) {
  if (days < 1) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: 12, fontWeight: 600, color: '#f59e0b',
    }}>
      🔥 {days}
    </span>
  );
}
