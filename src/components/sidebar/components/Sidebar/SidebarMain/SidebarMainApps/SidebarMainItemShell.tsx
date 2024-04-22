import { EMPTY_POST_NAME } from '@/components/posts/postsConstants'
import { cn } from '@/lib/utils'
import { PencilSquareIcon } from '@heroicons/react/24/outline'

interface SidebarMainItemShellProps {
  icon: JSX.Element
  emoji?: string | null
  title: string
  isActive: boolean
  showPencil?: boolean
  onClick?: () => void
}

export const SidebarMainItemShell = ({
  icon,
  title,
  isActive = false,
  showPencil = true,
  onClick,
}: SidebarMainItemShellProps) => {
  return (
    <div
      className={cn(
        'group flex w-full grow basis-0 cursor-pointer  items-center justify-between gap-2 gap-x-2 rounded px-2 py-2 text-[14px] font-bold text-zinc-950 transition hover:bg-zinc-200/80 active:bg-zinc-300',
        isActive && 'bg-zinc-200',
      )}
      onClick={() => onClick?.()}
    >
      <div className="w-[24px] min-w-[24px]">{icon}</div>
      <span className="line-clamp-1 grow ">
        {title ? title : EMPTY_POST_NAME}
      </span>
      {showPencil && (
        <div className="w-[20px]">
          <PencilSquareIcon
            className={cn(
              'h-5 w-5 text-zinc-400 transition group-hover:block group-hover:text-zinc-950',
              !isActive && 'hidden group-hover:block group-hover:opacity-100',
            )}
          />
        </div>
      )}
    </div>
  )
}
