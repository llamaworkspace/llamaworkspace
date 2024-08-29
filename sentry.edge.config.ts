// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
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
