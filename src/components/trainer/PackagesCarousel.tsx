import type { Package } from './types';
import { formatPrice } from './utils';

interface PackagesCarouselProps {
  packages: Package[];
  currencySymbol: string;
  displayName: string;
  whatsappNumber: string;
}

export default function PackagesCarousel({
  packages, currencySymbol, displayName, whatsappNumber,
}: PackagesCarouselProps) {
  if (packages.length === 0) return null;

  function handleBook(pkg: Package) {
    if (!whatsappNumber) return;
    const pkgName = pkg.name || pkg.title || 'package';
    const msg = `Hi ${displayName}, I'm interested in the ${pkgName}.`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  }

  return (
    <div className="tb-sessions">
      <div className="tb-glass" style={{ margin: '0 16px 12px', overflow: 'hidden' }}>
        <div className="tb-sessions-header">
          <span className="tb-section-label">Sessions</span>
        </div>
        <div className="tb-sessions-scroll">
          {packages.map((pkg, i) => {
            const pkgName = pkg.name || pkg.title || 'Package';
            const price = formatPrice(pkg, currencySymbol);
            const meta = pkg.sessions != null
              ? `${pkg.sessions} session${pkg.sessions !== 1 ? 's' : ''}`
              : null;
            return (
              <div key={pkg.id ?? i} className="tb-pkg-card">
                <div>
                  <div className="tb-pkg-name">{pkgName}</div>
                  {meta && <div className="tb-pkg-detail">{meta}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {price && <div className="tb-pkg-price">{price}</div>}
                  {whatsappNumber && (
                    <button className="tb-pkg-book" onClick={() => handleBook(pkg)}>
                      Book
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
