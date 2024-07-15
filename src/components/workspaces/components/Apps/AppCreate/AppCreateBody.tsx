import { useCreateApp } from '@/components/apps/appsHooks'
import { BoxedRadioGroup } from '@/components/ui/boxed-radio-group'
import { Button } from '@/components/ui/button'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'

const options = [
  {
    value: 'simple',
    title: 'Simple assistant',
    description:
      'An instructions-based assistant for repeatable use cases. Compatible with any Large Language model.',
  },
  {
    value: 'openai-assistant',
    title: 'Document-enhanced assistant',
    description:
      'A document-augmented assistant that queries provided documents to deliver contextually relevant responses. Currently it is only compatible with OpenAI.',
  },
  // {
  //   value: 'external',
  //   title: 'Your own external assistant',
  //   description:
  //     'Build your own assistant with custom logic and integrate it here for easy access.',
  // },
]

export const AppCreateBody = () => {
  const { data: workspace } = useCurrentWorkspace()
  const { mutateAsync: createApp } = useCreateApp()

  const handleCreateApp = async () => {
    if (!workspace?.id) return
    await createApp({ workspaceId: workspace.id })
  }

  return (
    <div className="space-y-8">
      <div>
        <BoxedRadioGroup options={options} />
      </div>

      <Button onClick={() => void handleCreateApp()}>Create app</Button>
    </div>
  )
}
