import { Button } from '@/components/ui/button'
import { useCreateWorkspace } from '@/components/workspaces/workspacesHooks'
import { useNavigation } from '@/lib/frontend/useNavigation'

export default function WorkspaceNewPage() {
  const { mutate: createWorkspace } = useCreateWorkspace()
  const navigation = useNavigation()

  const handleClick = () => {
    void createWorkspace(undefined, {
      onSuccess: (workspace) => {
        void navigation.push('/w/:workspaceId', { workspaceId: workspace.id })
      },
    })
  }
  return (
    <div className="mx-auto max-w-xl p-4">
      <Button onClick={handleClick}>New workspace now!</Button>
    </div>
  )
}
