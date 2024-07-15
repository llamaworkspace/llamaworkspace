import { useCreateApp } from '@/components/apps/appsHooks'
import { Button } from '@/components/ui/button'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { cn } from '@/lib/utils'

const options = [
  {
    title: 'Simple assistant',
    description:
      'An instructions-based assistant for repeatable use cases. Compatible with any Large Language model.',
  },
  {
    title: 'Document-enhanced assistant',
    description:
      'A document-augmented assistant that queries provided documents to deliver contextually relevant responses. Currently it is only compatible with OpenAI.',
  },
  {
    title: 'Your own external assistant',
    description:
      'Build your own assistant with custom logic and integrate it here for easy access.',
  },
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
        <div>
          {options.map((option, index) => {
            const isFirst = index === 0
            const isLast = index === options.length - 1
            const isSelected = index === 0
            return (
              <div
                key={option.title}
                className={cn(
                  'border-b border-l border-r p-4',
                  isFirst && 'rounded-t-md border-t',
                  isLast && 'rounded-b-md',
                  isSelected && 'border-2 border-zinc-600 bg-zinc-100',
                )}
              >
                <div className="font-semibold">{option.title}</div>
                <div className="text-sm text-zinc-600">
                  {option.description}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <Button onClick={() => void handleCreateApp()}>Create new app</Button>
    </div>
  )
}
