import { Button } from '@chakra-ui/react'
import { DocumentIcon } from '@heroicons/react/24/outline'
import { useCreateChat } from '../../chatHooks'
import { NewChatProps } from './createNewChatTypes'
import { useCanCreateChat } from './useCanCreateChat'

export const CreateStandaloneChat = ({
  postId,
  chatId,
  resetTextArea,
}: NewChatProps) => {
  const { mutate: createChat } = useCreateChat()
  const canCreateChat = useCanCreateChat(postId, chatId)

  const handleCreateChat = () => {
    if (!postId) return
    createChat(
      { postId },
      {
        onSuccess: () => {
          resetTextArea()
        },
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
