import { env } from '@/env.mjs'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import type { PropsWithChildren } from 'react'
env

const NEXT_PUBLIC_POSTHOG_KEY =
  'phc_L07v1DhPpbN1dMkanlCVDQNgIhXT3lvy36zZMecGyNC'
const isProduction = env.NEXT_PUBLIC_ENV === 'production'

let isInitialized = false
const doInit = () => {
  if (isInitialized) return
  if (typeof window !== 'undefined') {
    isInitialized = true
    posthog.init(NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: 'https://eu.i.posthog.com',
      autocapture: false,
      person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug() // debug mode in development
      },
    })
  }
}

if (isProduction) {
  doInit()
}

export const AnalyticsProvider = ({ children }: PropsWithChildren) => {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}

export const clientTrack = (
  eventName: string,
  attributes: Record<string, string>,
) => {
  posthog.capture('my event', attributes)
}
