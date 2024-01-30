import { api } from '@/lib/api'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { useEffect } from 'react'
import { useErrorHandler } from '../global/errorHandlingHooks'
import { useDefaultPost } from '../posts/postsHooks'
import { useChatHistoryForSidebarPost } from '../sidebar/sidebarHooks'

export const useDeletePrivateChat = () => {
  const errorHandler = useErrorHandler()
  const navigation = useNavigation()
  const utils = api.useContext()

  const { data: defaultPost } = useDefaultPost()
  const { data: chatHistory } = useChatHistoryForSidebarPost(defaultPost?.id)

  const { isSuccess, reset, mutateAsync, ...rest } =
    api.chats.deleteChat.useMutation({
      onError: errorHandler(),
      onSuccess: async () => {
        await utils.sidebar.invalidate()
      },
    })

  useEffect(() => {
    if (isSuccess) {
      reset()
    }
  }, [isSuccess, reset])

  type MutateArgs = Parameters<typeof mutateAsync>
  type Params = MutateArgs[0]
  type Options = MutateArgs[1]

  return {
    mutateAsync: async (params: Params, options?: Options) => {
      await mutateAsync(params, options)

      const chatIndex = chatHistory?.findIndex((item) => item.id === params.id)

      if (!chatHistory) return navigation.replace('/p')

      const returnToBase = chatHistory.length === 1 || chatIndex === undefined

      if (returnToBase) return navigation.replace('/p')

      const siblingChat =
        chatIndex === 0 ? chatHistory[1] : chatHistory[chatIndex - 1]

      if (siblingChat) {
        return navigation.replace('/c/:chatId', {
          chatId: siblingChat.id,
        })
      }
    },
    isSuccess,
    reset,
    ...rest,
  }
}
