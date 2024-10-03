import { useGlobalState } from '../../global/globalState'
import { SidebarToggleIcon } from '../../sidebar/components/Sidebar/SidebarToggleIcon'

export function MainLayoutHeaderAsHidden({ appId }: { appId?: string }) {
  const { toggleMobileSidebar } = useGlobalState()

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
        </header>
      </div>
    </div>
  )
}
