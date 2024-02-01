export interface DeleteChatProps {
  chatId: string
  isLastChat: boolean
}

export interface SidebarDesktopDeleteChatProps extends DeleteChatProps {
  isPrivate?: boolean
}
