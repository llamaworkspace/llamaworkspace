import { useDeleteSharedChat } from '@/components/chats/chatHooks'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { TrashIcon } from '@heroicons/react/24/outline'
import { DeleteChatProps } from './sideBarDesktopDeleteChatTypes'

export const DeleteSharedChat = ({ chatId, isLastChat }: DeleteChatProps) => {
  const { mutate: deleteChat } = useDeleteSharedChat()

  const handleDelete = () => {
    void deleteChat({ id: chatId })
  }

  return (
    <DropdownMenuItem disabled={isLastChat} onSelect={handleDelete}>
      <TrashIcon className="mr-2 h-4 w-4" />
      <span>Delete</span>
    </DropdownMenuItem>
  )
}
