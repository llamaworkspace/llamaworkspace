import { StyledLink } from '@/components/ui/StyledLink'
import { Button } from '@/components/ui/button'
import { BoxedRadioGroupField } from '@/components/ui/forms/BoxedRadioGroupField'
import { InputField } from '@/components/ui/forms/InputField'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { api } from '@/lib/api'
import { stringRequired } from '@/lib/frontend/finalFormValidations'
import { getEnumByValue } from '@/lib/utils'
import { InitialModel } from '@/shared/globalTypes'
import { Field, Form as FinalForm } from 'react-final-form'
import { usePeformInitialModelSetup } from '../onboardingHooks'

const options = [
  {
    value: InitialModel.Openai,
    title: 'GPT-4o',
    description: 'GPT-4o will be used as the default model for all chats.',
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
  {
    value: InitialModel.Llama,
    title: 'GPT-4o + Llama 3',
    description:
      'Llama 3.1 405B will be used as the default model for all chats.',
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
]

interface FormValues {
  model: string
  apiKey: string
  openAiApiKey?: string
}

const textClasses = 'text-sm text-zinc-700'

interface OnboardingSetApiKeysProps {
  onSuccess?: () => Promise<void>
}

export const OnboardingSetApiKeys = ({
  onSuccess,
}: OnboardingSetApiKeysProps) => {
  const { data: workspace } = useCurrentWorkspace()
  const { mutateAsync: performInitialModelSetup } = usePeformInitialModelSetup()
  const utils = api.useContext()

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

    await utils.users.getSelf.invalidate()

    await onSuccess?.()
  }

  return (
    <div className="space-y-4">
      <div className={textClasses}>
        Great! Now select which models you want to start working with and add
        the necessary API keys.
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
                      label="Initial models"
                      meta={meta}
                      options={options}
                      {...input}
                    />
                  )
                }}
              />

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
                  {/* <div className={textClasses}>
                    <strong>Why is an OpenAI API key needed?</strong> We are
                    actively working on making the project fully independent of
                    closed-source models. However, we still need an OpenAI key
                    for specific use cases like generating embeddings. We expect
                    to remove this dependency in an upcoming update.
                  </div> */}
                </div>
              )}
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

              <Button onClick={() => void handleSubmit()}>Continue</Button>
            </div>
          )
        }}
      />
    </div>
  )
}
