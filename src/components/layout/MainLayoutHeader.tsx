import { cn } from '@/lib/utils'
import { ChatHeaderPostLinks } from '../chats/components/ChatHeaderPostLinks'
import { ChatHeaderPostTitle } from '../chats/components/ChatHeaderPostTitle'
import { useGlobalState } from '../global/globalState'
import { SidebarToggleIcon } from '../sidebar/SidebarToggleIcon'

export function MainLayoutHeader({
  postId,
  hidden = false,
}: {
  postId?: string
  hidden: boolean
}) {
  const { toggleMobileSidebar, toggleDesktopSidebar, state } = useGlobalState()
  const { isDesktopSidebarOpen } = state
  return (
    <header
      className={cn(
        'flex h-12 max-h-12 flex-row items-center justify-between border-zinc-200/50 py-2.5 lg:px-0',
        !hidden && 'border-b',
      )}
    >
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
        {!hidden && (
          <div className="flex w-full justify-between px-2 md:px-6">
            <div id="header-left" className="flex grow items-center text-sm">
              <ChatHeaderPostTitle postId={postId} />
            </div>
            <div id="header-left" className="items-center text-sm">
              <ChatHeaderPostLinks />
            </div>
          </div>
        )}
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
        {!hidden && (
          <div className="flex w-full justify-between px-6">
            <div id="header-left" className="flex grow items-center text-sm">
              <ChatHeaderPostTitle postId={postId} />
            </div>
            <div id="header-left" className="items-center text-sm">
              <ChatHeaderPostLinks />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
