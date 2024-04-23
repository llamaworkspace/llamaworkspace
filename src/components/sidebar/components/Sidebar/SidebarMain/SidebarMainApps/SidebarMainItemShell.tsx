import { EMPTY_POST_NAME } from '@/components/posts/postsConstants'
import { useSidebarButtonLikeStyles } from '@/components/sidebar/sidebarHooks'
import { cn } from '@/lib/utils'
import { PencilSquareIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Fragment } from 'react'

interface SidebarMainItemShellProps {
  icon: JSX.Element
  emoji?: string | null
  title: string
  isActive: boolean
  showPencil?: boolean
  onClick?: () => void
  linkHref?: string
}

export const SidebarMainItemShell = ({
  icon,
  title,
  isActive = false,
  showPencil = true,
  onClick,
  linkHref,
}: SidebarMainItemShellProps) => {
  const WrapperEl = linkHref ? Link : Fragment

  const baseStyles = useSidebarButtonLikeStyles(isActive)

  return (
    <WrapperEl href={linkHref ?? '#'}>
      <div
        className={cn(baseStyles, 'py-2 text-[14px] font-bold')}
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
    </WrapperEl>
  )
}
