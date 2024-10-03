// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { env } from '@/env.mjs'
import * as Sentry from '@sentry/nextjs'

function sentryInit() {
  Sentry.init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  })
}

if (env.NEXT_PUBLIC_SENTRY_DSN) {
  sentryInit()
}
