import { cn } from '@/lib/utils'
import { Square3Stack3DIcon } from '@heroicons/react/24/outline'
import { Emoji } from 'emoji-picker-react'
export function SidebarBody() {
  return (
    <>
      <div className="relative flex grow overflow-y-auto p-2">
        <div className="w-full space-y-12">
          <SidebarApps />
          <ChatHistory />
        </div>
      </div>
    </>
  )
}

const SidebarApps = () => {
  return (
    <div className="space-y-1">
      <AppItem highlighted={true} />
      <AppItem />
      <AppExploreItem />
    </div>
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
        <ChatItem highlighted={true} />
      </div>
    </div>
  )
}

const AppItem = ({ highlighted }: { highlighted?: boolean }) => {
  return (
    <div
      className={cn(
        'flex w-full cursor-pointer items-center gap-2 rounded px-2 py-2 text-[14px] font-bold text-zinc-950 transition hover:bg-zinc-200/80',
        highlighted && 'bg-zinc-950 text-white',
        !highlighted && 'text-zinc-950',
      )}
    >
      <span className="flex grow basis-0 items-center gap-x-1 ">
        <Emoji unified={'2728'} size={24} />
        Texts summarizer
      </span>
    </div>
  )
}

const AppExploreItem = () => {
  return (
    <div className="flex w-full cursor-pointer items-center gap-2 rounded px-2 py-2 text-[14px] font-bold text-zinc-950 transition hover:bg-zinc-200/80">
      <span className="flex grow basis-0 items-center gap-x-1 ">
        <Square3Stack3DIcon className="h-6 w-6" />
        Explore GPTs
      </span>
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
