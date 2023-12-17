import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { SidebarDesktopHeaderDropdownBody } from './SidebarDesktopHeaderDropdownBody'
import { SidebarDesktopUserDropdownTriggerButton } from './SidebarDesktopUserDropdownTriggerButton'

export function SidebarDesktopUserDropdown() {
  return (
    <DropdownMenu>
      <SidebarDesktopUserDropdownTriggerButton />
      <SidebarDesktopHeaderDropdownBody />
    </DropdownMenu>
  )
}
