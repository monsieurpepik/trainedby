const SUPABASE_URL = "https://mezhtdbfyvkshpuplqqw.supabase.co";
const EDGE_BASE = SUPABASE_URL + "/functions/v1";
const EMPTY_SITEMAP = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>';
const GET = async ({ request }) => {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "trainedby.ae";
  const domain = host.split(":")[0];
  let upstream;
  try {
    upstream = await fetch(`${EDGE_BASE}/sitemap?domain=${encodeURIComponent(domain)}`);
  } catch {
    return new Response(EMPTY_SITEMAP, {
      status: 502,
      headers: { "Content-Type": "application/xml; charset=utf-8" }
    });
  }
  if (!upstream.ok) {
    return new Response(EMPTY_SITEMAP, {
      status: upstream.status,
      headers: { "Content-Type": "application/xml; charset=utf-8" }
    });
  }
  const xml = await upstream.text();
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
