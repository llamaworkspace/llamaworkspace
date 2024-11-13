import type { FieldInputProps, FieldMetaState } from 'react-final-form'

export interface DefaultFormInputProps {
  label?: string
  placeholder?: string
  helperText?: string | JSX.Element
  required?: boolean
  error?: string
  meta?: FieldMetaState<unknown>
  onValueChange?: (value: string) => void
}

export type OtherDefaultFormInputProps = FieldInputProps<unknown> & {
  label?: string
  placeholder?: string
  helperText?: string | JSX.Element
  required?: boolean
  error?: string
  meta?: FieldMetaState<unknown>
  onValueChange?: (value: string) => void
}
