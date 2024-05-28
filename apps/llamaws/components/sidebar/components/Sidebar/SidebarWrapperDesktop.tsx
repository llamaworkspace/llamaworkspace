import { useGlobalState } from 'components/global/globalState'
import { cn } from 'lib/utils'
import { SidebarContent } from './SidebarContent'

export function SidebarWrapperDesktop() {
  const { state } = useGlobalState()
  const { isDesktopSidebarOpen } = state

  return (
    <div
      className={cn(
        'transition-width hidden bg-white duration-200 ease-out lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col',
        isDesktopSidebarOpen ? 'w-72' : 'w-0',
      )}
    >
      <div className="bg-zinc-10 flex h-full grow flex-col overflow-hidden">
        <SidebarContent />
      </div>
    </div>
  )
}
