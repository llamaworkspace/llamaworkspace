import Link from 'next/link'
import { DropdownMenuItem } from '../dropdown-menu'

type DropdownMenuItemLinkProps = React.ComponentProps<
  typeof DropdownMenuItem
> & {
  href: string
}

export const DropdownMenuItemLink = ({
  href,
  disabled,
  ...props
}: DropdownMenuItemLinkProps) => {
  if (disabled) {
    return <DropdownMenuItem disabled {...props} />
  }

  return (
    <Link href={href} passHref>
      <DropdownMenuItem {...props} />
    </Link>
  )
}
