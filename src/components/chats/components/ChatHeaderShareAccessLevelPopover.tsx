import { useAccessLevelForPost } from '@/components/permissions/permissionsHooks'
import { usePostShareUpdateAccessLevel } from '@/components/posts/postsHooks'
import { useSuccessToast } from '@/components/ui/toastHooks'
import { cn } from '@/lib/utils'
import { UserAccessLevel } from '@/shared/globalTypes'
import { Popover, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { CheckIcon } from '@heroicons/react/24/solid'

type UserAccessLevelWithRemove = UserAccessLevel | 'remove'

const permissionLevelOptions = [
  {
    title: 'Owner',
    value: UserAccessLevel.Owner,
    description: 'All permissions, including deletion',
    disabled: true,
  },
  {
    title: 'Edit and share',
    value: UserAccessLevel.EditAndShare,
    description: 'Use, edit and share with others',
  },
  {
    title: 'Use',
    value: UserAccessLevel.Use,
    description: 'Create and run chats',
  },
  {
    title: 'View',
    value: UserAccessLevel.View,
    description: 'View existing chats only',
  },
  {
    title: 'Remove',
    description: "Remove this person's access",
    value: 'remove' as const,
  },
]

export const ChatHeaderShareAccessLevelPopover = ({
  postId,
  shareId,
  activeAccessLevel,
}: {
  postId: string
  activeAccessLevel: UserAccessLevel
  shareId: string
}) => {
  const { mutate: updateAccessLevel } = usePostShareUpdateAccessLevel()

  const toast = useSuccessToast()
  const { accessLevel } = useAccessLevelForPost(postId)

  if (!accessLevel) {
    return null
  }

  return (
    <Popover>
      {({ open, close }) => {
        const handleClickFor =
          (clickedAccessLevel: UserAccessLevelWithRemove) => () => {
            updateAccessLevel(
              { shareId, accessLevel: clickedAccessLevel },
              {
                onSuccess: () => {
                  if (clickedAccessLevel === 'remove') {
                    toast(undefined, 'Access removed')
                  } else {
                    toast(undefined, 'Access level updated')
                  }
                  close()
                },
              },
            )
          }

        const targetOption = permissionLevelOptions.find((option) => {
          return option.value === activeAccessLevel
        })

        return (
          <>
            <Popover.Button
              className={cn(
                'font-medium',
                activeAccessLevel === UserAccessLevel.Owner && 'cursor-default',
              )}
              disabled={activeAccessLevel === UserAccessLevel.Owner}
            >
              <div className="flex items-center gap-x-1 text-xs text-zinc-400">
                {targetOption?.title}

                <ChevronDownIcon
                  className={cn(
                    'h-3 w-3',
                    open && 'rotate-180 transform',
                    activeAccessLevel === UserAccessLevel.Owner && 'invisible',
                  )}
                />
              </div>
            </Popover.Button>
            <Transition
              enter="transition duration-200"
              enterFrom="opacity-0 transform translate-y-0"
              enterTo="opacity-100 transform translate-y-[8px]"
              leave="transition duration-200"
              leaveFrom="opacity-100 transform translate-y-[8px]"
              leaveTo="opacity-0 transform translate-y-0"
            >
              <Popover.Panel
                static
                className="absolute right-0 top-0 min-w-[250px] space-y-1 rounded-md border  border-zinc-300 bg-white p-1 drop-shadow-xl"
              >
                {permissionLevelOptions.map((option) => {
                  const isActive = activeAccessLevel === option.value

                  return (
                    <div
                      key={option.title}
                      onClick={
                        option.disabled
                          ? () => {
                              handleClickFor // dummy function to avoid eslint error
                            }
                          : handleClickFor(option.value)
                      }
                      className={cn(
                        'flex  items-center justify-between rounded px-2 py-1 ',
                        isActive && 'bg-zinc-100',
                        !option.disabled && 'cursor-pointer hover:bg-zinc-200',
                        option.disabled && 'cursor-not-allowed opacity-50',
                      )}
                    >
                      <div>
                        <div
                          className={cn(
                            'font-medium',
                            option.value === 'remove'
                              ? 'text-red-600'
                              : 'text-zinc-600',
                          )}
                        >
                          {option.title}
                        </div>
                        <div
                          className={cn(
                            'text-xs',
                            option.value === 'remove'
                              ? 'text-red-400'
                              : 'text-zinc-400',
                          )}
                        >
                          {option.description}
                        </div>
                      </div>
                      {isActive && <CheckIcon className="h-5 w-5" />}
                    </div>
                  )
                })}
              </Popover.Panel>
            </Transition>
          </>
        )
      }}
    </Popover>
  )
}
