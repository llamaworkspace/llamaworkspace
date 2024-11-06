import { StyledLink } from '@/components/ui/StyledLink'
import { Button } from '@/components/ui/button'
import { InputField } from '@/components/ui/forms/InputField'
import {
  useCurrentWorkspace,
  useUpdateWorkspace,
} from '@/components/workspaces/workspacesHooks'
import { api } from '@/lib/api'
import { stringRequired } from '@/lib/frontend/finalFormValidations'
import { InitialModel } from '@/shared/globalTypes'
import { Field, Form as FinalForm } from 'react-final-form'

const options = [
  {
    value: InitialModel.Llama,
    title: 'Llama 3',
    description:
      'Llama 3.1 405B will be used as default. This option requires an Openrouter API key.',
    apiKeyLabel: 'Openrouter.ai API key',
    apiKeyHelperText: (
      <span>
        You can obtain an openrouter API key at{' '}
        <StyledLink href="https://openrouter.ai" target="_blank">
          openrouter.ai
        </StyledLink>
      </span>
    ),
    providerSlug: 'openrouter',
    modelSlug: 'meta-llama/llama-3.1-405b-instruct',
  },
  {
    value: InitialModel.Openai,
    title: 'GPT-4',
    description:
      'GPT-4o will be used as default. This option requires an OpenAI API key.',
    apiKeyLabel: 'OpenAI API key',
    apiKeyHelperText: (
      <span>
        You can obtain an OpenAI API key at{' '}
        <StyledLink href="https://platform.openai.com/api-keys" target="_blank">
          platform.openai.com/api-keys
        </StyledLink>
      </span>
    ),
    providerSlug: 'openai',
    modelSlug: 'openai/gpt-4o',
  },
]

interface FormValues {
  name: string
}

const textClasses = 'text-sm text-zinc-700'

interface OnboardingSetWorkspaceNameProps {
  onSuccess?: () => Promise<void>
}

export const OnboardingSetWorkspaceName = ({
  onSuccess,
}: OnboardingSetWorkspaceNameProps) => {
  const { data: workspace } = useCurrentWorkspace()

  const utils = api.useContext()
  const { mutateAsync: updateWorkspace } = useUpdateWorkspace()

  const handleSubmit = async (values: FormValues) => {
    if (!workspace) return

    await updateWorkspace({ workspaceId: workspace.id, ...values })
    await utils.users.getSelf.invalidate()
    await onSuccess?.()
  }

  return (
    <div className="space-y-4">
      <div className={textClasses}>
        Let&apos;s get started by giving your workspace a name.
      </div>
      <FinalForm<FormValues>
        onSubmit={handleSubmit}
        initialValues={{ name: workspace?.name }}
        render={({ handleSubmit }) => {
          return (
            <div className="space-y-8">
              <Field
                name="name"
                validate={stringRequired}
                render={({ input, meta }) => {
                  return <InputField label="Name" meta={meta} {...input} />
                }}
              />

              <Button onClick={() => void handleSubmit()}>Continue</Button>
            </div>
          )
        }}
      />
    </div>
  )
}
