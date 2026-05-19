// src/components/club/SeasonBadge.tsx

interface Props {
  seasonNumber: number;
  isActive?: boolean;
  isCompleted?: boolean;
  size?: 'sm' | 'md';
}

export function SeasonBadge({ seasonNumber, isActive, isCompleted, size = 'md' }: Props) {
  const fontSize = size === 'sm' ? '10px' : '11px';
  const padding = size === 'sm' ? '3px 8px' : '4px 10px';

  const bg = isActive
    ? 'rgba(249,115,22,0.12)'
    : isCompleted
    ? 'rgba(74,222,128,0.10)'
    : 'rgba(255,255,255,0.06)';

  const border = isActive
    ? '1px solid rgba(249,115,22,0.25)'
    : isCompleted
    ? '1px solid rgba(74,222,128,0.20)'
    : '1px solid rgba(255,255,255,0.10)';

  const color = isActive ? '#f97316' : isCompleted ? '#4ade80' : '#888';

  const label = isCompleted
    ? `S${seasonNumber} ✓`
    : isActive
    ? `Season ${seasonNumber}`
    : `S${seasonNumber}`;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      background: bg,
      border,
      borderRadius: '100px',
      padding,
      fontSize,
      fontWeight: 700,
      color,
      fontFamily: 'Manrope, system-ui, sans-serif',
      letterSpacing: 0,
    }}>
      {label}
    </span>
  );
}
