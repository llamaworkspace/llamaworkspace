import { env } from '@/env.mjs'
import type { TriggerConfig } from '@trigger.dev/sdk/v3'

export const config: TriggerConfig = {
  project: env.TRIGGER_DOT_DEV_PROJECT_ID,
  logLevel: 'log',
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 20000,
      factor: 3,
      randomize: true,
    },
  },
}
