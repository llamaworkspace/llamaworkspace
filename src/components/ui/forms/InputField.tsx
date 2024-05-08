import { forwardRef } from 'react'
import type { FieldMetaState } from 'react-final-form'
import { Input, type InputProps } from '../input'
import { FormFieldWrapper } from './FormFieldWrapper'
import type { DefaultFormInputProps } from './formTypes'

type BaseInputFieldProps = DefaultFormInputProps & InputProps

interface InputFieldProps extends BaseInputFieldProps {
  meta?: FieldMetaState<unknown>
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  function InputFieldFunc(
    { label, placeholder, helperText, onValueChange, required, meta, ...input },
    externalRef,
  ) {
    const error = meta && meta.submitFailed ? (meta.error as string) : undefined

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
