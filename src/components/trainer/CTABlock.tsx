interface CTABlockProps {
  paymentEnabled: boolean;
  whatsappNumber: string;       // digits only, e.g. "971501234567"
  displayName: string;
}

export default function CTABlock({ paymentEnabled, whatsappNumber, displayName }: CTABlockProps) {
  const ctaLabel = paymentEnabled ? 'Book a Session' : 'Request a Session';

  const bookingUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Hi ${displayName}, I found your profile on TrainedBy and I'd like to book a session.`
      )}`
    : null;

  const messageUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi, I'd like to get in touch.")}`
    : null;

  function handleBookClick() {
    if (bookingUrl) {
      window.open(bookingUrl, '_blank', 'noopener');
    } else {
      alert('Booking coming soon!');
    }
  }

  function handleMessageClick() {
    if (messageUrl) {
      window.open(messageUrl, '_blank', 'noopener');
    } else {
      alert('Contact coming soon!');
    }
  }

  return (
    <div className="tb-cta">
      <button
        className="tb-btn-primary"
        onClick={handleBookClick}
        style={whatsappNumber ? { animation: 'wa-pulse 2s ease infinite' } : undefined}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {ctaLabel}
      </button>
      <button className="tb-btn-secondary" onClick={handleMessageClick}>
        Send a message
      </button>
    </div>
  );
}
