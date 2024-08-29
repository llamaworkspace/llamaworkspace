// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
const { env } = await import('./src/env.mjs')
function init() {
  if (!env.SENTRY_DSN) return

  Sentry.init({
    dsn: env.SENTRY_DSN,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1, // Set to 0 to disable tracing

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: env.SENTRY_DEBUG === 'true',
  })
}

if (env.SENTRY_DEBUG === 'true' || env.NODE_ENV === 'production') {
  init()
}
