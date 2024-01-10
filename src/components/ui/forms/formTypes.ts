export interface DefaultInputProps {
  label?: string | JSX.Element
  placeholder?: string
  helperText?: string | JSX.Element
  required?: boolean
  onValueChange?: (value: string) => void
}
