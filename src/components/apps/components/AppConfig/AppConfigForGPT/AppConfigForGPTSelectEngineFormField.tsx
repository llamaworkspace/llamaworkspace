import { AppGptEngine } from '@/components/apps/appsTypes'
import {
  SelectField,
  type SelectFieldProps,
} from '@/components/ui/forms/SelectField'

const options = [
  { value: AppGptEngine.OpenaiAssistant, label: 'OpenAI' },
  { value: AppGptEngine.Basic, label: 'Basic' },
]

export const AppConfigForGPTSelectEngineFormField = ({
  ...selectProps
}: Omit<SelectFieldProps, 'options'>) => {
  return <SelectField {...selectProps} options={options} />
}
