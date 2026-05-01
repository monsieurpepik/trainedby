import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const host = request.headers.get('host') || 'trainedby.ae';
  const domain = host.split(':')[0];
  const isLocal = domain === 'localhost' || domain.startsWith('127.');
  const protocol = isLocal ? 'http' : 'https';

  const body = `User-agent: *
Allow: /

# Block admin and internal pages from indexing
Disallow: /admin
Disallow: /superadmin
Disallow: /dashboard
Disallow: /edit
Disallow: /plan-builder

# Allow all trainer profiles and public pages
Allow: /find
Allow: /join
Allow: /pricing
Allow: /blog
Allow: /community
Allow: /for-trainers

# Sitemap — generated dynamically per domain
Sitemap: ${protocol}://${domain}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
