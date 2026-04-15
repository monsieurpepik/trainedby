// ─── Client-side i18n runtime ─────────────────────────────────────────────
// This script runs in the browser and translates all elements with data-i18n
// attributes. It reads the locale from window.__LOCALE__ (injected by Base.astro).
//
// Usage in HTML:
//   <span data-i18n="find.title">Find a Trainer</span>
//   <input data-i18n-placeholder="find.search_placeholder" placeholder="Search…">
//   <meta data-i18n-content="find.title" name="description">

type Locale = 'en' | 'fr' | 'it' | 'es';

declare global {
  interface Window {
    __LOCALE__: Locale;
    __BRAND__: { name: string; tagline: string; domain: string };
    __I18N__: Record<string, string>;
  }
}

export function initI18n() {
  const locale: Locale = window.__LOCALE__ || 'en';
  if (locale === 'en') return; // English is the default  -  no DOM changes needed

  const strings = window.__I18N__;
  if (!strings) return;

  // Translate text content
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n')!;
    if (strings[key]) el.textContent = strings[key];
  });

  // Translate placeholder attributes
  document.querySelectorAll<HTMLInputElement>('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder')!;
    if (strings[key]) el.placeholder = strings[key];
  });

  // Translate meta content attributes
  document.querySelectorAll<HTMLMetaElement>('[data-i18n-content]').forEach(el => {
    const key = el.getAttribute('data-i18n-content')!;
    if (strings[key]) el.content = strings[key];
  });

  // Translate title attributes (tooltips)
  document.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title')!;
    if (strings[key]) el.title = strings[key];
  });

  // Update brand name everywhere
  const brand = window.__BRAND__;
  if (brand) {
    document.querySelectorAll<HTMLElement>('[data-brand-name]').forEach(el => {
      el.textContent = brand.name;
    });
    document.querySelectorAll<HTMLElement>('[data-brand-tagline]').forEach(el => {
      el.textContent = brand.tagline;
    });
  }

  // Update document lang attribute
  document.documentElement.lang = locale;

  // Update page title if it contains "TrainedBy"
  if (brand && document.title.includes('TrainedBy')) {
    document.title = document.title.replace(/TrainedBy/g, brand.name);
  }
}
