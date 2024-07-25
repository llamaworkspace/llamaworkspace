import { useUpdateAiProvider } from '@/components/ai/aiHooks'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { BoxedRadioGroupField } from '@/components/ui/forms/BoxedRadioGroupField'
import { InputField } from '@/components/ui/forms/InputField'
import { useSuccessToast } from '@/components/ui/toastHooks'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { stringRequired } from '@/lib/frontend/finalFormValidations'
import { InitialModel } from '@/shared/globalTypes'
import { Field, Form as FinalForm } from 'react-final-form'
import { useSetupInitialModel } from '../onboardingHooks'

const options = [
  {
    value: InitialModel.Llama,
    title: 'Llama 3.1',
    description: 'Requires an openrouter.ai API key',
    apiKeyLabel: 'Openrouter.ai API key',
    apiKeyHelperText: 'You can obtain an API key here... LINK',
    providerSlug: 'openrouter',
    modelSlug: 'meta-llama/llama-3.1-405b-instruct',
  },
  {
    value: InitialModel.Openai,
    title: 'OpenAI GPT-4o',
    description: 'Requires an OpenAI API key',
    apiKeyLabel: 'OpenAI API key',
    apiKeyHelperText: 'You can obtain an API key here... LINK',
    providerSlug: 'openai',
    modelSlug: 'gpt-4o',
  },
  // {
  //   value: InitialModel.Claude,
  //   title: 'Claude Sonnet 3.5',
  //   description: 'Requires an Anthropic API key',
  //   apiKeyLabel: 'Anthropic API key',
  //   apiKeyHelperText: 'You can obtain an API key here... LINK',
  //   providerSlug: 'anthropic',
  //   modelSlug: 'claude-3-5-sonnet-20240620',
  // },
]

interface FormValues {
  model: string
  apiKey: string
  openAiApiKey?: string
}

const textClasses = 'text-sm text-zinc-700'

export const OnboardingModal = () => {
  const successToast = useSuccessToast()
  const { data: workspace } = useCurrentWorkspace()
  const { mutateAsync: updateAiProvider } = useUpdateAiProvider()
  const { mutateAsync: setupInitialModel } = useSetupInitialModel()

  const handleSubmit = async (values: FormValues) => {
    if (!workspace) return
    const option = options.find((o) => o.value.toString() === values.model)
    if (!option) return
    return console.log('values', values)
    await updateAiProvider(
      {
        workspaceId: workspace.id,
        providerSlug: values.model,
        keyValues: {
          apiKey: values.apiKey,
        },
        models: [{ slug: option.modelSlug, enabled: true }],
      },
      {
        onSuccess: () => {
          successToast(undefined, 'Provider updated')
        },
      },
    )
    setupInitialModel({
      id: workspace.id,
      title: 'Initial model',
    })
  }

  return (
    <Dialog open={true}>
      <DialogTrigger asChild>Pepe</DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-scroll sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Let&apos;s get this party started</DialogTitle>
        </DialogHeader>
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
              const option = options.find(
                (o) => o.value.toString() === modelValue,
              )
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
                      {/* <Alert variant="fuchsia">
                        <AlertTitle>Sign in failed</AlertTitle>
                        <AlertDescription className="space-y-2">
                          Currently we need an OpenAI key to generate embeddings
                          and titles. We are working on making Llama fully
                          independent of closed-sourced models, but for now we
                          need this key.
                        </AlertDescription>
                      </Alert> */}
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
                        project is in active development to become fully
                        independent of closed-sourced models, but we still need
                        an OpenAI key for certain use cases like generating
                        embeddings. We expect to remove this dependency in an
                        upcoming update.
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
      </DialogContent>
    </Dialog>
  )
}
