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
  return (
    <div className="flex max-h-[48px] ">
      <button
        onClick={() => console.log(11)}
        className="group flex grow basis-0 items-center justify-between gap-x-2 rounded-lg border-zinc-100 bg-zinc-100 px-3 py-3 text-[14px] font-bold text-zinc-950 shadow transition-with-margin hover:bg-zinc-200 active:m-0.5 active:bg-zinc-200 active:duration-75 active:ease-in "
      >
        <span>New chat</span>
        <PencilSquareIcon
          className={cn(
            'h-6 w-6 text-zinc-400 transition group-hover:block group-hover:text-zinc-950',
          )}
        />
      </button>
    </div>
  )
}
