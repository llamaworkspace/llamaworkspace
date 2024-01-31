import { DeletePrivateChat } from './DeletePrivateChat'
import { DeleteSharedChat } from './DeleteSharedChat'
import { SidebarDesktopDeleteChatProps } from './sideBarDesktopDeleteChatTypes'

export const SidebarDesktopDeleteChat = ({
  isPrivate,
  ...props
}: SidebarDesktopDeleteChatProps) => {
  if (isPrivate) return <DeletePrivateChat {...props} />

  return <DeleteSharedChat {...props} />
}
