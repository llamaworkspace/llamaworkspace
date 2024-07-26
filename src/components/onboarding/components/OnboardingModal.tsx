import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { api } from '@/lib/api'
import { OnboardingScreen } from './OnboardingScreen'

export const OnboardingModal = () => {
  const { data: workspace } = useCurrentWorkspace()
  const utils = api.useContext()

  const handleSuccess = () => {
    void utils.users.getSelf.invalidate()
  }

  const modalIsOpen = !workspace?.onboardingCompletedAt

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
        <OnboardingScreen onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
