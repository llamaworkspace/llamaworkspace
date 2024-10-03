import { Emoji } from 'emoji-picker-react'
import { LegacyJoiaIcon24 } from './LegacyJoiaIcon'

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
    <LegacyJoiaIcon24 className={fallbackClassName} />
  )
}
