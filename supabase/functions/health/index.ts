/**
 * TrainedBy — Health Check Endpoint
 * GET /functions/v1/health
 *
 * Returns platform status, version, and uptime.
 * Used by monitoring services (UptimeRobot, Netlify, CI).
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'apikey, Authorization, Content-Type',
};

const VERSION = '1.3.0'; // Week 3 — YC-ready release

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';

  // Lightweight DB ping — check trainers table is accessible
  let dbStatus = 'unknown';
  let dbLatencyMs = 0;
  try {
    const dbStart = Date.now();
    const res = await fetch(`${supabaseUrl}/rest/v1/trainers?select=id&limit=1`, {
      headers: {
        'apikey': Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') ?? ''}`,
      },
    });
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = res.ok ? 'ok' : `error:${res.status}`;
  } catch (err) {
    dbStatus = `error:${(err as Error).message}`;
  }

  const payload = {
    status: dbStatus === 'ok' ? 'ok' : 'degraded',
    version: VERSION,
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: dbStatus,
        latency_ms: dbLatencyMs,
      },
      edge_functions: {
        status: 'ok',
      },
    },
    environment: Deno.env.get('ENVIRONMENT') ?? 'production',
  };

  const httpStatus = payload.status === 'ok' ? 200 : 503;

  return new Response(JSON.stringify(payload, null, 2), {
    status: httpStatus,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
});
