import type { StatItem } from './types';

interface StatsRowProps {
  stats: StatItem[];
}

export default function StatsRow({ stats }: StatsRowProps) {
  if (stats.length === 0) return null;

  return (
    <div
      className="tb-stats"
      style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}
    >
      {stats.map((s) => (
        <div key={s.label} className="tb-stat-item">
          <div className="tb-stat-num">{s.num}</div>
          <div className="tb-stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
