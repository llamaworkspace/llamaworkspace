import { cn } from '@/lib/utils'
import { useGlobalState } from '../../global/globalState'
import { SidebarToggleIcon } from '../../sidebar/SidebarToggleIcon'

export function MainLayoutHeaderAsHidden({ postId }: { postId?: string }) {
  const { toggleMobileSidebar, toggleDesktopSidebar, state } = useGlobalState()
  const { isDesktopSidebarOpen } = state

  return (
    <div className="relative">
      <div className="absolute left-0 right-0 z-50 ">
        <header className="flex h-12 max-h-12 flex-row items-center justify-between border-zinc-200/50 py-2.5 lg:px-0">
          {/* Mobile button */}
          <div className="flex w-full px-2 py-5 lg:hidden">
            <button
              type="button"
              className="text-zinc-700"
              onClick={() => void toggleMobileSidebar()}
            >
              <span className="sr-only">Open sidebar</span>
              <SidebarToggleIcon />
            </button>
          </div>
          {/* Desktop header */}
          <div className="hidden h-8 w-full items-center lg:flex">
            <button
              type="button"
              className={cn(
                'ml-6 h-8 w-8 text-zinc-700',
                isDesktopSidebarOpen && 'hidden',
              )}
              onClick={toggleDesktopSidebar}
            >
              <span className="sr-only">Open sidebar</span>
              <SidebarToggleIcon />
            </button>
          </div>
        </header>
      </div>
    </div>
  )
}
