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
import { stringRequired } from '@/lib/frontend/finalFormValidations'
import { Field, Form as FinalForm } from 'react-final-form'

enum InitialModel {
  Llama = 'llama',
  OpenAI = 'openai',
  Claude = 'claude',
}

const options = [
  {
    value: InitialModel.Llama,
    title: 'Llama 3.1 405B',
    description: 'Requires an openrouter.ai API key',
  },
  {
    value: InitialModel.OpenAI,
    title: 'OpenAI GPT-4o',
    description: 'Requires an OpenAI API key',
  },
  {
    value: InitialModel.Claude,
    title: 'Claude Sonnet 3.5',
    description: 'Requires an Anthropic API key',
  },
]

interface FormValues {
  model: string
}

export const OnboardingModal = () => {
  return (
    <Dialog open={true}>
      <DialogTrigger asChild>Pepe</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Let&apos;s get this party started</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-zinc-700">
            Select the initial Large Language Model you want to use. You will be
            able to add more models from different AI providers later.
          </div>
          <FinalForm<FormValues>
            onSubmit={(values) => {
              // void handleCreateApp(values)
              console.log(values)
            }}
            render={({ handleSubmit, values }) => {
              const { model: modelValue } = values
              console.log(2, modelValue)
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
                  {modelValue === InitialModel.Llama.toString() && (
                    <Field
                      name="openrouterApiKey"
                      validate={stringRequired}
                      render={({ input, meta }) => {
                        return (
                          <InputField
                            label="Openrouter API key"
                            helperText="You can obtain an API key by signing up at openrouter.ai"
                            meta={meta}
                            {...input}
                          />
                        )
                      }}
                    />
                  )}
                  {modelValue === InitialModel.OpenAI.toString() && (
                    <Field
                      name="openaiApiKey"
                      validate={stringRequired}
                      render={({ input, meta }) => {
                        return (
                          <InputField
                            label="OpenAI API key"
                            helperText="You can obtain an API key here... LINK"
                            meta={meta}
                            {...input}
                          />
                        )
                      }}
                    />
                  )}
                  {modelValue === InitialModel.Claude.toString() && (
                    <Field
                      name="anthropicApiKey"
                      validate={stringRequired}
                      render={({ input, meta }) => {
                        return (
                          <InputField
                            label="Anthropic API key"
                            helperText="You can obtain an API key here... LINK"
                            meta={meta}
                            {...input}
                          />
                        )
                      }}
                    />
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
