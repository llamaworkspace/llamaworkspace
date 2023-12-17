import { StyledLink } from '@/components/ui/StyledLink'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'

export const SidebarDesktopOnboardingCard = () => {
  const { workspace } = useCurrentWorkspace()
  const settingsUrl = `/w/${workspace?.id}/settings`

  return (
    <div className="m-2 flex flex-col">
      <div className="border-zinc-800x space-y-2 rounded border bg-zinc-50 p-4 py-6">
        <div className="font-semibold tracking-tight">
          ✨ Use Joia without limits
        </div>
        <div className="text-xs">
          Add the OpenAI API keys to continue using us.
        </div>

        <div className="text-xs">
          <StyledLink href={settingsUrl}>Add your API keys</StyledLink>
        </div>
      </div>
    </div>
  )
}
