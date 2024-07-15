import { InputField } from '@/components/ui/forms/InputField'
import { stringRequired } from '@/lib/frontend/finalFormValidations'
import { Field } from 'react-final-form'

interface AppConfigForExternalAppSettingsProps {
  appId?: string
  disabled?: boolean
}

export const AppConfigForExternalAppSettings = ({
  appId,
  disabled = false,
}: AppConfigForExternalAppSettingsProps) => {
  return (
    <>
      <Field
        name="externalUrl"
        validate={stringRequired}
        render={({ input, meta }) => {
          return (
            <>
              <InputField
                meta={meta}
                label="External URL"
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
