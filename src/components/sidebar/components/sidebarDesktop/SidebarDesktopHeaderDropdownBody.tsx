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
  const { workspace: currentWorkspace } = useCurrentWorkspace()
  const { data: workspaces } = useWorkspaces()

  if (!workspaces || workspaces.length < 2) return null

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="italic">
        Switch workspace
      </DropdownMenuSubTrigger>

      <DropdownMenuSubContent className="min-w-[250px]">
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
              className="pl-7"
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
  const { data: workspaces } = useWorkspaces()
  const numberOfWorkspaces = workspaces?.length ?? 0

  const { workspace } = useCurrentWorkspace()
  const profileLink = workspace?.id
    ? navigation.buildPath('/w/:workspaceId/profile', {
        workspaceId: workspace.id,
      })
    : '#'
  const workspaceSettingsLink = workspace?.id
    ? navigation.buildPath('/w/:workspaceId/settings/:tab', {
        workspaceId: workspace.id,
        tab: 'general',
      })
    : '#'
  const workspaceMembersLink = workspace?.id
    ? navigation.buildPath('/w/:workspaceId/settings/:tab', {
        workspaceId: workspace.id,
        tab: 'members',
      })
    : '#'
  const workspaceModelsLink = workspace?.id
    ? navigation.buildPath('/w/:workspaceId/settings/:tab', {
        workspaceId: workspace.id,
        tab: 'models',
      })
    : '#'

  return (
    <DropdownMenuContent className="ml-4 w-56">
      <DropdownMenuGroup>
        <DropdownMenuLabel>Workspace</DropdownMenuLabel>

        {numberOfWorkspaces && <SidebarDesktopHeaderWorkspacesDropdownSub />}
        <DropdownMenuItemLink
          href={workspaceSettingsLink}
          disabled={!workspace?.id}
        >
          General settings
        </DropdownMenuItemLink>
        <DropdownMenuItemLink
          href={workspaceMembersLink}
          disabled={!workspace?.id}
        >
          Members
        </DropdownMenuItemLink>
        <DropdownMenuItemLink
          href={workspaceModelsLink}
          disabled={!workspace?.id}
        >
          AI models
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
