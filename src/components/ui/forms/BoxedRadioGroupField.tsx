import {
  BoxedRadioGroup,
  type BoxedRadioGroupOption,
} from '../boxed-radio-group'
import { FormFieldWrapper } from './FormFieldWrapper'
import type { DefaultFormInputProps } from './formTypes'

export interface BoxedRadioGroupFieldProps extends DefaultFormInputProps {
  options: BoxedRadioGroupOption[]
  onChange: (value: string) => void
}

export const BoxedRadioGroupField = ({
  label,
  helperText,
  onValueChange,
  required,
  meta,
  options,
  ...input
}: BoxedRadioGroupFieldProps) => {
  const error = meta && meta.submitFailed ? (meta.error as string) : undefined

  const handleChange = (value: string) => {
    input.onChange?.(value)
    onValueChange?.(value)
  }

  return (
    <FormFieldWrapper
      label={label}
      helperText={helperText}
      required={required}
      error={error}
    >
      <BoxedRadioGroup options={options} onValueChange={handleChange} />
    </FormFieldWrapper>
  )
}
