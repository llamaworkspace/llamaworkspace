import { Button } from '@chakra-ui/react'
import { DocumentIcon } from '@heroicons/react/24/outline'
import { useCreateSharedChat } from '../../chatHooks'
import { NewChatProps } from './createNewChatTypes'
import { useCanCreateChat } from './useCanCreateChat'

export const CreateSharedChat = ({
  postId,
  chatId,
  onSuccess,
}: NewChatProps) => {
  const { mutate: createChat } = useCreateSharedChat()
  const canCreateChat = useCanCreateChat(postId, chatId)

  const handleCreateChat = () => {
    if (!postId) return
    createChat(
      { postId },
      {
        onSuccess,
      },
    )
  }

  return (
    <Button
      onClick={handleCreateChat}
      variant="outline"
      size="xs"
      className="mr-2"
      disabled={!canCreateChat}
    >
      <DocumentIcon className="-ml-0.5 mr-1 h-3 w-3" /> New chat
    </Button>
  )
}
