import { StyledLink } from '@/components/ui/StyledLink'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { cn } from '@/lib/utils'
import { OpenAiModelEnum, OpenaiModelToHuman } from '@/shared/aiTypesAndMappers'
import { RadioGroup } from '@headlessui/react'
import { CheckCircleIcon } from '@heroicons/react/20/solid'

const models = [
  {
    id: OpenAiModelEnum.GPT3_5_TURBO,
    title: OpenaiModelToHuman[OpenAiModelEnum.GPT3_5_TURBO],
    description: `OpenAI's fastest and most budget-friendly model. Ideal for most daily tasks.`,
  },
  {
    id: OpenAiModelEnum.GPT4,
    title: OpenaiModelToHuman[OpenAiModelEnum.GPT4],
    description: `OpenAI's most complete model to date. Ideal for tasks that require advanced reasoning, creativity or a broader historical background.`,
  },
]

interface ChatStandaloneModelSelectorProps {
  activeModel: OpenAiModelEnum
  onChange: (model: string) => void
}

export const ChatStandaloneModelSelector = ({
  activeModel,
  onChange,
}: ChatStandaloneModelSelectorProps) => {
  const { workspace } = useCurrentWorkspace()
  const profileUrl = `/w/${workspace?.id}/profile`

  return (
    <div className="space-y-2">
      <RadioGroup value={activeModel} onChange={onChange}>
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          {models.map((model) => (
            <RadioGroup.Option
              key={model.id}
              value={model.id}
              className={({ active }) =>
                cn(
                  active ? 'border-zinc-600 ' : 'border-zinc-300',
                  'relative flex max-w-[300px] cursor-pointer rounded-lg border bg-white p-4 shadow-sm',
                )
              }
            >
              {({ checked }) => (
                <>
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <RadioGroup.Label
                        as="span"
                        className="block text-sm font-semibold text-zinc-900"
                      >
                        {model.title}
                      </RadioGroup.Label>
                      <RadioGroup.Description
                        as="span"
                        className="mt-1 flex items-center text-[0.84rem] text-zinc-500"
                      >
                        {model.description}
                      </RadioGroup.Description>
                    </span>
                  </span>
                  <CheckCircleIcon
                    className={cn(
                      !checked ? 'invisible' : '',
                      'h-5 w-5 text-fuchsia-600',
                    )}
                    aria-hidden="true"
                  />
                  <span
                    className={cn(
                      'border-2',
                      checked ? 'border-fuchsia-600' : 'border-transparent',
                      'pointer-events-none absolute -inset-px rounded-lg',
                    )}
                    aria-hidden="true"
                  />
                </>
              )}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
      <div className="text-xs text-zinc-500">
        Update the default model{' '}
        <StyledLink href={profileUrl}>in your profile</StyledLink>.
      </div>
    </div>
  )
}
