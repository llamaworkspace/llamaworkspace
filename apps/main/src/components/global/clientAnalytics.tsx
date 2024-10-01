import { env } from '@/env.mjs'
import type { SimplePrimitive } from '@/shared/globalTypes'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react'
import { useSelf } from '../users/usersHooks'
import { useCurrentWorkspace } from '../workspaces/workspacesHooks'
import type { EventsRegistry } from './eventsRegistry'

const OSS_POSTHOG_KEY = 'phc_L07v1DhPpbN1dMkanlCVDQNgIhXT3lvy36zZMecGyNC'

const posthogKey = env.NEXT_PUBLIC_POSTHOG_API_KEY ?? OSS_POSTHOG_KEY
const isOss = !env.NEXT_PUBLIC_POSTHOG_API_KEY

let isInitialized = false

const posthogInitialize = (trackPageViews = false) => {
  if (isInitialized) return
  if (typeof window !== 'undefined') {
    isInitialized = true
    posthog.init(posthogKey, {
      api_host: 'https://eu.i.posthog.com',
      autocapture: false,
      capture_pageview: !isOss && trackPageViews,
      capture_heatmaps: false,
      capture_pageleave: false,
      capture_performance: false,
      disable_session_recording: true,
      disable_surveys: true,
      person_profiles: 'identified_only',
      loaded: (posthog) => {
        // debug mode in development. "doInit" must still be called in development
        if (true || process.env.NODE_ENV === 'development') {
          posthog.debug()
        }
      },
    })
  }
}

interface AnalyticsProviderProps extends PropsWithChildren {
  trackPageViews?: boolean
  identifyUser?: boolean
}

const IdentifyUser = ({ children }: PropsWithChildren) => {
  const isUserIdentified = useRef(false)

  const { data: user } = useSelf()

  useEffect(() => {
    if (isUserIdentified.current) {
      return
    }
    if (!user) {
      return
    }
    isUserIdentified.current = true

    posthog.identify(user.id)
  }, [user])
  return <>{children}</>
}

export const AnalyticsProvider = ({
  children,
  trackPageViews = false,
  identifyUser = false,
}: AnalyticsProviderProps) => {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (isInitialized) {
      return
    }
    setIsInitialized(true)
    posthogInitialize(trackPageViews)
  }, [isInitialized, trackPageViews])

  const Wrapper = identifyUser ? IdentifyUser : Fragment

  return (
    <Wrapper>
      <PostHogProvider client={posthog}>{children}</PostHogProvider>
    </Wrapper>
  )
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
