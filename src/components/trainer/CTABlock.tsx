interface CTABlockProps {
  paymentEnabled: boolean;
  whatsappNumber: string;
  displayName: string;
}

const WaIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.852L.057 23.55a.75.75 0 0 0 .916.916l5.698-1.471A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.528-5.208-1.443l-.374-.22-3.881 1.001 1.022-3.767-.241-.389A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
  </svg>
);

const CalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export default function CTABlock({ paymentEnabled, whatsappNumber, displayName }: CTABlockProps) {
  const waBookUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Hi ${displayName}, I found your profile and I'd like to book a session.`
      )}`
    : null;

  function open(url: string | null) {
    if (url) window.open(url, '_blank', 'noopener');
  }

  if (!whatsappNumber) {
    return null;
  }

  return (
    <div className="tb-cta">
      <div className="tb-glass" style={{ margin: '12px 16px 0', borderRadius: '18px', overflow: 'hidden' }}>
        <button
          className="tb-btn-primary"
          onClick={() => open(waBookUrl)}
          style={{ animation: 'wa-pulse 2s ease infinite' }}
        >
          <WaIcon />
          Message on WhatsApp
        </button>
      </div>
    </div>
  );
}
