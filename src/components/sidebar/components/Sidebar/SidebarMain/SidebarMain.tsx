import { SidebarMainApps } from './SidebarMainApps/SidebarMainApps'
import { SidebarMainChatHistory } from './SidebarMainChatHistory/SidebarMainChatHistory'

export function SidebarMain() {
  return (
    <>
      <div className="relative flex grow overflow-y-auto p-2">
        <div className="w-full space-y-12">
          <SidebarMainApps />
          <SidebarMainChatHistory />
        </div>
      </div>
    </>
  )
}
