export interface DefaultInputProps {
  label?: string
  placeholder?: string
  helperText?: string | JSX.Element
  isRequired?: boolean
  onValueChange?: (value: string) => void
}
