import { useGlobalState } from '@/components/global/globalState'
import { cn } from '@/lib/utils'
import { SidebarDesktopBody } from './sidebarDesktop/SidebarDesktopBody'
import { SidebarDesktopHeader } from './sidebarDesktop/SidebarDesktopHeader'

export function SidebarDesktop() {
  const { state } = useGlobalState()
  const { isDesktopSidebarOpen } = state

  return (
    <div
      className={cn(
        'transition-width hidden bg-white duration-200 ease-out lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col',
        isDesktopSidebarOpen ? 'w-72' : 'w-0',
      )}
    >
      <div className="flex h-full grow flex-col overflow-hidden border-r border-zinc-200 bg-white">
        <SidebarDesktopHeader />
        <SidebarDesktopBody />
      </div>
    </div>
  )
}
