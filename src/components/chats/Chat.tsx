import { cn } from '@/lib/utils'
import {
  ChatAuthor,
  OpenAiModelEnum,
  OpenaiModelToHuman,
} from '@/shared/aiTypesAndMappers'
import { useCallback, useEffect, useState } from 'react'
import { useGlobalState } from '../global/globalState'
import { useDefaultPost } from '../posts/postsHooks'
import {
  useMessages,
  usePostConfigForChat,
  useUpdatePostConfigForStandaloneChat,
} from './chatHooks'
import { ChatMessage } from './components/ChatMessage'
import { ChatMessageInitial } from './components/ChatMessageInitial'
import { ChatNoSettingsAlert } from './components/ChatNoSettingsAlert'
import { ChatStandaloneModelSelector } from './components/ChatStandaloneModelSelector'
import { Chatbox } from './components/Chatbox'

interface ChatProps {
  postId?: string
  chatId?: string
}

const LAST_BLOCK_HEIGHT_INCREMENTS = 24
const LAST_BLOCK_MIN_HEIGHT = 80

export function Chat({ postId, chatId }: ChatProps) {
  const { state } = useGlobalState()
  const { isDesktopSidebarOpen } = state
  const { data: messages } = useMessages(chatId)
  const { data: postConfig, refetch } = usePostConfigForChat(chatId)
  const { data: defaultPost } = useDefaultPost()
  const [lastBlockHeight, setLastBlockHeight] = useState(LAST_BLOCK_MIN_HEIGHT)
  const [displayModelSelector, setDisplayModelSelector] = useState(false)

  const { mutate: updatePostConfigVersion } =
    useUpdatePostConfigForStandaloneChat()
  const handleChatboxHeightChangeStable = useCallback((height: number) => {
    const lines = height / 24 ?? 1
    const nextHeight = (function () {
      if (lines === 1) return LAST_BLOCK_MIN_HEIGHT
      if (lines === 2)
        return LAST_BLOCK_MIN_HEIGHT + LAST_BLOCK_HEIGHT_INCREMENTS / 2
      return (
        LAST_BLOCK_MIN_HEIGHT + (lines - 1.5) * LAST_BLOCK_HEIGHT_INCREMENTS
      )
    })()

    setLastBlockHeight(nextHeight)
  }, [])

  const [standaloneModel, setStandaloneModel] = useState<OpenAiModelEnum>()

  useEffect(() => {
    if (postConfig?.model) {
      setStandaloneModel(postConfig.model as OpenAiModelEnum)
    }
  }, [postConfig?.model])

  const isStandaloneChat =
    !!postId && !!defaultPost && postId === defaultPost.id
  const shouldShowModelSelector =
    !!standaloneModel && isStandaloneChat && messages?.length === 0

  useEffect(() => {
    if (shouldShowModelSelector) {
      setDisplayModelSelector(true)
    }
    if (!shouldShowModelSelector && displayModelSelector) {
      setTimeout(() => {
        setDisplayModelSelector(false)
      }, 500)
    }
  }, [shouldShowModelSelector, displayModelSelector])

  const handleStandaloneModelChange = () => {
    if (!chatId) return

    updatePostConfigVersion(
      {
        chatId,
        model:
          standaloneModel === OpenAiModelEnum.GPT3_5_TURBO
            ? OpenAiModelEnum.GPT4
            : OpenAiModelEnum.GPT3_5_TURBO,
      },
      { onSuccess: () => void refetch() },
    )

    if (standaloneModel === OpenAiModelEnum.GPT3_5_TURBO) {
      return setStandaloneModel(OpenAiModelEnum.GPT4)
    }
    setStandaloneModel(OpenAiModelEnum.GPT3_5_TURBO)
  }

  const refreshKey = `${postId}-${chatId}`

  return (
    <div
      // Important: Keep this key here to force a remount
      // of the component on all route changes.
      key={refreshKey}
      className="relative flex h-full w-full flex-1 flex-col-reverse overflow-y-auto overflow-x-hidden bg-white p-4"
    >
      <div className="mx-auto flex w-full max-w-4xl grow flex-col gap-y-2 pb-4">
        {displayModelSelector && (
          <div
            className={cn(
              'mx-auto mt-6 transition',
              shouldShowModelSelector
                ? 'translate-y-4 opacity-100'
                : 'translate-y-0  opacity-0',
            )}
          >
            <ChatStandaloneModelSelector
              activeModel={standaloneModel!}
              onChange={handleStandaloneModelChange}
            />
          </div>
        )}

        <div className="grow">
          <ChatNoSettingsAlert postId={postId} chatId={chatId} />
        </div>
        <ChatMessageInitial chatId={chatId} />

        {messages
          ?.map((message) => {
            return (
              <ChatMessage
                variant={getVariant(message.author)}
                key={message.id}
                message={message.message ?? ''}
                author={getAuthor(message.author, postConfig?.model) ?? ''}
              />
            )
          })
          .reverse()}

        <div style={{ minHeight: lastBlockHeight }}></div>

        {/* Chatbox here */}
        <div
          className={cn(
            'transition-spacing fixed bottom-0 left-0 w-full bg-white px-2 py-4 duration-200 ease-out ',
            isDesktopSidebarOpen && 'md:pl-72',
          )}
        >
          <Chatbox
            postId={postId}
            chatId={chatId}
            stableOnChatboxHeightChange={handleChatboxHeightChangeStable}
          />
        </div>
      </div>
    </div>
  )
}

function getAuthor(author: string, model?: string) {
  if (author === (ChatAuthor.Assistant as string)) {
    if (!model) return null
    return OpenaiModelToHuman[model as OpenAiModelEnum]
  } else if (author === (ChatAuthor.Wizard as string)) {
    return 'Prompt Wizard'
  }
  return 'You'
}

function getVariant(author: string) {
  if (author === (ChatAuthor.Assistant as string)) {
    return 'green'
  } else if (author === (ChatAuthor.Wizard as string)) {
    return 'wizard'
  }
  return 'default'
}
