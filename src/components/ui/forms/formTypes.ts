export interface DefaultFormInputProps {
  label?: string
  placeholder?: string
  helperText?: string | JSX.Element
  required?: boolean
  onValueChange?: (value: string) => void
}
