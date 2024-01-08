import { StyledLink } from '@/components/ui/StyledLink'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InputField } from '@/components/ui/forms/InputField'
import { useSuccessToast } from '@/components/ui/toastHooks'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import {
  composeValidators,
  stringOrNumberRequired,
} from '@/lib/frontend/finalFormValidations'
import { useState } from 'react'
import { Field, Form as FinalForm } from 'react-final-form'
import { useAddOpenAiApiKeyForOnboarding } from '../globalHooks'

interface FormValues {
  apiKey: string
}

const AddOpenAiApiKeyModal = () => {
  const { workspace } = useCurrentWorkspace()

  const { mutate: addOpenAiKeyForOnboarding } =
    useAddOpenAiApiKeyForOnboarding()
  const [open, setOpen] = useState(true)
  const toast = useSuccessToast()
  const handleSubmit = (values: FormValues) => {
    if (!workspace?.id) return
    if (!values.apiKey) return
    addOpenAiKeyForOnboarding(
      {
        workspaceId: workspace.id,
        openAiApiKey: values.apiKey,
      },
      {
        onSuccess: () => {
          setOpen(false)
          toast(undefined, 'OpenAI API key successfully added')
        },
      },
    )
  }

  return (
    <FinalForm<FormValues>
      onSubmit={handleSubmit}
      render={({ handleSubmit, submitting, hasValidationErrors }) => {
        const handleOpenChange = () => {
          if (hasValidationErrors) {
            return
          }
          setOpen(!open)
        }

        return (
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent hideCloseButton={true}>
              <DialogHeader>
                <DialogTitle>Add an OpenAI API key</DialogTitle>
                <DialogDescription>
                  At the moment Joia needs an OpenAI API key to work.
                  <br />{' '}
                  <StyledLink
                    href="https://joiahq.notion.site/How-to-obtain-an-OpenAI-access-token-f29f71ba136145c9b84a43911c7d8709"
                    target="_blank"
                  >
                    Learn how to get one.
                  </StyledLink>
                </DialogDescription>
                <div className="py-4">
                  <div className="space-y-4">
                    <div>
                      <Field
                        name="apiKey"
                        validate={composeValidators(stringOrNumberRequired)}
                        render={({ input }) => {
                          return (
                            <InputField
                              {...input}
                              placeholder="Your OpenAI API key"
                              label="API key"
                            />
                          )
                        }}
                      />
                    </div>
                    <div>
                      <Button
                        type="submit"
                        onClick={() => void handleSubmit()}
                        disabled={hasValidationErrors || submitting}
                      >
                        Add key
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )
      }}
    />
  )
}

export const AddOpenAiApiKeyTakeover = () => {
  const { workspace } = useCurrentWorkspace()

  if (!workspace) return null
  if (workspace.isOnboardingCompleted) return null
  return <AddOpenAiApiKeyModal />
}
