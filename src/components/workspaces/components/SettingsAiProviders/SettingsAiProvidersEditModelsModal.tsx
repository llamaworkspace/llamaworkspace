import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InputField } from '@/components/ui/forms/InputField'
import { SelectField } from '@/components/ui/forms/SelectField'
import {
  composeValidators,
  stringOrNumberRequired,
} from '@/lib/frontend/finalFormValidations'
import { Field, Form as FinalForm } from 'react-final-form'
interface SettingsAiProvidersProviderModalProps {
  aiProviderId?: string
}

export const SettingsAiProvidersEditModelsModal = ({
  aiProviderId,
}: SettingsAiProvidersProviderModalProps) => {
  if (!aiProviderId) return null

  return (
    <Dialog open={false} onOpenChange={console.log}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>Edit models for provider</DialogTitle>
          <DialogDescription>
            At the moment Joia needs an OpenAI API key to work.
            <br />{' '}
          </DialogDescription>
          <FinalForm
            onSubmit={() => console.log('submit')}
            render={({ handleSubmit, submitting, hasValidationErrors }) => {
              return (
                <div className="py-4">
                  <div className="space-y-4">
                    <div>
                      <Field
                        name="name"
                        validate={composeValidators(stringOrNumberRequired)}
                        render={({ input }) => {
                          return (
                            <InputField
                              {...input}
                              placeholder="Pick a name to identify this provider"
                              label="Provider name"
                            />
                          )
                        }}
                      />
                    </div>
                    <div>
                      <Field
                        name="apiKey"
                        validate={composeValidators(stringOrNumberRequired)}
                        render={({ input }) => {
                          return (
                            <SelectField
                              {...input}
                              value={'openai_compatible'}
                              options={[
                                {
                                  label: 'Open AI compatible',
                                  value: 'openai_compatible',
                                },
                              ]}
                              placeholder="Pick a name to identify this provider"
                              label="Type"
                              disabled={true}
                            />
                          )
                        }}
                      />
                    </div>
                    <div>
                      <Button
                        type="submit"
                        // onClick={() => void handleSubmit()}
                        // disabled={hasValidationErrors || submitting}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              )
            }}
          />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
