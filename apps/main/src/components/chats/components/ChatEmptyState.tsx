import { useCreateApp } from '@/components/apps/appsHooks'
import { AppEngineType } from '@/components/apps/appsTypes'
import { StyledLink } from '@/components/ui/StyledLink'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'

export const ChatEmptyState = () => {
  const { mutate: createApp } = useCreateApp()
  const { data: workspace } = useCurrentWorkspace()

  const handleCreateApp = () => {
    if (!workspace?.id) return
    createApp({ workspaceId: workspace.id, engineType: AppEngineType.Default })
  }

  return (
    <div className="flex h-full w-full justify-center pt-32 text-center">
      <div className="space-y-2">
        <div className="text-2xl font-bold">No chatbots found</div>
        <div className="">
          To get started,{' '}
          <StyledLink onClick={handleCreateApp}>
            create your first chatbot
          </StyledLink>
          .
        </div>
      </div>
    </div>
  )
}
