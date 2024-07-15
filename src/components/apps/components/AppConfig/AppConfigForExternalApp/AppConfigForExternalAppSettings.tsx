import { InputField } from '@/components/ui/forms/InputField'
import {
  composeValidators,
  minLength,
  stringRequired,
  url,
} from '@/lib/frontend/finalFormValidations'
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
        validate={composeValidators(stringRequired, url)}
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
        validate={composeValidators(stringRequired, minLength(32))}
        render={({ input, meta }) => {
          return (
            <>
              <InputField
                meta={meta}
                label="Access Key"
                placeholder="A set of random characters, eg: sadfokanpoccxhjwq"
                contentEditable={false}
                helperText="An unique code that will be sent along with the request to your servers, so that you can verify is legitimacy."
                {...input}
              />
            </>
          )
        }}
      />
    </div>
  )
}
