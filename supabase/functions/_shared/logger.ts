/**
 * TrainedBy  -  Structured Logger
 * Shared across all edge functions.
 *
 * Outputs JSON-structured logs compatible with Supabase log viewer,
 * Datadog, and any log aggregation service.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  function: string;
  timestamp: string;
  duration_ms?: number;
  status_code?: number;
  error?: string;
  [key: string]: unknown;
}

export function createLogger(functionName: string) {
  function log(level: LogLevel, message: string, meta: Record<string, unknown> = {}) {
    const entry: LogEntry = {
      level,
      message,
      function: functionName,
      timestamp: new Date().toISOString(),
      ...meta,
    };
    // Supabase edge function logs go to stdout
    if (level === 'error' || level === 'warn') {
      console.error(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  }

  return {
    debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta),
    info: (msg: string, meta?: Record<string, unknown>) => log('info', msg, meta),
    warn: (msg: string, meta?: Record<string, unknown>) => log('warn', msg, meta),
    error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),

    /** Log a completed request with timing */
    request: (req: Request, statusCode: number, startTime: number, meta?: Record<string, unknown>) => {
      const url = new URL(req.url);
      log('info', 'request_completed', {
        method: req.method,
        path: url.pathname,
        query: url.search,
        status_code: statusCode,
        duration_ms: Date.now() - startTime,
        ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown',
        ...meta,
      });
    },

    /** Log an error with stack trace */
    exception: (err: unknown, context?: Record<string, unknown>) => {
      const error = err instanceof Error ? err : new Error(String(err));
      log('error', 'unhandled_exception', {
        error: error.message,
        stack: error.stack?.split('\n').slice(0, 5).join(' | '),
        ...context,
      });
    },
  };
}
