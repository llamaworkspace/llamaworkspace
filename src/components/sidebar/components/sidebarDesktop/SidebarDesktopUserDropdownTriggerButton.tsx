import { Button } from '@/components/ui/button'
import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useSelf } from '@/components/users/usersHooks'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { CaretDownIcon } from '@radix-ui/react-icons'

export function SidebarDesktopUserDropdownTriggerButton() {
  const { data: user } = useSelf()
  const { workspace } = useCurrentWorkspace()
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
