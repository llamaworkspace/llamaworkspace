import {
  SelectField,
  type SelectFieldProps,
} from '@/components/ui/forms/SelectField'

const options = [
  { value: 'openai_assistants', label: 'OpenAI' },
  { value: 'basic', label: 'Basic' },
]

export const PostConfigForGPTSelectEngineFormField = ({
  ...selectProps
}: Omit<SelectFieldProps, 'options'>) => {
  return <SelectField {...selectProps} options={options} />
}
