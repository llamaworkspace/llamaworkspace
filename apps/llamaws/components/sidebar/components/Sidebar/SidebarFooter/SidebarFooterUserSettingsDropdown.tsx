import { CaretDownIcon } from '@radix-ui/react-icons'
import { Button } from 'components/ui/button'
import { DropdownMenu, DropdownMenuTrigger } from 'components/ui/dropdown-menu'
import { Skeleton } from 'components/ui/skeleton'
import { useSelf } from 'components/users/usersHooks'
import { useCurrentWorkspace } from 'components/workspaces/workspacesHooks'
import { SidebarFooterUserSettingsMenu } from './SidebarFooterUserSettingsMenu'

export function SidebarFooterUserSettingsDropdown() {
  return (
    <DropdownMenu>
      <TriggerButton />
      <SidebarFooterUserSettingsMenu />
    </DropdownMenu>
  )
}

export function TriggerButton() {
  const { data: user } = useSelf()
  const { data: workspace } = useCurrentWorkspace()
  return (
    <DropdownMenuTrigger asChild>
      <Button
        className="flex w-full justify-between border-0 px-2 text-left font-semibold shadow-none"
        variant="outline"
      >
        {user ? (
          <span className="line-clamp-1">{workspace?.name}</span>
        ) : (
          <Skeleton className="h-3 w-36" />
        )}

        <CaretDownIcon />
      </Button>
    </DropdownMenuTrigger>
  )
}
