import { useDeletePrivateChat } from '@/components/chats/chatHooks'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { TrashIcon } from '@heroicons/react/24/outline'
import { DeleteChatProps } from './sideBarDesktopDeleteChatTypes'

export const DeletePrivateChat = ({ chatId }: DeleteChatProps) => {
  const { mutateAsync: deleteChat } = useDeletePrivateChat()

  const handleDelete = () => {
    void deleteChat({ id: chatId, allowLastChatDeletion: true })
  }

  return (
    <DropdownMenuItem onSelect={handleDelete}>
      <TrashIcon className="mr-2 h-4 w-4" />
      <span>Delete</span>
    </DropdownMenuItem>
  )
}
