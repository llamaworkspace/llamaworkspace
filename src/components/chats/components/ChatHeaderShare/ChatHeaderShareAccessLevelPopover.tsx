import { useUpdateShareAccessLevelForApp } from '@/components/apps/postsHooks'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useSuccessToast } from '@/components/ui/toastHooks'
import { cn } from '@/lib/utils'
import { UserAccessLevelActions } from '@/shared/globalTypes'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { CheckIcon } from '@heroicons/react/24/solid'
import { useMemo, useState } from 'react'

const permissionLevelOptions = [
  {
    title: 'Owner',
    value: UserAccessLevelActions.Owner,
    description: 'All permissions, including deletion',
    disabled: true,
  },
  {
    title: 'Edit',
    value: UserAccessLevelActions.Edit,
    description: 'Use, invite members and edit settings',
    disabled: false,
  },
  {
    title: 'Invite',
    value: UserAccessLevelActions.Invite,
    description: 'Use and invite members',
    disabled: false,
  },
  {
    title: 'Use',
    value: UserAccessLevelActions.Use,
    description: 'Use this GPT',
    disabled: false,
  },
  {
    title: 'Remove',
    description: "Remove this person's access",
    value: UserAccessLevelActions.Remove,
    disabled: false,
  },
]

interface ChatHeaderShareAccessLevelPopoverProps {
  activeAccessLevel: UserAccessLevelActions
  shareTargetId: string
}

export const ChatHeaderShareAccessLevelPopover = ({
  shareTargetId,
  activeAccessLevel,
}: ChatHeaderShareAccessLevelPopoverProps) => {
  const { mutateAsync: updateAccessLevel } = useUpdateShareAccessLevelForApp()
  const [popoverIsOpen, setPopoverIsOpen] = useState(false)
  const toast = useSuccessToast()

  // Me he quedado que tengo que implementar de nueveo este hook

  const handleClickFor =
    (clickedAccessLevel: UserAccessLevelActions) => async () => {
      await updateAccessLevel(
        { shareTargetId, accessLevel: clickedAccessLevel },
        {
          onSuccess: () => {
            if (clickedAccessLevel === UserAccessLevelActions.Remove) {
              toast(undefined, 'Access removed')
            } else {
              toast(undefined, 'Access level updated')
            }
            close()
          },
        },
      )
    }

  const targetOption = useMemo(() => {
    return permissionLevelOptions.find((option) => {
      return option.value === activeAccessLevel
    })
  }, [activeAccessLevel])

  return (
    <Popover
      open={popoverIsOpen}
      onOpenChange={() => setPopoverIsOpen(!popoverIsOpen)}
    >
      <PopoverTrigger>
        <div className="flex items-center gap-x-1 text-xs text-zinc-400">
          {targetOption?.title}

          {activeAccessLevel !== UserAccessLevelActions.Owner && (
            <ChevronDownIcon
              className={cn('h-3 w-3', popoverIsOpen && 'rotate-180 transform')}
            />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="max-w-64 space-y-1 p-1" side="right">
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
                'flex items-center justify-between rounded px-2 py-1',
                isActive && 'bg-zinc-100',
                !option.disabled && 'cursor-pointer hover:bg-zinc-200',
                option.disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              <div>
                <div
                  className={cn(
                    'text-sm font-medium',
                    option.value === UserAccessLevelActions.Remove
                      ? 'text-red-600'
                      : 'text-zinc-600',
                  )}
                >
                  {option.title}
                </div>
                <div
                  className={cn(
                    'text-xs',
                    option.value === UserAccessLevelActions.Remove
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
      </PopoverContent>
    </Popover>
  )
}
