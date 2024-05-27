import { PencilSquareIcon } from '@heroicons/react/24/outline'
import { useCreateStandaloneChat } from 'components/chats/chatHooks'
import { cn } from 'lib/utils'

export function SidebarHeader() {
  return (
    // Keep this double div, otherwise the height won't be respected and
    // the button will stick to the top of the viewport.
    <div>
      <div className="flex h-14 max-h-14 w-full items-center px-2">
        <NewChatButton />
      </div>
    </div>
  )
}

const NewChatButton = () => {
  const { mutate: createChat } = useCreateStandaloneChat()
  return (
    <div className="flex max-h-[45px] w-full">
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
