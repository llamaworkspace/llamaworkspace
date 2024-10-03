import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { MouseEvent, PropsWithChildren } from 'react'

export interface StyledLinkProps extends PropsWithChildren {
  href?: string
  as?: React.ElementType
  className?: string
  target?: string
  children: React.ReactNode
  onClick?: () => void
}

const baseClasses = 'font-semibold underline hover:bg-zinc-100 cursor-pointer'

const StyledLink = ({
  href,
  as,
  className,
  children,
  onClick,
  target,
  ...props
}: StyledLinkProps) => {
  const handleClick = (ev: MouseEvent) => {
    if (!href) {
      ev.preventDefault()
    }
    onClick?.()
  }

  const isExternal = href?.startsWith('http')

  const Comp = as ?? (href ? (isExternal ? 'a' : Link) : 'button')

  href = href ?? '#'

  return (
    <Comp
      href={href}
      target={isExternal && !as && target ? target : undefined}
      onClick={handleClick}
      className={cn(baseClasses, className)}
      {...props}
    >
      {children}
    </Comp>
  )
}
StyledLink.displayName = 'Link'

export { StyledLink }
