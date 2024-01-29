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

  const { isSuccess, reset, mutate, ...rest } =
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

  type MutateArgs = Parameters<typeof mutate>
  type Params = MutateArgs[0]
  type Options = MutateArgs[1]

  return {
    mutate: async (params: Params, options?: Options) => {
      // This is an async operation I'm not sure why it's not being properly typed
      await mutate(params, options)

      const chatIndex = chatHistory?.findIndex((item) => item.id === params.id)

      if (!chatHistory) return navigation.replace('/p')

      if (!chatIndex || chatHistory.length < 1) return navigation.replace('/p')

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
