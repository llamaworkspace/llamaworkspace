import { AppGptType } from '@/components/posts/postsTypes'
import {
  SelectField,
  type SelectFieldProps,
} from '@/components/ui/forms/SelectField'

const options = [
  { value: AppGptType.OpenaiAssistant, label: 'OpenAI' },
  { value: AppGptType.Basic, label: 'Basic' },
]

export const PostConfigForGPTSelectEngineFormField = ({
  ...selectProps
}: Omit<SelectFieldProps, 'options'>) => {
  return <SelectField {...selectProps} options={options} />
}
