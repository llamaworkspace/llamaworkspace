import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { useEffect } from 'react'
import { OnboardingScreen } from './OnboardingScreen'

export const OnboardingCompletedChecker = () => {
  const { data: workspace } = useCurrentWorkspace()
  const navigation = useNavigation()

  const redirectToOnboarding = workspace && !workspace?.onboardingCompletedAt
  const workspaceId = workspace?.id

  useEffect(() => {
    if (!workspaceId) return
    void navigation.replace('/w/:workspaceId/onboarding', {
      workspaceId,
    })
  }, [redirectToOnboarding, navigation, workspaceId])

  if (!redirectToOnboarding) {
    return null
  }

  return (
    <Dialog open={redirectToOnboarding}>
      <DialogContent
        hideCloseButton={true}
        className="max-h-screen overflow-y-scroll sm:max-w-[600px]"
      >
        <DialogHeader>
          <DialogTitle>Welcome to Llama Workspace</DialogTitle>
        </DialogHeader>
        <OnboardingScreen />
      </DialogContent>
    </Dialog>
  )
}
