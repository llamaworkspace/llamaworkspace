import { InputField } from '@/components/ui/forms/InputField'
import { TextAreaField } from '@/components/ui/forms/TextAreaField'
import { Emoji } from 'emoji-picker-react'
import { Field } from 'react-final-form'

export const PostConfigForGPTNameAndDescription = ({ disabled = false }) => {
  return (
    <>
      <div>
        <Emoji unified={'1f920'} size={54} />
      </div>
      <Field
        name="title"
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
        name="initialMessage"
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
    </>
  )
}
