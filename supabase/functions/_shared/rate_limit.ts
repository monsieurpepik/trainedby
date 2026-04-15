/**
 * TrainedBy  -  In-Memory Rate Limiter
 * ─────────────────────────────────────────────────────────────────────────────
 * Sliding window rate limiter using Deno's in-memory Map.
 * Suitable for Supabase Edge Functions (single-instance per region).
 *
 * For multi-region rate limiting, use Supabase KV or Redis (future upgrade).
 *
 * Usage:
 *   import { checkRateLimit } from '../_shared/rate_limit.ts';
 *
 *   const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
 *   const limited = checkRateLimit(`register:${ip}`, 5, 60_000); // 5 per minute
 *   if (limited) return tooManyRequests();
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store  -  persists for the lifetime of the edge function instance
const store = new Map<string, RateLimitEntry>();

/**
 * Check if a key has exceeded its rate limit.
 * @param key        Unique key (e.g., `register:1.2.3.4`)
 * @param maxRequests Maximum requests allowed in the window
 * @param windowMs   Window size in milliseconds
 * @returns true if rate limited (request should be rejected)
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // First request or window expired  -  start fresh
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (entry.count >= maxRequests) {
    return true; // Rate limited
  }

  entry.count++;
  return false;
}

/**
 * Get remaining requests for a key (for X-RateLimit-Remaining header).
 */
export function getRateLimitRemaining(
  key: string,
  maxRequests: number,
): number {
  const entry = store.get(key);
  if (!entry || Date.now() > entry.resetAt) return maxRequests;
  return Math.max(0, maxRequests - entry.count);
}

/**
 * Add rate limit headers to a response.
 */
export function addRateLimitHeaders(
  headers: Record<string, string>,
  key: string,
  maxRequests: number,
): void {
  const entry = store.get(key);
  headers['X-RateLimit-Limit'] = String(maxRequests);
  headers['X-RateLimit-Remaining'] = String(getRateLimitRemaining(key, maxRequests));
  if (entry) {
    headers['X-RateLimit-Reset'] = String(Math.ceil(entry.resetAt / 1000));
  }
}

// Periodic cleanup to prevent memory leaks in long-running instances
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 60_000);
