import { Button } from '@/components/ui/button'
import { BoxedRadioGroupField } from '@/components/ui/forms/BoxedRadioGroupField'
import { InputField } from '@/components/ui/forms/InputField'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { stringRequired } from '@/lib/frontend/finalFormValidations'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { getEnumByValue } from '@/lib/utils'
import { InitialModel } from '@/shared/globalTypes'
import { Field, Form as FinalForm } from 'react-final-form'
import { usePeformInitialModelSetup } from '../onboardingHooks'

const options = [
  {
    value: InitialModel.Llama,
    title: 'Llama 3',
    description:
      'Llama 3.1 405B will be used as default. This option requires an Openrouter API key.',
    apiKeyLabel: 'Openrouter.ai API key',
    apiKeyHelperText: 'You can obtain an API key here... LINK',
    providerSlug: 'openrouter',
    modelSlug: 'meta-llama/llama-3.1-405b-instruct',
  },
  {
    value: InitialModel.Openai,
    title: 'GPT-4',
    description:
      'GPT-4o will be used as default. This option requires an OpenAI API key.',
    apiKeyLabel: 'OpenAI API key',
    apiKeyHelperText: 'You can obtain an API key here... LINK',
    providerSlug: 'openai',
    modelSlug: 'gpt-4o',
  },
]

interface FormValues {
  model: string
  apiKey: string
  openAiApiKey?: string
}

const textClasses = 'text-sm text-zinc-700'

interface OnboardingScreenProps {
  redirectOnSuccess?: boolean
  onSuccess?: () => void
}

export const OnboardingScreen = ({
  redirectOnSuccess = false,
  onSuccess,
}: OnboardingScreenProps) => {
  const { data: workspace } = useCurrentWorkspace()
  const { mutateAsync: performInitialModelSetup } = usePeformInitialModelSetup()
  const router = useNavigation()

  const handleSubmit = async (values: FormValues) => {
    if (!workspace) return
    const option = options.find((o) => o.value.toString() === values.model)
    if (!option) return

    await performInitialModelSetup({
      workspaceId: workspace.id,
      model: getEnumByValue(InitialModel, values.model),
      apiKey: values.apiKey,
      openaiApiKey: values.openAiApiKey,
    })

    onSuccess?.()

    if (redirectOnSuccess) {
      await router.push(`/p`)
    }
  }

  return (
    <div className="space-y-4">
      <div className={textClasses}>
        Llama Workspace needs at least one model to work. Select the initial
        Large Language Model you want to use. You will be able to add more
        models later.
      </div>
      <FinalForm<FormValues>
        onSubmit={handleSubmit}
        render={({ handleSubmit, values }) => {
          const { model: modelValue } = values

          const option = options.find((o) => o.value.toString() === modelValue)
          return (
            <div className="space-y-4">
              <Field
                name="model"
                validate={stringRequired}
                render={({ input, meta }) => {
                  return (
                    <BoxedRadioGroupField
                      label="Initial model"
                      meta={meta}
                      options={options}
                      {...input}
                    />
                  )
                }}
              />
              {option && (
                <Field
                  name="apiKey"
                  validate={stringRequired}
                  render={({ input, meta }) => {
                    return (
                      <InputField
                        label={option.apiKeyLabel}
                        helperText={option.apiKeyHelperText}
                        meta={meta}
                        {...input}
                      />
                    )
                  }}
                />
              )}

              {option && option.value === InitialModel.Llama && (
                <div className="space-y-2">
                  <div>
                    <Field
                      name="openAiApiKey"
                      validate={stringRequired}
                      render={({ input, meta }) => {
                        return (
                          <InputField
                            label="OpenAI API key"
                            helperText="Do things with OpenAI"
                            meta={meta}
                            {...input}
                          />
                        )
                      }}
                    />
                  </div>
                  <div className={textClasses}>
                    <strong>Why an OpenAI API key is needed?</strong> The
                    project is in active development to become fully independent
                    of closed-sourced models, but we still need an OpenAI key
                    for certain use cases like generating embeddings. We expect
                    to remove this dependency in an upcoming update.
                  </div>
                </div>
              )}

              <Button onClick={() => void handleSubmit()}>
                Start using Llama Workspace
              </Button>
            </div>
          )
        }}
      />
    </div>
  )
}
