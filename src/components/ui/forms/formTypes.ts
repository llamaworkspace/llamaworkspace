export interface DefaultFormInputProps {
  label?: string
  placeholder?: string
  helperText?: string | JSX.Element
  required?: boolean
  error?: string
  onValueChange?: (value: string) => void
}
