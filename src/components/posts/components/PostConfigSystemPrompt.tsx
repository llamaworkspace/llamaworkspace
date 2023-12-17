import { Section, SectionBody, SectionHeader } from '@/components/ui/Section'
import { TextAreaField } from '@/components/ui/forms/TextAreaField'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { useEffect, useRef } from 'react'
import { Field } from 'react-final-form'

const placeholderMessage = `Write a message to help the AI understand what you are trying to achieve. The more details and context you provide, the better will be ChatGPT's outcome.

For example:
Act as a public speaker and write compelling speeches that can be used to inspire people to take action.
`

export const PostConfigSystemPrompt = ({ disabled = false }) => {
  const navigation = useNavigation()
  const ref = useRef<HTMLTextAreaElement>(null)

  const focusQueryStringEl = navigation.query?.focus

  useEffect(() => {
    if (ref.current && focusQueryStringEl === 'system_message' && !disabled) {
      ref.current.focus()
    }
  }, [focusQueryStringEl, disabled])

  return (
    <Section>
      <SectionHeader
        title="Instructions"
        description={`Define what this chatbot should do by providing concise instructions to the AI. Your instructions will be passed to the AI as a system message.`}
      />
      <SectionBody>
        <div>
          <Field
            name="system_message"
            render={({ input }) => {
              return (
                <>
                  <TextAreaField
                    ref={ref}
                    label="Instructions"
                    rows={10}
                    placeholder={placeholderMessage}
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
