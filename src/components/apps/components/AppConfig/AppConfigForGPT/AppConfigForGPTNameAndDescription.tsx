import { FormLabel } from '@/components/ui/forms/FormFieldWrapper'
import { InputField } from '@/components/ui/forms/InputField'
import { TextAreaField } from '@/components/ui/forms/TextAreaField'
import { LegacyJoiaIcon24 } from '@/components/ui/icons/LegacyJoiaIcon'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { stringOrNumberRequired } from '@/lib/frontend/finalFormValidations'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { cn } from '@/lib/utils'
import EmojiPicker, { Emoji, type EmojiClickData } from 'emoji-picker-react'
import { useEffect, useRef, useState } from 'react'
import { Field } from 'react-final-form'

export const AppConfigForGPTNameAndDescription = ({
  disabled = false,
}: {
  disabled: boolean
}) => {
  const navigation = useNavigation()

  const titleRef = useRef<HTMLInputElement>(null)
  const focusQueryStringEl = navigation.query?.focus
  useEffect(() => {
    if (titleRef.current && focusQueryStringEl === 'title' && !disabled) {
      titleRef.current.focus()
    }
  }, [focusQueryStringEl, disabled])

  const [isEmojiEditable, setIsEmojiEditable] = useState(false)

  return (
    <>
      <Field<string>
        name="emoji"
        render={({ input }) => {
          const currentValue = input.value

          const handleEmojiChange = (emoji: EmojiClickData) => {
            input.onChange(emoji.unified)
          }

          const emojiElement = (
            <div>
              <FormLabel>Icon</FormLabel>
              <div
                className={cn(
                  'mt-2 w-14 max-w-14',
                  disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                )}
              >
                {currentValue ? (
                  <Emoji unified={currentValue} size={54} />
                ) : (
                  <LegacyJoiaIcon24 className="h-12 w-12 text-zinc-300" />
                )}
              </div>
            </div>
          )

          if (disabled) {
            return emojiElement
          }

          return (
            <Popover open={isEmojiEditable} onOpenChange={setIsEmojiEditable}>
              <PopoverTrigger asChild>{emojiElement}</PopoverTrigger>

              <PopoverContent align="start" className="w-[332px] p-0">
                <EmojiPicker
                  width={330}
                  previewConfig={{ showPreview: false }}
                  onEmojiClick={handleEmojiChange}
                />
              </PopoverContent>
            </Popover>
          )
        }}
      />
      <Field
        name="title"
        validate={stringOrNumberRequired}
        render={({ input, meta }) => {
          return (
            <InputField
              ref={titleRef}
              meta={meta}
              label="Name"
              placeholder="Give it a name to help you identify this bot."
              disabled={disabled}
              {...input}
            />
          )
        }}
      />
      <Field
        name="description"
        render={({ input }) => {
          return (
            <>
              <TextAreaField
                label="Description"
                rows={4}
                placeholder="Describe what this GPT does and help users understand how to interact with it."
                helperText="This text will not be used to guide the behaviour of the GPT."
                disabled={disabled}
                {...input}
              />
            </>
          )
        }}
      />
    </>
  )
}
