import { env } from '@/env.mjs'
import type { SimplePrimitive } from '@/shared/globalTypes'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect, useRef, type PropsWithChildren } from 'react'
import { useSelf } from '../users/usersHooks'
import { useCurrentWorkspace } from '../workspaces/workspacesHooks'
import type { EventsRegistry } from './eventsRegistry'

const OSS_POSTHOG_KEY = 'phc_L07v1DhPpbN1dMkanlCVDQNgIhXT3lvy36zZMecGyNC'

const posthogKey = env.NEXT_PUBLIC_POSTHOG_API_KEY ?? OSS_POSTHOG_KEY

const isProduction = env.NEXT_PUBLIC_ENV === 'production'

let isInitialized = false

const doInit = () => {
  if (isInitialized) return
  if (typeof window !== 'undefined') {
    isInitialized = true
    posthog.init(posthogKey, {
      api_host: 'https://eu.i.posthog.com',
      autocapture: false,
      capture_pageview: false,
      capture_heatmaps: false,
      capture_pageleave: false,
      capture_performance: false,
      disable_session_recording: true,
      disable_surveys: true,
      person_profiles: 'identified_only',
      loaded: (posthog) => {
        // debug mode in development. "doInit" must still be called somehow
        if (process.env.NODE_ENV === 'development') posthog.debug()
      },
    })
  }
}

if (isProduction) {
  doInit()
}
doInit()

export const AnalyticsProvider = ({ children }: PropsWithChildren) => {
  const hasRun = useRef(false)
  const { data: user } = useSelf()

  useEffect(() => {
    if (hasRun.current) {
      return
    }
    if (!user) {
      return
    }
    hasRun.current = true
    posthog.identify(user.id)
  }, [user])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}

export const useTrack = () => {
  const { data: workspace } = useCurrentWorkspace()
  return (
    eventName: EventsRegistry,
    attributes: Record<string, SimplePrimitive> = {},
  ) => {
    if (!workspace) return
    posthog.capture(eventName, { workspaceId: workspace.id, ...attributes })
  }
}
