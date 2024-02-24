import { useUpdateChat } from '@/components/chats/chatHooks'
import { Button } from '@/components/ui/button'
import { InputField } from '@/components/ui/forms/InputField'
import { useClickToDoubleClick } from '@/lib/frontend/useClickToDoubleClick'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Field, Form as FinalForm } from 'react-final-form'
import { useChatHistoryForSidebarPost } from '../../sidebarHooks'
import { SidebarDesktopLineItemChatDropdown } from './SidebarDesktopLineItemChatDropdown'

export const SidebarDesktopLineItemHistory = ({
  postId,
  currentChatId,
}: {
  postId: string
  currentChatId?: string
}) => {
  const { data: chatHistory } = useChatHistoryForSidebarPost(postId)

  const [firstThreeChatHistory, nextChatHistory] = useMemo(
    () => [chatHistory?.slice(0, 3), chatHistory?.slice(3)],
    [chatHistory],
  )

  const displayMoreButton = chatHistory && chatHistory.length > 3

  const [isMore, setIsMore] = useState(false)
  const handleMore = () => {
    setIsMore(!isMore)
  }
  return (
    <div className="mt-1 max-h-[180px] space-y-0.5 overflow-y-auto rounded text-[0.84rem]">
      {firstThreeChatHistory?.map((chat) => (
        <HistoryItem
          key={chat.id}
          chatId={chat.id}
          title={chat.title ?? 'Untitled chat'}
          postId={postId}
          isCurrent={chat.id === currentChatId}
          isLastChat={firstThreeChatHistory.length === 1}
        />
      ))}
      {isMore &&
        nextChatHistory?.map((chat) => {
          return (
            <HistoryItem
              key={chat.id}
              chatId={chat.id}
              title={chat.title ?? 'Untitled chat'}
              postId={postId}
              isCurrent={chat.id === currentChatId}
              isLastChat={false}
            />
          )
        })}
      {displayMoreButton && (
        <div className="pt-2x cursor-pointer p-1 pt-2">
          <Button
            variant="link"
            size="paddingless"
            className="text-[0.84rem] font-semibold text-zinc-500"
            onClick={handleMore}
          >
            {isMore ? 'See less' : 'See previous chats'}
          </Button>
        </div>
      )}
    </div>
  )
}

interface HistoryItemProps {
  chatId: string
  postId: string
  title: string
  isCurrent: boolean
  isLastChat: boolean
}

interface FormTitleEditValues {
  title: string
}

function HistoryItem({
  chatId,
  postId,
  title,
  isCurrent,
  isLastChat,
}: HistoryItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isEditable, setIsEditable] = useState(false)
  const { mutate } = useUpdateChat()

  const handleClick = useClickToDoubleClick(() => {
    setIsEditable(true)
  })

  const handleChange = ({ title }: FormTitleEditValues) => {
    setIsEditable(false)
    if (!title) {
      return
    }

    mutate({ id: chatId, title })
  }

  return (
    <Link
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      href={`/p/${postId}/c/${chatId}`}
      className={cn(
        'flex w-full justify-between gap-2 rounded p-1 transition',
        isCurrent
          ? 'bg-opacity-1000 bg-zinc-200 '
          : 'hover:bg-zinc-200/50  hover:bg-opacity-100',
      )}
    >
      {isEditable ? (
        <FinalForm<FormTitleEditValues>
          onSubmit={handleChange}
          initialValues={{ title }}
          render={({ handleSubmit }) => {
            return (
              <Field
                name="title"
                render={({ input }) => {
                  return (
                    <InputField
                      type="text"
                      placeholder="Untitled chat"
                      onEnterKeyDown={() => void handleSubmit()}
                      focusOnMount
                      variant="unstyled"
                      className="focus-visible:ring-none w-full bg-transparent placeholder:text-zinc-500 focus-visible:outline-none"
                      {...input}
                      onBlur={() => void handleSubmit()}
                    />
                  )
                }}
              />
            )
          }}
        />
      ) : (
        <span
          className={cn(
            'line-clamp-1 text-zinc-700 transition',
            isCurrent && 'font-semibold text-zinc-900 ',
          )}
        >
          {title}
        </span>
      )}
      <SidebarDesktopLineItemChatDropdown
        chatId={chatId}
        isHovered={isHovered}
        isLastChat={isLastChat}
      />
    </Link>
  )
}
