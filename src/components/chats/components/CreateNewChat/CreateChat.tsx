import { FC } from 'react'

import { Button } from '@chakra-ui/react'
import { DocumentIcon } from '@heroicons/react/24/outline'
import { useCreateChat } from '../../chatHooks'
import { NewChatProps } from './types'
import { useCanCreateChat } from './useCanCreateChat'

export const CreateChat: FC<NewChatProps> = ({
  postId,
  chatId,
  resetTextArea,
}) => {
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
      // Revisit this: Is it the right behavior?
      // https://www.notion.so/joiahq/Revisit-the-behaviour-of-the-disabled-new-chat-button-in-the-chatbox-f44da7d966754e439bd96e74bf564a60
      disabled={!canCreateChat}
    >
      <DocumentIcon className="-ml-0.5 mr-1 h-3 w-3" /> New chat
    </Button>
  )
}
