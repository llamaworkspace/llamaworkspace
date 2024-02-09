import type { PropsWithChildren } from 'react'
import { Badge } from '../badge'
import type { DefaultFormInputProps } from './formTypes'

// Todo: use shadcn form instead of this component
export const FormFieldWrapper = ({
  label,
  helperText,
  required: isRequired,
  children,
}: Omit<DefaultFormInputProps, 'name'> & PropsWithChildren) => {
  return (
    <FormControl>
      {label && <FormLabel isRequired={isRequired}>{label}</FormLabel>}
      {children}
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}

const FormControl = ({ children }: PropsWithChildren) => {
  return <div className="space-y-1">{children}</div>
}

const FormLabel = ({
  children,
  isRequired,
}: { isRequired?: boolean } & PropsWithChildren) => {
  return (
    <label className={`block text-sm font-semibold text-zinc-800`}>
      {children}
      {isRequired && (
        <Badge
          variant="secondary"
          size="xs"
          className="ml-1 px-1 py-0 text-[11px]"
        >
          Required
        </Badge>
      )}
    </label>
  )
}

const FormHelperText = ({ children }: PropsWithChildren) => {
  return <p className="text-xs text-zinc-500">{children}</p>
}
