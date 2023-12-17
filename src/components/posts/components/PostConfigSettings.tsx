import { Section, SectionBody, SectionHeader } from '@/components/ui/Section'
import { StyledLink } from '@/components/ui/StyledLink'
import { SelectField } from '@/components/ui/forms/SelectField'
import { TextAreaField } from '@/components/ui/forms/TextAreaField'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { OpenAiModelEnum, OpenaiModelToHuman } from '@/shared/aiTypesAndMappers'
import { Field } from 'react-final-form'

const MODEL_OPTIONS = [
  {
    value: OpenAiModelEnum.GPT3_5_TURBO,
    label: OpenaiModelToHuman[OpenAiModelEnum.GPT3_5_TURBO],
  },
  {
    value: OpenAiModelEnum.GPT4,
    label: OpenaiModelToHuman[OpenAiModelEnum.GPT4],
  },
]

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
        <div className="grid md:grid-cols-3">
          <Field
            name="model"
            render={({ input }) => {
              return (
                <SelectField
                  {...input}
                  options={MODEL_OPTIONS}
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
