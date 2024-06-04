import { api } from '@/lib/api'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { Author, ChatAuthor } from '@/shared/aiTypesAndMappers'
import {
  useAssistant as useVercelAssistant,
  useChat as useVercelChat,
} from 'ai/react'
import { produce } from 'immer'
import { debounce } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { useAppById, useDefaultApp } from '../apps/appsHooks'
import { AppType } from '../apps/appsTypes'
import { useErrorHandler } from '../global/errorHandlingHooks'
import { useErrorToast } from '../ui/toastHooks'
import { useCurrentWorkspace } from '../workspaces/workspacesHooks'

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

export const useCreateChatForApp = () => {
  const errorHandler = useErrorHandler()
  const utils = api.useContext()
  const navigation = useNavigation()

  return api.chats.createChat.useMutation({
    onError: errorHandler(),
    onSuccess: (chat) => {
      void utils.sidebar.invalidate()
      void navigation.push(`/p/:appId/c/:chatId`, {
        appId: chat.appId,
        chatId: chat.id,
      })
    },
  })
}

export const useCreateStandaloneChat = () => {
  const errorHandler = useErrorHandler()
  const { data: defaultApp } = useDefaultApp()

  const utils = api.useContext()
  const navigation = useNavigation()
  const { mutate, ...obj } = api.chats.createChat.useMutation({
    onError: errorHandler(),
    onSuccess: (chat) => {
      void utils.sidebar.invalidate()
      void navigation.push(`/c/:chatId`, {
        chatId: chat.id,
      })
    },
  })

  const defaultAppId = defaultApp?.id
  type MutateArgs = Parameters<typeof mutate>

  return {
    ...obj,
    mutate: useCallback(
      (options?: MutateArgs[1]) => {
        if (!defaultAppId) return
        mutate({ appId: defaultAppId }, options)
      },
      [defaultAppId, mutate],
    ),
  }
}

export const useDeleteChat = () => {
  const errorHandler = useErrorHandler()
  const utils = api.useContext()

  const { mutate: createChat } = useCreateStandaloneChat()

  return api.chats.deleteChat.useMutation({
    onError: errorHandler(),
    onSuccess: async () => {
      await utils.sidebar.invalidate()
      createChat()
    },
  })
}

export const useUpdateAppConfigForStandaloneChat = () => {
  const errorHandler = useErrorHandler()

  return api.chats.updateAppConfigForStandaloneChat.useMutation({
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

export const useAppConfigForChat = (chatId?: string) => {
  const errorHandler = useErrorHandler()
  return api.chats.getAppConfigForChatId.useQuery(
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
  const { data: chat } = useChatById(chatId)
  const { data: app } = useAppById(chat?.appId)

  const appType = AppType.Assistant

  const {
    messages: vercelChatMessages,
    append: chatAppend,
    setMessages: setVercelChatMessages,
  } = useVercelChat({
    api: '/api/chat',
    onFinish: () => {
      setIsLoading(false)
      clearVercelMessages()

      // Expects the title to be generated
      void utils.sidebar.chatHistoryForSidebar.invalidate()
    },

    onError: (error) => {
      setIsLoading(false)
      clearVercelMessages()
      return errorHandler()(error)
    },
  })

  const onAssistantError = (error: Error) => {
    if (error.message.includes('Failed to parse stream string')) {
      setIsLoading(false)
      clearVercelMessages()
      return errorHandler()(error)
    }
  }

  const {
    messages: vercelAssistantMessages,
    setMessages: setVercelAssistantMessages,
    append: assistantAppend,
    // status: assistantStatus,
    // error: assistantError,
  } = useVercelAssistant({
    api: '/api/chat',
    onError: onAssistantError,
  })

  const clearVercelMessages = useCallback(() => {
    setVercelChatMessages([])
    setVercelAssistantMessages([])
  }, [setVercelChatMessages, setVercelAssistantMessages])

  const targetMessage =
    appType === AppType.Assistant
      ? vercelAssistantMessages?.[1]?.content
      : vercelChatMessages?.[1]?.content
  console.log('targetMessage', targetMessage)
  useEffect(() => {
    if (!chatId || !targetMessage) return

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
            appConfigVersionId: null,
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
            void utils.sidebar.chatHistoryForSidebar.invalidate()
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
                  appConfigVersionId: null,
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
                  clearVercelMessages()

                  if (appType === AppType.Assistant) {
                    return void assistantAppend(
                      {
                        id: assistantMessage.id,
                        role: Author.User,
                        content: '',
                      },
                      {
                        data: { chatId },
                      },
                    )
                  }

                  void chatAppend(
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
    [
      chatAppend,
      createMessage,
      utils,
      errorHandler,
      chatId,
      assistantAppend,
      clearVercelMessages,
      appType,
    ],
  )

  return {
    mutate,
    isLoading,
  }
}

export const useUpdateChat = (debounceMs = 0) => {
  const errorHandler = useErrorHandler()
  const utils = api.useContext()

  const { mutate, ...rest } = api.chats.updateChat.useMutation({
    onError: errorHandler(),
    onSuccess: () => {
      void utils.sidebar.appsForSidebar.invalidate()
      void utils.sidebar.chatHistoryForSidebar.invalidate()
    },
  })

  type MutateArgs = Parameters<typeof mutate>
  type Params = MutateArgs[0]
  type Options = MutateArgs[1]

  const { data: app } = useDefaultApp()
  const { data: workspace } = useCurrentWorkspace()

  return {
    mutate: debounce((params: Params, options?: Options) => {
      if (!app || !workspace) return

      utils.sidebar.chatHistoryForSidebar.setData(
        { workspaceId: workspace.id },
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
