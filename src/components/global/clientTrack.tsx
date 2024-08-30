import { env } from '@/env.mjs'
import type { SimplePrimitive } from '@/shared/globalTypes'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect, useRef, type PropsWithChildren } from 'react'
import { useSelf } from '../users/usersHooks'
import { useCurrentWorkspace } from '../workspaces/workspacesHooks'

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
    eventName: string,
    attributes: Record<string, SimplePrimitive> = {},
  ) => {
    if (!workspace) return
    posthog.capture(eventName, { workspaceId: workspace.id, ...attributes })
  }
}
