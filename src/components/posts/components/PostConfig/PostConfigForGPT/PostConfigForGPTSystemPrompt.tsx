import { Section, SectionBody } from '@/components/ui/Section'
import { InputField } from '@/components/ui/forms/InputField'
import { TextAreaField } from '@/components/ui/forms/TextAreaField'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { Emoji } from 'emoji-picker-react'
import { useEffect, useRef } from 'react'
import { Field } from 'react-final-form'

const placeholderMessage = `Write a message to help the AI understand what you are trying to achieve. The more details and context you provide, the better will be ChatGPT's outcome.

For example:
Act as a public speaker and write compelling speeches that can be used to inspire people to take action.
`

export const PostConfigForGPTSystemPrompt = ({ disabled = false }) => {
  const navigation = useNavigation()
  const ref = useRef<HTMLTextAreaElement>(null)

  const focusQueryStringEl = navigation.query?.focus

  useEffect(() => {
    if (ref.current && focusQueryStringEl === 'systemMessage' && !disabled) {
      ref.current.focus()
    }
  }, [focusQueryStringEl, disabled])

  return (
    <Section>
      <SectionBody>
        <div className="space-y-6">
          <div>
            <Emoji unified={'1f920'} size={54} />
          </div>
          <Field
            name="name"
            render={({ input }) => {
              return (
                <>
                  <InputField
                    label="Name"
                    placeholder="Give it a name to help you identify this bot."
                    disabled={disabled}
                    {...input}
                  />
                </>
              )
            }}
          />
          <Field
            name="Description"
            render={({ input }) => {
              return (
                <>
                  <TextAreaField
                    label="Description"
                    rows={4}
                    placeholder="Describe what this GPT does and help users understand how to interact with it."
                    helperText="This text will not be used to guide the behaviour of the GPT."
                    disabled={disabled}
                    {...input}
                  />
                </>
              )
            }}
          />
        </div>
      </SectionBody>
    </Section>
  )
}
