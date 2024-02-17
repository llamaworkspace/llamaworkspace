import { JoiaIcon } from '@/components/ui/icons/JoiaIcon'
import { cn } from '@/lib/utils'
import { Emoji } from 'emoji-picker-react'
import Link from 'next/link'
import { forwardRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { useUpdatePostSorting } from '../../sidebarHooks'
import { SidebarDesktopLineItemDropdown } from './SidebarDesktopLineItemDropdown'
import { SidebarDesktopLineItemHistory } from './SidebarDesktopLineItemHistory'

interface SidebarDesktopLineItemForChatAppProps {
  title: string
  emoji: string | null
  href: string
  isCurrent: boolean
  postId: string
  workspaceId: string | undefined
  currentChatId?: string
  showDroppableBefore?: boolean
}

export function SidebarDesktopLineItemForChatApp({
  title,
  emoji,
  isCurrent = false,
  href,
  postId,
  workspaceId,
  currentChatId,
  showDroppableBefore = false,
}: SidebarDesktopLineItemForChatAppProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { movePostBefore, movePostAfter } = useUpdatePostSorting(workspaceId)
  const [_, dragRef] = useDrag(
    () => ({
      type: 'card',
      item: { postId },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
      }),
    }),
    [postId],
  )

  const [{ isOver: isOverBefore }, dropBeforeRef] = useDrop(
    () => ({
      accept: 'card',
      drop: (payload: { postId: string }) => {
        const droppedPostId = payload.postId

        movePostBefore(droppedPostId, postId)
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [postId, movePostBefore],
  )

  const [{ isOver: isOverAfter }, dropAfterRef] = useDrop(
    () => ({
      accept: 'card',
      drop: (payload: { postId: string }) => {
        const droppedPostId = payload.postId

        movePostAfter(droppedPostId, postId)
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [postId, movePostAfter],
  )

  const handleHover = (isEnter: boolean) => () => {
    setIsHovered(isEnter)
  }

  return (
    <li>
      {showDroppableBefore && (
        <Droppable ref={dropBeforeRef} isHovered={isOverBefore} />
      )}
      <div
        ref={dragRef}
        className={cn(
          isCurrent
            ? 'bg-zinc-100'
            : 'text-zinc-700 transition hover:bg-zinc-50',
          'rounded-md p-1 text-sm',
        )}
      >
        <Link
          onMouseEnter={handleHover(true)}
          onMouseLeave={handleHover(false)}
          href={href}
        >
          <div
            className={cn(
              'group ml-1 flex items-center gap-x-2 rounded-md leading-6',
              isCurrent
                ? 'font-bold text-zinc-900'
                : 'font-medium text-zinc-600 hover:text-zinc-600',
            )}
          >
            <div
              className={cn(
                'flex h-4 w-4 shrink-0 items-center justify-center text-[1.1rem] text-zinc-300',
              )}
            >
              {emoji ? <Emoji unified={emoji} size={16} /> : <JoiaIcon />}
            </div>

            <div className="flex w-full items-center justify-between space-x-1">
              <div
                className={cn(
                  'line-clamp-1 grow',
                  isCurrent ? 'text-zinc-900' : 'text-zinc-600',
                )}
              >
                {title}
              </div>
              <SidebarDesktopLineItemDropdown
                postId={postId}
                isHovered={isHovered}
              />
            </div>
          </div>
        </Link>
        {isCurrent && (
          <SidebarDesktopLineItemHistory
            postId={postId}
            currentChatId={currentChatId}
          />
        )}
      </div>
      <Droppable ref={dropAfterRef} isHovered={isOverAfter} />
    </li>
  )
}

interface DroppableProps {
  isHovered: boolean
}

const Droppable = forwardRef<HTMLDivElement, DroppableProps>(function Droppable(
  { isHovered },
  externalRef,
) {
  const classes = cn(
    'transition-height duration-75 rounded',
    isHovered ? 'h-[8px]' : 'h-[2px]',
    isHovered && 'bg-purple-200',
  )
  return <div className={classes} ref={externalRef}></div>
})
