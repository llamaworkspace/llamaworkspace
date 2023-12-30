import { SelectAiModelsFormField } from '@/components/ai/components/SelectAiModelsFormField'
import { Section, SectionBody, SectionHeader } from '@/components/ui/Section'
import { StyledLink } from '@/components/ui/StyledLink'
import { TextAreaField } from '@/components/ui/forms/TextAreaField'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { Field } from 'react-final-form'

export const PostConfigSettings = ({ disabled = false }) => {
  const { workspace } = useCurrentWorkspace()

  const profileUrl = `/w/${workspace?.id}/profile`

  const modelHelperText = (
    <>
      Update the default model{' '}
      <StyledLink href={profileUrl}>in your profile</StyledLink>.
    </>
  )
  return (
    <Section>
      <SectionHeader title="Settings" />
      <SectionBody>
        <div>
          <Field
            name="initial_message"
            render={({ input }) => {
              return (
                <>
                  <TextAreaField
                    label="Initial user message"
                    rows={4}
                    placeholder="Help users understand how to interact with this bot by providing some initial instructions."
                    helperText="This message will not be sent to ChatGPT. Use it exclusively to guide users on how to interact with this bot."
                    disabled={disabled}
                    {...input}
                  />
                </>
              )
            }}
          />
        </div>
        <div className="grid md:grid-cols-2">
          <Field
            name="model"
            render={({ input }) => {
              return (
                <SelectAiModelsFormField
                  {...input}
                  placeholder="Select a model"
                  label="AI model"
                  helperText={modelHelperText}
                  disabled={disabled}
                />
              )
            }}
          />
        </div>
      </SectionBody>
    </Section>
  )
}
