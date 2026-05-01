import type { APIRoute } from 'astro';

const SUPABASE_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co';
const EDGE_BASE = SUPABASE_URL + '/functions/v1';

export const GET: APIRoute = async ({ request }) => {
  const host = request.headers.get('host') || 'trainedby.ae';
  const domain = host.split(':')[0];

  const upstream = await fetch(`${EDGE_BASE}/sitemap?domain=${encodeURIComponent(domain)}`);
  const xml = await upstream.text();

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
    status: upstream.status,
  });
};
