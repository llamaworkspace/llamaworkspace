import { mergeRefs } from '@/lib/utils'
import { forwardRef, useRef } from 'react'
import { Button } from './button'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  buttonText: string
}

const FileUploadInput = forwardRef<HTMLInputElement, InputProps>(
  ({ buttonText, ...props }, ref) => {
    const internalRef = useRef<HTMLInputElement>(null)

    return (
      <span className="relative inline-block overflow-hidden">
        <Button>{buttonText}</Button>
        <input
          className="absolute inset-0 cursor-pointer opacity-0"
          ref={mergeRefs([internalRef, ref])}
          {...props}
          type="file"
        />
      </span>
    )
  },
)
FileUploadInput.displayName = 'Input'

export { FileUploadInput }
