import { InputField } from '@/components/ui/forms/InputField'
import { stringRequired } from '@/lib/frontend/finalFormValidations'
import { Field } from 'react-final-form'

interface AppConfigForExternalAppSettingsProps {
  appId?: string
  disabled?: boolean
}

export const AppConfigForExternalAppSettings = ({
  disabled = false,
}: AppConfigForExternalAppSettingsProps) => {
  return (
    <div className="space-y-4">
      <Field
        name="targetUrl"
        validate={stringRequired}
        render={({ input, meta }) => {
          return (
            <>
              <InputField
                meta={meta}
                label="Chat app URL"
                placeholder="https://mycompany.com/chatapp"
                disabled={disabled}
                helperText="The destination URL that will be called when a user requests an interaction. See docs for implementation details."
                {...input}
              />
            </>
          )
        }}
      />
      <Field
        name="accessKey"
        validate={stringRequired}
        render={({ input, meta }) => {
          return (
            <>
              <InputField
                meta={meta}
                label="Access Key"
                placeholder="https://mycompany.com/chatapp"
                disabled={disabled}
                helperText="The destination URL that will be called when a user requests an interaction. See docs for implementation details."
                {...input}
              />
            </>
          )
        }}
      />
    </div>
  )
}
