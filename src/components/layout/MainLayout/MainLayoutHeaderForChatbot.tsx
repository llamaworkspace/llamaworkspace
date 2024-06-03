import { ChatHeaderAppLinks } from '../../chats/components/ChatHeaderAppLinks'
import { ChatHeaderAppTitle } from '../../chats/components/ChatHeaderAppTitle'
import { useGlobalState } from '../../global/globalState'
import { SidebarToggleIcon } from '../../sidebar/components/Sidebar/SidebarToggleIcon'

interface MainLayoutHeaderForChatbotProps {
  appId?: string
  chatId?: string
}

export function MainLayoutHeaderForChatbot({
  appId,
  chatId,
}: MainLayoutHeaderForChatbotProps) {
  const { toggleMobileSidebar } = useGlobalState()

  return (
    <header className="flex h-14 max-h-14 flex-row items-center justify-between py-2.5 lg:px-0">
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
        <div className="flex w-full justify-between px-2">
          <div className="flex grow items-center text-sm">
            <ChatHeaderAppTitle appId={appId} />
          </div>
          <div className="items-center text-sm">
            <ChatHeaderAppLinks appId={appId} chatId={chatId} />
          </div>
        </div>
      </div>
      {/* Desktop header */}
      <div className="hidden h-8 w-full items-center  lg:flex">
        <div className="flex w-full justify-between gap-x-2 px-6">
          <div className="flex grow items-center text-sm">
            <ChatHeaderAppTitle appId={appId} />
          </div>
          <div className="items-center text-sm">
            <ChatHeaderAppLinks appId={appId} chatId={chatId} />
          </div>
        </div>
      </div>
    </header>
  )
}
