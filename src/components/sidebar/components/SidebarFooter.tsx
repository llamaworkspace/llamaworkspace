import { useGlobalState } from '@/components/global/globalState'
import { SidebarToggleIcon } from '../SidebarToggleIcon'
import { SidebarDesktopUserDropdown } from './sidebarDesktop/SidebarDesktopUserDropdown'

export function SidebarFooter() {
  const { toggleDesktopSidebar } = useGlobalState()

  return (
    <div className="flex h-12 shrink-0 items-center justify-between gap-x-4 border-b border-zinc-200/50 px-4">
      <SidebarDesktopUserDropdown />

      <button
        type="button"
        className="-m-2.5 hidden p-2.5 text-zinc-700 lg:block"
        onClick={toggleDesktopSidebar}
      >
        <span className="sr-only">Open sidebar</span>
        <SidebarToggleIcon />
      </button>
    </div>
  )
}
