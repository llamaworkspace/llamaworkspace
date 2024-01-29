import { useDeleteChat } from '@/components/chats/chatHooks'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { TrashIcon } from '@heroicons/react/24/outline'
import { FC } from 'react'
import { DeleteChatProps } from './types'

export const DeleteSharedChat: FC<DeleteChatProps> = ({
  chatId,
  isLastChat,
}) => {
  const { mutate: deleteChat } = useDeleteChat()

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
