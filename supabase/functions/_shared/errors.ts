/**
 * TrainedBy — Standardised Error Responses
 * Ensures all edge functions return consistent error shapes.
 */

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'apikey, Authorization, Content-Type, x-client-info',
};

export function jsonResponse(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  });
}

export function errorResponse(message: string, status: number, code?: string) {
  return jsonResponse({ error: message, code: code ?? 'ERROR', status }, status);
}

export function validationError(field: string, message: string) {
  return jsonResponse({ error: message, field, code: 'VALIDATION_ERROR', status: 400 }, 400);
}

export function rateLimitError(retryAfterSeconds = 60) {
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please try again later.', code: 'RATE_LIMITED', status: 429 }),
    {
      status: 429,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSeconds),
        'X-RateLimit-Limit': '5',
      },
    }
  );
}

export function unauthorizedError(message = 'Unauthorized') {
  return errorResponse(message, 401, 'UNAUTHORIZED');
}

export function notFoundError(resource = 'Resource') {
  return errorResponse(`${resource} not found`, 404, 'NOT_FOUND');
}

export function serverError(message = 'Internal server error') {
  return errorResponse(message, 500, 'SERVER_ERROR');
}

/** Strip HTML tags and trim whitespace from user input */
export function sanitize(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')           // Strip HTML tags
    .replace(/javascript:/gi, '')       // Strip JS protocol
    .replace(/on\w+\s*=/gi, '')         // Strip event handlers
    .trim()
    .substring(0, 2000);               // Hard cap at 2000 chars
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/** Validate UUID v4 format */
export function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

/** Validate UAE phone number (9 digits, starting with 5) */
export function isValidUAEPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\+()]/g, '');
  // Accept: 501234567, 971501234567, +971501234567
  return /^(971|0)?5[0-9]{8}$/.test(cleaned);
}
