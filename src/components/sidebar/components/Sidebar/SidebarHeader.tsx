import { useCreateStandaloneChat } from '@/components/chats/chatHooks'
import { cn } from '@/lib/utils'
import { PencilSquareIcon } from '@heroicons/react/24/outline'

export function SidebarHeader() {
  return (
    <div className="p-2">
      <NewChatButton />
    </div>
  )
}

const NewChatButton = () => {
  const { mutate: createChat } = useCreateStandaloneChat()
  return (
    <div className="flex max-h-[48px] ">
      <button
        onClick={() => createChat()}
        className="group flex grow basis-0 items-center justify-between gap-x-2 rounded-lg bg-zinc-100 px-2 py-3 text-[14px] font-bold text-zinc-950 transition-with-margin hover:bg-zinc-200 active:m-0.5 active:bg-zinc-200 active:duration-75 active:ease-in "
      >
        <span>New chat</span>
        <PencilSquareIcon
          className={cn(
            'h-5 w-5 text-zinc-400 transition group-hover:block group-hover:text-zinc-950',
          )}
        />
      </button>
    </div>
  )
}
