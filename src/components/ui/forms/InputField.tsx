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
      required: isRequired,
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
        required={isRequired}
      >
        <Input
          ref={externalRef}
          {...input}
          onChange={handleChange}
          placeholder={placeholder}
        />
      </FormFieldWrapper>
    )
  },
)
