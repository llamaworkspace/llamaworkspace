import { InputField } from '@/components/ui/forms/InputField'
import { TextAreaField } from '@/components/ui/forms/TextAreaField'
import { JoiaIcon24 } from '@/components/ui/icons/JoiaIcon'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import EmojiPicker, { Emoji, EmojiClickData } from 'emoji-picker-react'
import { useState } from 'react'
import { Field } from 'react-final-form'

export const PostConfigForGPTNameAndDescription = ({
  disabled = false,
}: {
  disabled: boolean
}) => {
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

          return (
            <Popover open={isEmojiEditable} onOpenChange={setIsEmojiEditable}>
              <div>
                <PopoverTrigger asChild>
                  <div className="cursor-pointer">
                    {currentValue ? (
                      <Emoji unified={currentValue} size={54} />
                    ) : (
                      <JoiaIcon24 className="h-12 w-12 text-zinc-300" />
                    )}
                  </div>
                </PopoverTrigger>

                <PopoverContent align="start" className="w-[332px] p-0">
                  <EmojiPicker
                    width={330}
                    previewConfig={{ showPreview: false }}
                    onEmojiClick={handleEmojiChange}
                  />
                </PopoverContent>
              </div>
            </Popover>
          )
        }}
      />
      <Field
        name="title"
        render={({ input }) => {
          return (
            <>
              <InputField
                label="Name"
                placeholder="Give it a name to help you identify this bot."
                disabled={disabled}
                {...input}
              />
            </>
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
