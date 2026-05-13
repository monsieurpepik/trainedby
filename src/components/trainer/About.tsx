import { useState } from 'react';

interface AboutProps {
  bio: string | undefined | null;
}

export default function About({ bio }: AboutProps) {
  const [expanded, setExpanded] = useState(false);

  if (!bio) return null;

  return (
    <div className="tb-glass tb-about" style={{ margin: '0 16px 12px' }}>
      <div className="tb-section-label" style={{ marginBottom: '10px' }}>About</div>
      <div
        className={`tb-about-text${expanded ? ' expanded' : ''}`}
      >
        {bio}
      </div>
      {bio.length > 120 && !expanded && (
        <button className="tb-read-more" onClick={() => setExpanded(true)}>
          Read more →
        </button>
      )}
    </div>
  );
}
