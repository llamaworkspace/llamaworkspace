import { forwardRef } from 'react'
import { Input, type InputProps } from '../input'
import { FormFieldWrapper } from './FormFieldWrapper'
import type { DefaultFormInputProps } from './formTypes'

type InputFieldProps = DefaultFormInputProps & InputProps

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  function InputFieldFunc(
    {
      label,
      placeholder,
      helperText,
      onValueChange,
      required,
      error,
      ...input
    },
    externalRef,
  ) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target
      input.onChange?.(e)

      if (onValueChange) {
        onValueChange(value)
      }
    }

    return (
      <FormFieldWrapper
        label={label}
        helperText={helperText}
        required={required}
        error={error}
      >
        <Input
          ref={externalRef}
          {...input}
          onChange={handleChange}
          placeholder={placeholder}
          colorScheme={error ? 'danger' : 'default'}
        />
      </FormFieldWrapper>
    )
  },
)
