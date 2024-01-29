import { useDeletePrivateChat } from '@/components/chats/useDeletePrivateChat'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { TrashIcon } from '@heroicons/react/24/outline'
import { FC } from 'react'
import { DeleteChatProps } from './types'

export const DeletePrivateChat: FC<DeleteChatProps> = ({ chatId }) => {
  const { mutate: deleteChat } = useDeletePrivateChat()

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
