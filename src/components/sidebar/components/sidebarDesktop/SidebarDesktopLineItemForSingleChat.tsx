import { useUpdateChat } from '@/components/chats/chatHooks'
import { InputField } from '@/components/ui/forms/InputField'
import { useClickToDoubleClick } from '@/lib/frontend/useClickToDoubleClick'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useState } from 'react'
import { Field, Form as FinalForm } from 'react-final-form'
import { SidebarDesktopLineItemChatDropdown } from './SidebarDesktopLineItemChatDropdown'

interface SidebarDesktopLineItemForSingleChatProps {
  id: string
  title: string
  href: string
  isCurrent: boolean
}

interface FormTitleEditValues {
  title: string
}

export function SidebarDesktopLineItemForSingleChat({
  id,
  title,
  isCurrent = false,
  href,
}: SidebarDesktopLineItemForSingleChatProps) {
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

    mutate({ id, title })
  }

  return (
    <li>
      <div
        className={cn(
          isCurrent
            ? 'bg-zinc-100'
            : 'text-zinc-700 transition hover:bg-zinc-50',
          'rounded-md p-1 text-sm',
        )}
      >
        <Link
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          href={href}
        >
          <div>
            <div
              className={cn(
                'group flex items-center gap-x-2 rounded-md leading-6',
                isCurrent
                  ? 'font-bold text-zinc-900'
                  : 'font-medium text-zinc-600 hover:text-zinc-600',
              )}
            >
              <div className="flex w-full items-center justify-between space-x-1">
                <div
                  className={cn(
                    'line-clamp-1 grow',
                    isCurrent ? 'text-zinc-900' : 'text-zinc-600',
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
                      onClick={handleClick}
                      className={cn(
                        'line-clamp-1 grow text-sm leading-6',
                        isCurrent
                          ? 'font-bold text-zinc-900'
                          : 'font-regular text-zinc-600',
                      )}
                    >
                      {title}
                    </span>
                  )}
                </div>
                <SidebarDesktopLineItemChatDropdown
                  isPrivate
                  chatId={id}
                  isHovered={isHovered}
                  isLastChat={false}
                />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </li>
  )
}
