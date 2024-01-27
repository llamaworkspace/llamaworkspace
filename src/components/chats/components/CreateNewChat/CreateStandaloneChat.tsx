import { Button } from '@chakra-ui/react'
import { DocumentIcon } from '@heroicons/react/24/outline'
import { FC } from 'react'
import { useCreateStandaloneChat } from '../../chatHooks'
import { NewChatProps } from './types'
import { useCanCreateChat } from './useCanCreateChat'

export const CreateStandaloneChat: FC<NewChatProps> = ({
  postId,
  chatId,
  resetTextArea,
}) => {
  const { mutate: createChat } = useCreateStandaloneChat()
  const canCreateChat = useCanCreateChat(postId, chatId)

  const handleCreateChat = () => {
    createChat({
      onSuccess: () => {
        resetTextArea()
      },
    })
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
