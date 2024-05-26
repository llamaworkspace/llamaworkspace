import { cn } from 'lib/utils'
import type { PropsWithChildren } from 'react'
import { Badge } from '../badge'
import type { DefaultFormInputProps } from './formTypes'

// Todo: use shadcn form instead of this component
export const FormFieldWrapper = ({
  label,
  helperText,
  required,
  error,
  children,
}: Omit<DefaultFormInputProps, 'name'> & PropsWithChildren) => {
  return (
    <FormControl>
      {label && (
        <FormLabel isError={!!error} isRequired={required}>
          {label}
        </FormLabel>
      )}
      {children}
      {
        <FormHelperText isError={!!error}>
          {error ? error : helperText}
        </FormHelperText>
      }
    </FormControl>
  )
}

const FormControl = ({ children }: PropsWithChildren) => {
  return <div className="space-y-1">{children}</div>
}

interface FormLabelProps extends PropsWithChildren {
  isRequired?: boolean
  isError?: boolean
}

export const FormLabel = ({
  children,
  isRequired,
  isError = false,
}: FormLabelProps) => {
  return (
    <label
      className={cn(
        `flex items-center text-sm font-semibold`,
        isError && 'text-red-600',
      )}
    >
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

interface FormHelperTextProps extends PropsWithChildren {
  isError?: boolean
}

const FormHelperText = ({ isError, children }: FormHelperTextProps) => {
  return (
    <p
      className={cn(
        'text-sm',
        !isError && 'text-zinc-500',
        isError && 'text-red-600',
      )}
    >
      {children}
    </p>
  )
}
