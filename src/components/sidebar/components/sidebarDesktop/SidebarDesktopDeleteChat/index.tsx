import { FC } from 'react'
import { DeletePrivateChat } from './DeletePrivateChat'
import { DeleteSharedChat } from './DeleteSharedChat'
import { SidebarDesktopDeleteChatProps } from './types'

export const SidebarDesktopDeleteChat: FC<SidebarDesktopDeleteChatProps> = ({
  isPrivate,
  ...props
}) => {
  if (isPrivate) return <DeletePrivateChat {...props} />

  return <DeleteSharedChat {...props} />
}
