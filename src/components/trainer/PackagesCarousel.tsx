import type { Package } from './types';
import { formatPrice } from './utils';

interface PackagesCarouselProps {
  packages: Package[];
  currencySymbol: string;
  displayName: string;
  whatsappNumber: string;
}

export default function PackagesCarousel({
  packages,
  currencySymbol,
  displayName,
  whatsappNumber,
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
      <div className="tb-sessions-header">
        <span className="tb-section-label">Sessions</span>
        <a href="javascript:void(0)" className="tb-see-all">See all →</a>
      </div>
      <div className="tb-sessions-scroll">
        {packages.map((pkg, i) => {
          const pkgName = pkg.name || pkg.title || 'Package';
          const price = formatPrice(pkg, currencySymbol);
          return (
            <div key={pkg.id ?? i} className="tb-pkg-card">
              <div className="tb-pkg-name">{pkgName}</div>
              {pkg.sessions != null && (
                <div className="tb-pkg-detail">
                  {pkg.sessions} session{pkg.sessions !== 1 ? 's' : ''}
                </div>
              )}
              {pkg.description && (
                <div className="tb-pkg-detail">{pkg.description}</div>
              )}
              {price && <div className="tb-pkg-price">{price}</div>}
              {whatsappNumber && (
                <button className="tb-pkg-book" onClick={() => handleBook(pkg)}>
                  Book
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
