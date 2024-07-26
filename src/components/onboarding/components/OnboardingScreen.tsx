import { StyledLink } from '@/components/ui/StyledLink'
import { Button } from '@/components/ui/button'
import { BoxedRadioGroupField } from '@/components/ui/forms/BoxedRadioGroupField'
import { InputField } from '@/components/ui/forms/InputField'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { stringRequired } from '@/lib/frontend/finalFormValidations'
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
  onSuccess?: () => void
}

export const OnboardingScreen = ({ onSuccess }: OnboardingScreenProps) => {
  const { data: workspace } = useCurrentWorkspace()
  const { mutateAsync: performInitialModelSetup } = usePeformInitialModelSetup()

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
  }

  return (
    <div className="space-y-4">
      <div className={textClasses}>
        You must set up at least one model provider for the product to work.
        Select the initial Large Language Model you want to use. You will be
        able to add more models later.
      </div>
      <FinalForm<FormValues>
        onSubmit={handleSubmit}
        render={({ handleSubmit, values }) => {
          const { model: modelValue } = values

          const option = options.find((o) => o.value.toString() === modelValue)
          const openaiOption = options.find(
            (o) => o.value === InitialModel.Openai,
          )
          return (
            <div className="space-y-8">
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
                <div className="space-y-4">
                  <div>
                    <Field
                      name="openAiApiKey"
                      validate={stringRequired}
                      render={({ input, meta }) => {
                        return (
                          <InputField
                            label={openaiOption?.apiKeyLabel}
                            helperText={openaiOption?.apiKeyHelperText}
                            meta={meta}
                            {...input}
                          />
                        )
                      }}
                    />
                  </div>
                  <div className={textClasses}>
                    <strong>Why is an OpenAI API key needed?</strong> We are
                    actively working on making the project fully independent of
                    closed-source models. However, we still need an OpenAI key
                    for specific use cases like generating embeddings. We expect
                    to remove this dependency in an upcoming update.
                  </div>
                </div>
              )}

              <Button onClick={() => void handleSubmit()}>Continue</Button>
            </div>
          )
        }}
      />
    </div>
  )
}
