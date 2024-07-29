import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { OnboardingScreen } from './OnboardingScreen'

export const OnboardingModal = () => {
  const { data: workspace } = useCurrentWorkspace()

  const modalIsOpen = workspace && !workspace?.onboardingCompletedAt

  if (!modalIsOpen) {
    return null
  }

  return (
    <Dialog open={modalIsOpen}>
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
