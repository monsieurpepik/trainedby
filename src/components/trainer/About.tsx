import { useState } from 'react';

interface AboutProps {
  bio: string;
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
      <button
        className="tb-read-more"
        onClick={() => setExpanded((prev) => !prev)}
      >
        {expanded ? 'Read less' : 'Read more →'}
      </button>
    </div>
  );
}
