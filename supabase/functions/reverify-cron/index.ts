/**
 * TrainedBy  -  Monthly Re-verification Cron
 * ─────────────────────────────────────────────────────────────────────────────
 * Thin cron wrapper that triggers the reverify-agent on the 1st of each month.
 * Scheduled via pg_cron in the DB migration (20260415_verification_system.sql).
 * Can also be triggered manually via POST for testing.
 *
 * POST /functions/v1/reverify-cron
 * Headers: x-admin-secret: <ADMIN_SECRET>
 */

import { CORS_HEADERS } from '../_shared/errors.ts';
import { createLogger } from '../_shared/logger.ts';

const log = createLogger('reverify-cron');

const SUPABASE_URL = () => Deno.env.get('SUPABASE_URL')!;
const ADMIN_SECRET = () => Deno.env.get('ADMIN_SECRET') ?? 'trainedby-admin-2026';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: CORS_HEADERS });

  // Allow GET for pg_cron invocation (no body) or POST with admin secret
  if (req.method === 'POST') {
    const secret = req.headers.get('x-admin-secret') ?? req.headers.get('authorization')?.replace('Bearer ', '');
    if (secret !== ADMIN_SECRET()) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }
  }

  log.info('Monthly re-verification cron triggered', { method: req.method, time: new Date().toISOString() });

  try {
    // Invoke the reverify-agent which does the actual work
    const agentRes = await fetch(`${SUPABASE_URL()}/functions/v1/reverify-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SB_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({ triggered_by: 'cron', timestamp: new Date().toISOString() }),
    });

    const result = await agentRes.json().catch(() => ({ status: agentRes.status }));

    log.info('reverify-agent invoked', { status: agentRes.status, result });

    return new Response(JSON.stringify({
      success: true,
      message: 'Monthly re-verification triggered',
      agent_status: agentRes.status,
      result,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });

  } catch (err) {
    log.exception(err);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to trigger reverify-agent',
      detail: String(err),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
});
