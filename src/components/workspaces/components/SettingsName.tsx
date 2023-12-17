import { Section, SectionBody, SectionHeader } from '@/components/ui/Section'
import { InputField } from '@/components/ui/forms/InputField'
import { useSuccessToast } from '@/components/ui/toastHooks'
import { validateFormWithZod } from '@/lib/frontend/finalFormValidations'
import { Field, Form as FinalForm } from 'react-final-form'
import { z } from 'zod'
import { useCurrentWorkspace, useUpdateWorkspace } from '../workspacesHooks'

const zodSettingsNameFormValues = z.object({
  name: z.string(),
})
type SettingsNameFormValues = z.infer<typeof zodSettingsNameFormValues>

export const SettingsName = () => {
  const { mutate: updateWorkspace } = useUpdateWorkspace()
  const successToast = useSuccessToast()
  const { workspace } = useCurrentWorkspace()

  return (
    <Section>
      <SectionHeader title="General" />
      <SectionBody>
        <FinalForm<SettingsNameFormValues>
          onSubmit={(values) => {
            if (!workspace) return
            if (values.name === workspace.name) return
            updateWorkspace(
              { workspaceId: workspace.id, ...values },
              {
                onSuccess: () => {
                  successToast(undefined, 'Workspace name updated')
                },
              },
            )
          }}
          initialValues={{
            name: workspace?.name ?? '',
          }}
          validate={validateFormWithZod(zodSettingsNameFormValues)}
          render={({ handleSubmit }) => {
            const handleKeyDown = (event: React.KeyboardEvent) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                void handleSubmit()
              }
            }

            return (
              <div className="space-y-2">
                <div className="grid grid-cols-3">
                  <Field
                    name="name"
                    render={({ input }) => {
                      return (
                        <InputField
                          label="Workspace name"
                          placeholder="Pick a name for this workspace"
                          onBlurCapture={() => void handleSubmit()}
                          onKeyDown={handleKeyDown}
                          {...input}
                        />
                      )
                    }}
                  />
                </div>
              </div>
            )
          }}
        />
      </SectionBody>
    </Section>
  )
}
