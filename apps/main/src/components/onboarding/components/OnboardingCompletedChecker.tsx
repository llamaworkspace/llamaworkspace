import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { useEffect } from 'react'

export const OnboardingCompletedChecker = () => {
  const { data: workspace } = useCurrentWorkspace()
  const navigation = useNavigation()

  const redirectToOnboarding = workspace && !workspace?.onboardingCompletedAt
  const workspaceId = workspace?.id

  useEffect(() => {
    if (!workspaceId) return

    if (redirectToOnboarding) {
      void navigation.replace('/w/:workspaceId/onboarding', {
        workspaceId,
      })
    }
  }, [redirectToOnboarding, navigation, workspaceId])

  return null
}
