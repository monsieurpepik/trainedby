/**
 * sitemap — Per-Domain Dynamic Sitemap Generator
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates a market-specific sitemap.xml for each domain.
 * Called by Netlify's edge rewrite: /sitemap.xml → this function.
 *
 * GET /sitemap?domain=trainedby.ae
 * Returns: application/xml sitemap with all trainer profile URLs for that market
 *
 * Also handles /robots.txt generation per domain.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MARKET_DOMAINS: Record<string, { domain: string; market: string; lang: string }> = {
  'trainedby.ae':    { domain: 'https://trainedby.ae',    market: 'ae', lang: 'en-AE' },
  'trainedby.com':   { domain: 'https://trainedby.com',   market: 'com', lang: 'en' },
  'trainedby.uk':    { domain: 'https://trainedby.uk',    market: 'uk', lang: 'en-GB' },
  'trainedby.in':    { domain: 'https://trainedby.in',    market: 'in', lang: 'en-IN' },
  'coachepar.fr':    { domain: 'https://coachepar.fr',    market: 'fr', lang: 'fr-FR' },
  'allenaticon.it':  { domain: 'https://allenaticon.it',  market: 'it', lang: 'it-IT' },
  'entrenacon.com':  { domain: 'https://entrenacon.com',  market: 'es', lang: 'es-ES' },
  'entrenacon.mx':   { domain: 'https://entrenacon.mx',   market: 'mx', lang: 'es-MX' },
};

const STATIC_PAGES = ['/', '/find', '/pricing', '/join', '/blog', '/for-trainers'];

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const domainParam = url.searchParams.get('domain') || 'trainedby.ae';
  const type = url.searchParams.get('type') || 'sitemap';

  const marketInfo = MARKET_DOMAINS[domainParam] ?? MARKET_DOMAINS['trainedby.ae'];
  const { domain, market, lang } = marketInfo;

  // ── robots.txt ──────────────────────────────────────────────────────────
  if (type === 'robots') {
    const robots = `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /edit
Disallow: /admin
Disallow: /superadmin
Disallow: /academy/*/admin

Sitemap: ${domain}/sitemap.xml
`;
    return new Response(robots, {
      headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=86400' }
    });
  }

  // ── sitemap.xml ──────────────────────────────────────────────────────────
  const sb = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Get all verified trainers for this market
  const { data: trainers } = await sb
    .from('trainers')
    .select('slug, updated_at')
    .eq('market', market)
    .eq('reps_verified', true)
    .order('updated_at', { ascending: false })
    .limit(10000);

  // Get all academies for this market
  const { data: academies } = await sb
    .from('academies')
    .select('slug, updated_at')
    .eq('market', market)
    .eq('verified', true)
    .limit(1000);

  const now = new Date().toISOString().split('T')[0];

  const staticUrls = STATIC_PAGES.map(page => `
  <url>
    <loc>${domain}${page}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('');

  const trainerUrls = (trainers ?? []).map(t => `
  <url>
    <loc>${domain}/${t.slug}</loc>
    <lastmod>${t.updated_at?.split('T')[0] ?? now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

  const academyUrls = (academies ?? []).map(a => `
  <url>
    <loc>${domain}/academy/${a.slug}</loc>
    <lastmod>${a.updated_at?.split('T')[0] ?? now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticUrls}
${trainerUrls}
${academyUrls}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    }
  });
});
