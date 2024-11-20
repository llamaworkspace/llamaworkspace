import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const OnboardingCompletedChecker = () => {
  const { data: workspace } = useCurrentWorkspace()
  const router = useRouter()

  const redirectToOnboarding = workspace && !workspace?.onboardingCompletedAt
  const workspaceId = workspace?.id

  useEffect(() => {
    if (!workspaceId) return

    if (redirectToOnboarding) {
      router.replace(`/w/${workspaceId}/onboarding`)
    }
  }, [redirectToOnboarding, router, workspaceId])

  return null
}
