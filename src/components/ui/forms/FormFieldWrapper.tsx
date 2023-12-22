import type { PropsWithChildren } from 'react'
import type { DefaultInputProps } from './formTypes'

// Todo: use shadcn form instead of this component
export const FormFieldWrapper = ({
  label,
  helperText,
  children,
}: Omit<DefaultInputProps, 'name'> & PropsWithChildren) => {
  return (
    <FormControl>
      {label && <FormLabel>{label}</FormLabel>}
      {children}
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}

const FormControl = ({ children }: PropsWithChildren) => {
  return <div className="space-y-1">{children}</div>
}

const FormLabel = ({ children }: PropsWithChildren) => {
  return (
    <label className={`block text-sm font-semibold text-zinc-800`}>
      {children}
    </label>
  )
}

const FormHelperText = ({ children }: PropsWithChildren) => {
  return <p className="text-xs text-zinc-500">{children}</p>
}
