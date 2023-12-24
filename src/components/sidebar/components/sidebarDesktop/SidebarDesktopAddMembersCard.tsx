import { StyledLink } from '@/components/ui/StyledLink'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'

export const SidebarDesktopAddMembersCard = () => {
  const { workspace } = useCurrentWorkspace()
  const settingsUrl = `/w/${workspace?.id}/settings/members?focus=add_members`

  return (
    <div className="m-2 flex flex-col">
      <div className="border-zinc-800x space-y-2 rounded border bg-zinc-50 p-4 py-6">
        <div className="font-semibold tracking-tight">Invite your team ✨</div>
        <div className="text-xs">
          Invite your team to this workspace and share your chatbots easily.
        </div>

        <div className="text-xs">
          <StyledLink href={settingsUrl}>Invite members</StyledLink>
        </div>
      </div>
    </div>
  )
}
