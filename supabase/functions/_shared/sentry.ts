/**
 * TrainedBy — Sentry Error Monitoring
 * ─────────────────────────────────────────────────────────────────────────────
 * Lightweight Sentry integration for Deno edge functions.
 * Uses the Sentry HTTP API directly (no SDK dependency).
 *
 * Usage:
 *   import { captureException, captureMessage } from '../_shared/sentry.ts';
 *   await captureException(err, { function: 'ceo-agent', trainer_id });
 */

const SENTRY_DSN = Deno.env.get('SENTRY_DSN') || '';
const ENVIRONMENT = Deno.env.get('ENVIRONMENT') || 'production';
const RELEASE = Deno.env.get('SENTRY_RELEASE') || '1.0.0';

interface SentryContext {
  function?: string;
  trainer_id?: string;
  market?: string;
  [key: string]: unknown;
}

function parseDsn(dsn: string): { url: string; projectId: string; key: string } | null {
  try {
    const url = new URL(dsn);
    const key = url.username;
    const projectId = url.pathname.replace('/', '');
    const sentryUrl = `${url.protocol}//${url.host}/api/${projectId}/store/`;
    return { url: sentryUrl, projectId, key };
  } catch {
    return null;
  }
}

async function sendToSentry(payload: Record<string, unknown>): Promise<void> {
  if (!SENTRY_DSN) return; // Silently skip if not configured
  const parsed = parseDsn(SENTRY_DSN);
  if (!parsed) return;

  try {
    await fetch(parsed.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${parsed.key}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Never let Sentry break the main function
  }
}

/** Capture an unhandled exception */
export async function captureException(
  err: unknown,
  context: SentryContext = {},
): Promise<void> {
  const error = err instanceof Error ? err : new Error(String(err));
  const frames = error.stack
    ?.split('\n')
    .slice(1)
    .map((line) => {
      const match = line.trim().match(/^at (.+?) \((.+?):(\d+):(\d+)\)$/);
      if (match) {
        return { function: match[1], filename: match[2], lineno: parseInt(match[3]), colno: parseInt(match[4]) };
      }
      return { filename: line.trim() };
    }) || [];

  await sendToSentry({
    event_id: crypto.randomUUID().replace(/-/g, ''),
    timestamp: new Date().toISOString(),
    platform: 'javascript',
    level: 'error',
    environment: ENVIRONMENT,
    release: RELEASE,
    tags: {
      function: context.function || 'unknown',
      market: context.market || 'unknown',
    },
    extra: context,
    exception: {
      values: [{
        type: error.name,
        value: error.message,
        stacktrace: { frames: frames.reverse() },
      }],
    },
  });
}

/** Capture a message (warning, info) */
export async function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context: SentryContext = {},
): Promise<void> {
  await sendToSentry({
    event_id: crypto.randomUUID().replace(/-/g, ''),
    timestamp: new Date().toISOString(),
    platform: 'javascript',
    level,
    environment: ENVIRONMENT,
    release: RELEASE,
    message: { formatted: message },
    tags: {
      function: context.function || 'unknown',
      market: context.market || 'unknown',
    },
    extra: context,
  });
}
