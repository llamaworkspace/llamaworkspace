import type { FieldMetaState } from 'react-final-form'

export interface DefaultFormInputProps {
  label?: string
  placeholder?: string
  helperText?: string | JSX.Element
  required?: boolean
  error?: string
  meta?: FieldMetaState<unknown>
  onValueChange?: (value: string) => void
}
