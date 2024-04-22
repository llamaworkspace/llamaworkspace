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
        className="flex grow basis-0 items-center justify-start gap-x-2 rounded px-2 py-3 font-bold text-zinc-950 transition-with-margin hover:bg-zinc-200/80 active:m-0.5 active:bg-zinc-200/80 active:duration-75 active:ease-in "
      >
        <PencilSquareIcon className="h-5 w-5 text-zinc-950" />
        <span>New chat</span>
      </button>
    </div>
  )
}
