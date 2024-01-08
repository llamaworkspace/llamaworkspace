import { useSignOut } from '@/components/auth/authHooks'
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { DropdownMenuItemLink } from '@/components/ui/extensions/dropdown-menu'
import {
  useCurrentWorkspace,
  useWorkspaces,
} from '@/components/workspaces/workspacesHooks'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { CheckIcon } from '@heroicons/react/20/solid'

function SidebarDesktopHeaderWorkspacesDropdownSub() {
  const navigation = useNavigation()
  const { data: currentWorkspace } = useCurrentWorkspace()
  const { workspaces } = useWorkspaces()

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>Switch workspace</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {workspaces?.map((workspace) =>
          workspace.id === currentWorkspace?.id ? (
            <DropdownMenuLabel key={workspace.id}>
              <div className="flex flex-row items-center">
                <span className="w-5">
                  <CheckIcon className="h-3 w-3" />
                </span>
                {workspace.name}
              </div>
            </DropdownMenuLabel>
          ) : (
            <DropdownMenuItemLink
              key={workspace.id}
              href={navigation.buildPath('/w/:workspaceId', {
                workspaceId: workspace.id,
              })}
              className="ml-5"
            >
              {workspace.name}
            </DropdownMenuItemLink>
          ),
        )}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}

export function SidebarDesktopHeaderDropdownBody() {
  const navigation = useNavigation()
  const signOut = useSignOut()

  const { data: workspace } = useCurrentWorkspace()
  const profileLink = workspace?.id
    ? navigation.buildPath('/w/:workspaceId/profile', {
        workspaceId: workspace.id,
      })
    : '#'
  const settingsLink = workspace?.id
    ? navigation.buildPath('/w/:workspaceId/settings', {
        workspaceId: workspace.id,
      })
    : '#'

  return (
    <DropdownMenuContent className="ml-4 w-56">
      <DropdownMenuGroup>
        <DropdownMenuLabel>Workspace</DropdownMenuLabel>
        <SidebarDesktopHeaderWorkspacesDropdownSub />
        <DropdownMenuItemLink href={settingsLink} disabled={!workspace?.id}>
          Workspace settings
        </DropdownMenuItemLink>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        <DropdownMenuLabel>You</DropdownMenuLabel>
        <DropdownMenuItemLink href={profileLink} disabled={!workspace?.id}>
          Profile
        </DropdownMenuItemLink>
        <DropdownMenuItem onClick={() => void signOut()}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  )
}
