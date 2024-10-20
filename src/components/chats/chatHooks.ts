import { api } from '@/lib/api'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { ensureError } from '@/lib/utils'
import { Author, ChatAuthor } from '@/shared/aiTypesAndMappers'
import { useAssistant as useVercelAssistant } from 'ai/react'
import { produce } from 'immer'
import { debounce } from 'lodash'
import { useCallback, useEffect } from 'react'
import { useDefaultApp } from '../apps/appsHooks'
import { useTrack } from '../global/clientAnalytics'
import { useErrorHandler } from '../global/errorHandlingHooks'
import { EventsRegistry } from '../global/eventsRegistry'
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
  const track = useTrack()

  const utils = api.useContext()
  const navigation = useNavigation()
  const { mutate, ...obj } = api.chats.createChat.useMutation({
    onError: errorHandler(),
    onSuccess: (chat) => {
      track(EventsRegistry.ChatCreated, { chatId: chat.id })
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
  const utils = api.useUtils()
  const errorHandler = useErrorHandler()
  const errorToast = useErrorToast()

  // Utils is not deep equal stable, so we need to memoize it
  const refetchMessages = useCallback(() => {
    if (!chatId) return
    return utils.chats.getMessagesByChatId.refetch({ chatId })
  }, [chatId, utils])

  const {
    messages: vercelAssistantMessages,
    setMessages: setVercelAssistantMessages,
    append: assistantAppend,
    status: assistantStatus,
    error,
  } = useVercelAssistant({
    api: '/api/chat',
  })

  const clearVercelMessages = useCallback(() => {
    setVercelAssistantMessages([])
  }, [setVercelAssistantMessages])

  useEffect(() => {
    if (error) {
      errorToast(ensureError(error).message)
    }
    clearVercelMessages()

    if (chatId) {
      void refetchMessages()
    }
  }, [
    errorHandler,
    error,
    errorToast,
    chatId,
    clearVercelMessages,
    refetchMessages,
  ])

  const chatIsActive = assistantStatus !== 'awaiting_message'

  const targetMessage =
    vercelAssistantMessages?.[vercelAssistantMessages.length - 1]?.content

  useEffect(() => {
    if (!chatId || !targetMessage) return

    // Writes streamed response to usequery cache
    utils.chats.getMessagesByChatId.setData({ chatId }, (previous) => {
      if (previous) {
        // It assumes that the last item is the target assistant message
        return produce(previous, (draft) => {
          if (!draft.length) return

          draft[draft.length - 1]!.message = targetMessage
        })
      }
      return previous
    })
  }, [targetMessage, chatId, utils])

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
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          draft?.push(obj)
        })
      })

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
                target = {
                  ...userMessage,
                  message: userMessage.message ?? '',
                }
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
                  message: '',
                  author: ChatAuthor.Assistant,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                }

                draft?.push(obj)
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
                        target = {
                          ...assistantMessage,
                          message: assistantMessage.message ?? '',
                        }
                      })
                    },
                  )
                  clearVercelMessages()

                  void assistantAppend(
                    {
                      id: assistantMessage.id,
                      role: Author.User,
                      content: '',
                    },
                    {
                      data: { chatId },
                    },
                  )
                },
              },
            )
          },
        },
      )
    },
    [createMessage, utils, chatId, assistantAppend, clearVercelMessages],
  )

  return {
    mutate,
    isLoading: chatIsActive,
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
