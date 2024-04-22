import { cn } from '@/lib/utils'
import { SidebarMainApps } from './SidebarMainApps/SidebarMainApps'

export function SidebarMain() {
  return (
    <>
      <div className="relative flex grow overflow-y-auto p-2">
        <div className="w-full space-y-12">
          <SidebarMainApps />
          <ChatHistory />
        </div>
      </div>
    </>
  )
}

const ChatHistory = () => {
  return (
    <div className="w-full space-y-8 ">
      <ChatHistoryTimeBlock title="Today" />
      <ChatHistoryTimeBlock title="Yesterday" />
      <ChatHistoryTimeBlock title="Last 30 days" />
      <ChatHistoryTimeBlock title="Last 30 days" />
      <ChatHistoryTimeBlock title="Last 30 days" />
    </div>
  )
}

const ChatHistoryTimeBlock = ({ title }: { title: string }) => {
  return (
    <div className="w-full">
      <div className="px-2 text-xs font-bold text-zinc-400">{title}</div>
      <div className="w-full">
        <ChatItem highlighted={false} />
        <ChatItem />
        <ChatItem highlighted={false} />

        <ChatItem />
        <ChatItem highlighted={false} />
      </div>
    </div>
  )
}

const ChatItem = ({ highlighted }: { highlighted?: boolean }) => {
  return (
    <div
      className={cn(
        'flex w-full items-center gap-2 rounded px-2 py-[6px] text-[14px] font-medium text-zinc-950',
        highlighted && 'bg-zinc-950 text-white',
        !highlighted && 'text-zinc-950',
      )}
    >
      <span className="grow basis-0">This is a thing</span>
    </div>
  )
}
