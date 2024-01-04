import type { CheckedState } from '@radix-ui/react-checkbox'
import { forwardRef } from 'react'
import { Checkbox } from '../checkbox'
import type { DefaultInputProps } from './formTypes'

type InputProps = Pick<DefaultInputProps, 'label'> & {
  onCheckedChange?: (value: boolean) => void
}

export const CheckboxField = forwardRef<HTMLButtonElement, InputProps>(
  function CheckboxFieldFunc({ label, onCheckedChange }, externalRef) {
    const handleChange = (checkState: CheckedState) => {
      if (typeof checkState === 'boolean') {
        if (onCheckedChange) {
          onCheckedChange(!!checkState)
        }
      }
    }

    return (
      <div className="flex items-center space-x-2">
        <Checkbox ref={externalRef} onCheckedChange={handleChange} />
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
      </div>
    )
  },
)
