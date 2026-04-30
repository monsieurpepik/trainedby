import * as Sentry from '@sentry/astro';

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  environment: import.meta.env.MODE === 'production' ? 'production' : 'development',
  tracesSampleRate: 0.1,
  enabled: !!import.meta.env.PUBLIC_SENTRY_DSN,
});
