export interface DefaultInputProps {
  label?: string
  placeholder?: string
  helperText?: string | JSX.Element
  onValueChange?: (value: string) => void
}
