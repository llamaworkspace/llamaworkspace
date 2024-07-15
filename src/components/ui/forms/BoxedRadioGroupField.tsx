import { forwardRef } from 'react'
import { BoxedRadioGroup } from '../boxed-radio-group'
import { FormFieldWrapper } from './FormFieldWrapper'
import type {
  DefaultFormInputProps,
  OtherDefaultFormInputProps,
} from './formTypes'

type BoxedRadioGroupFieldProps = DefaultFormInputProps

export const BoxedRadioGroupField = forwardRef<
  HTMLInputElement,
  OtherDefaultFormInputProps
>(function BoxedRadioGroupFieldFunc(
  { label, helperText, onValueChange, required, meta, ...input },
  externalRef,
) {
  const error = meta && meta.submitFailed ? (meta.error as string) : undefined

  const handleChange = (value: string) => {
    if (onValueChange) {
      onValueChange(value)
    }
    input.onChange?.(value)
  }

  return (
    <FormFieldWrapper
      label={label}
      helperText={helperText}
      required={required}
      error={error}
    >
      <BoxedRadioGroup
        ref={externalRef}
        options={DELETEME}
        onValueChange={handleChange}
      />
    </FormFieldWrapper>
  )
})

const DELETEME = [
  {
    value: 'simple',
    title: 'Simple assistant',
    description:
      'An instructions-based assistant for repeatable use cases. Compatible with any Large Language model.',
  },
  {
    value: 'openai-assistant',
    title: 'Document-enhanced assistant',
    description:
      'A document-augmented assistant that queries provided documents to deliver contextually relevant responses. Currently it is only compatible with OpenAI.',
  },
  // {
  //   value: 'external',
  //   title: 'Your own external assistant',
  //   description:
  //     'Build your own assistant with custom logic and integrate it here for easy access.',
  // },
]
