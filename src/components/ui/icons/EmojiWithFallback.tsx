import { Emoji } from 'emoji-picker-react'
import { JoiaIcon24 } from './JoiaIcon'

type EmojiProps = Parameters<typeof Emoji>[0]

interface EmojiType extends Omit<EmojiProps, 'unified'> {
  unified?: string | null
  fallbackClassName?: string
}

export const EmojiWithFallback = ({
  unified,
  fallbackClassName,
  ...props
}: EmojiType) => {
  return unified ? (
    <Emoji unified={unified} {...props} />
  ) : (
    <JoiaIcon24 className={fallbackClassName} />
  )
}
