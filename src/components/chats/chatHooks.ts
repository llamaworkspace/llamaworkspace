import { api } from '@/lib/api'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { Author, ChatAuthor } from '@/shared/aiTypesAndMappers'
import { useChat as useVercelChat } from 'ai/react'
import { produce } from 'immer'
import { debounce } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { useErrorHandler } from '../global/errorHandlingHooks'
import { useDefaultPost, usePostById } from '../posts/postsHooks'
import { useChatHistoryForSidebarPost } from '../sidebar/sidebarHooks'
import { useErrorToast } from '../ui/toastHooks'
import { useCurrentWorkspace } from '../workspaces/workspacesHooks'
import { extractErrors } from './utils/chatsUtils'

const useCreateMessage = () => {
  const errorHandler = useErrorHandler()
  return api.chats.createMessage.useMutation({
    onError: errorHandler(),
  })
}

export const useChatById = (chatId?: string) => {
  const errorHandler = useErrorHandler()
  return api.chats.getChatById.useQuery(
    { chatId: chatId! },
    { enabled: !!chatId, onError: errorHandler() },
  )
}

export const useCreateSharedChat = () => {
  const errorHandler = useErrorHandler()
  const utils = api.useContext()
  const navigation = useNavigation()

  return api.chats.createChat.useMutation({
    onError: errorHandler(),
    onSuccess: (chat) => {
      void utils.sidebar.postsForSidebar.invalidate()
      void utils.sidebar.chatHistoryForSidebar.invalidate()
      void navigation.push(`/p/:postId/c/:chatId`, {
        postId: chat.postId,
        chatId: chat.id,
      })
    },
  })
}

export const useCreatePrivateChat = () => {
  const errorHandler = useErrorHandler()
  const { data: defaultPost } = useDefaultPost()

  const utils = api.useContext()
  const navigation = useNavigation()
  const { mutate, ...obj } = api.chats.createStandaloneChat.useMutation({
    onError: errorHandler(),
    onSuccess: (chat) => {
      void utils.sidebar.chatHistoryForSidebar.invalidate()
      void navigation.push(`/c/:chatId`, {
        chatId: chat.id,
      })
    },
  })

  const defaultPostId = defaultPost?.id
  type MutateArgs = Parameters<typeof mutate>

  return {
    ...obj,
    mutate: (options?: MutateArgs[1]) => {
      if (!defaultPostId) return
      mutate({ postId: defaultPostId }, options)
    },
  }
}

export const useDeleteSharedChat = () => {
  const errorHandler = useErrorHandler()
  const navigation = useNavigation()
  const utils = api.useContext()

  const routerPostId = navigation.query.post_id as string | undefined
  const routerChatId = navigation.query.chat_id as string | undefined

  const { workspace } = useCurrentWorkspace()
  const { data: chatHistory } = useChatHistoryForSidebarPost(routerPostId)

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
      if (routerChatId === params.id) {
        const chatIndex = chatHistory?.findIndex(
          (item) => item.id === params.id,
        )

        if (chatHistory && chatIndex && chatIndex !== -1) {
          const siblingChat =
            chatIndex === 0 ? chatHistory[1] : chatHistory[chatIndex - 1]

          if (siblingChat) {
            if (routerPostId) {
              await navigation.replace(`/p/:postId/c/:chatId`, {
                postId: routerPostId,
                chatId: siblingChat.id,
              })
            } else {
              await navigation.replace(`/c/:chatId`, {
                chatId: siblingChat.id,
              })
            }
          }
        } else {
          // Fallback to the initial page: No chats found.
          // This shouldn't happen
          if (workspace?.id) {
            await navigation.replace(`/w/:workspaceId`, {
              workspaceId: workspace.id,
            })
          } else {
            await navigation.replace('/p')
          }
        }
      }
      mutate(params, options)
    },
    isSuccess,
    reset,
    ...rest,
  }
}

export const useUpdatePostConfigForStandaloneChat = () => {
  const errorHandler = useErrorHandler()

  return api.chats.updatePostConfigForStandaloneChat.useMutation({
    onError: errorHandler(),
  })
}

export const useMessages = (chatId?: string) => {
  const errorHandler = useErrorHandler()
  return api.chats.getMessagesByChatId.useQuery(
    { chatId: chatId! },
    { enabled: !!chatId, onError: errorHandler() },
  )
}

export const usePostConfigForChat = (chatId?: string) => {
  const errorHandler = useErrorHandler()
  return api.chats.getPostConfigForChatId.useQuery(
    { chatId: chatId! },
    {
      enabled: !!chatId,
      onError: errorHandler(),
    },
  )
}

export const usePrompt = (chatId?: string) => {
  const utils = api.useContext()
  const toast = useErrorToast()
  const errorHandler = useErrorHandler()
  const [isLoading, setIsLoading] = useState(false)
  const {
    messages: vercelMessages,
    append,
    setMessages: setVercelMessages,
  } = useVercelChat({
    api: '/api/chat',
    onFinish: () => {
      setIsLoading(false)
      setVercelMessages([])
      // Expects the title to be generated
      void utils.sidebar.chatHistoryForSidebar.invalidate()
    },

    onError: (error) => {
      setIsLoading(false)
      setVercelMessages([])
      return errorHandler()(error)
    },
  })

  const targetMessage = vercelMessages?.[1]?.content

  useEffect(() => {
    if (!chatId || !targetMessage) return

    const errorValue = extractErrors(targetMessage)
    if (errorValue) {
      // Removes the assistant message
      void utils.chats.getMessagesByChatId.refetch({
        chatId,
      })
      return toast(errorValue, { duration: 10000 })
    }

    // Writes streamed response to usequery cache
    utils.chats.getMessagesByChatId.setData({ chatId }, (previous) => {
      if (previous) {
        // It assumes that the first item is the target assistant message
        return produce(previous, (draft) => {
          if (!draft[0]) return
          draft[0].message = targetMessage
        })
      }
      return previous
    })
  }, [toast, targetMessage, chatId, utils])

  const { mutate: createMessage } = useCreateMessage()
  const mutate = useCallback(
    (message: string) => {
      if (!chatId) return

      // Inmediately set the user message to the cache
      utils.chats.getMessagesByChatId.setData({ chatId }, (previous) => {
        // Write a temporary message to the cache for real-time display
        return produce(previous, (draft) => {
          const obj = {
            id: 'temp_user',
            chatId,
            postConfigVersionId: null,
            message,
            author: ChatAuthor.User,
            tokens: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          draft?.unshift(obj)
        })
      })

      setIsLoading(true)
      createMessage(
        { chatId, author: Author.User, message },
        {
          onSuccess: (userMessage) => {
            utils.chats.getMessagesByChatId.setData({ chatId }, (previous) => {
              return produce(previous, (draft) => {
                let target = draft?.find(
                  (message) => message.id === 'temp_user',
                )
                if (!target) return draft
                target = userMessage
              })
            })

            // Ensure that the last message is from the assistant, and provide perception
            // of a greater speed
            utils.chats.getMessagesByChatId.setData({ chatId }, (previous) => {
              // Write a temporary message to the cache for real-time display

              return produce(previous, (draft) => {
                const obj = {
                  id: 'temp_assistant',
                  chatId,
                  postConfigVersionId: null,
                  message: null,
                  author: ChatAuthor.Assistant,
                  tokens: null,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                }

                draft?.unshift(obj)
              })
            })

            createMessage(
              { chatId, author: Author.Assistant },
              {
                onSuccess: (assistantMessage) => {
                  utils.chats.getMessagesByChatId.setData(
                    { chatId },
                    (previous) => {
                      return produce(previous, (draft) => {
                        let target = draft?.find(
                          (message) => message.id === 'temp_assistant',
                        )
                        if (!target) return draft
                        target = assistantMessage
                      })
                    },
                  )

                  setVercelMessages([])

                  void append(
                    {
                      id: assistantMessage.id,
                      role: Author.User,
                      content: '',
                    },
                    {
                      options: {
                        body: { chatId },
                      },
                    },
                  )
                },
                onError: () => {
                  setIsLoading(false)
                },
              },
            )
          },
          onError: (error) => {
            errorHandler()(error)
            setIsLoading(false)
          },
        },
      )
    },
    [append, createMessage, setVercelMessages, utils, errorHandler, chatId],
  )

  return {
    mutate,
    isLoading,
  }
}

export const useShouldDisplayEmptySettingsAlert = (
  postId?: string,
  chatId?: string,
) => {
  const { data: messages } = useMessages(chatId)
  const { data: postConfig } = usePostConfigForChat(chatId)
  const { data: post } = usePostById(postId)
  const hasMessages = messages && messages.length > 0
  const isDismissed = post && post.hideEmptySettingsAlert

  if (postConfig && post) {
    if (
      !postConfig.initialMessage &&
      !postConfig.systemMessage &&
      !hasMessages &&
      !isDismissed
    ) {
      return true
    }
  }

  return false
}

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

export const useUpdateChat = (debounceMs = 0) => {
  const errorHandler = useErrorHandler()
  const { sidebar } = api.useContext()
  const utils = api.useContext()
  const { chatHistoryForSidebar } = sidebar

  const { mutate, ...rest } = api.chats.updateChatTitle.useMutation({
    onError: errorHandler(),
    onSuccess: () => {
      void utils.sidebar.postsForSidebar.invalidate()
      void utils.sidebar.chatHistoryForSidebar.invalidate()
    },
  })

  type MutateArgs = Parameters<typeof mutate>
  type Params = MutateArgs[0]
  type Options = MutateArgs[1]

  const { data: post } = useDefaultPost()
  const { workspace } = useCurrentWorkspace()

  return {
    mutate: debounce((params: Params, options?: Options) => {
      if (!post || !workspace) return

      chatHistoryForSidebar.setData(
        { postId: post.id, workspaceId: workspace.id },
        (previous) => {
          if (!previous) return previous

          return produce(previous, (draft) => {
            const chatIndex = draft.findIndex((chat) => chat.id === params.id)
            const foundChat = draft[chatIndex]
            if (foundChat) foundChat.title = params.title ?? null
          })
        },
      )

      mutate(params, options)
    }, debounceMs),
    ...rest,
  }
}
