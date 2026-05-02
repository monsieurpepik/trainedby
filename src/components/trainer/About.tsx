import { useState } from 'react';

interface AboutProps {
  bio: string | undefined | null;
}

export default function About({ bio }: AboutProps) {
  const [expanded, setExpanded] = useState(false);

  if (!bio) return null;

  return (
    <div className="tb-about">
      <div className="tb-section-label" style={{ marginBottom: '12px' }}>About</div>
      <div
        className={`tb-about-text${expanded ? ' expanded' : ''}`}
        id="tb-about-text"
      >
        {bio}
      </div>
      {!expanded && (
        <button
          className="tb-read-more"
          style={{ color: '#9A9290', fontWeight: 400 }}
          onClick={() => setExpanded(true)}
        >
          Read more →
        </button>
      )}
    </div>
  );
}
