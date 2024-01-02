import { cn } from '@/lib/utils'
import { MainLayoutHeaderAsHidden } from './MainLayoutHeaderAsHidden'
import { MainLayoutHeaderForChatbot } from './MainLayoutHeaderForChatbot'
import { MainLayoutHeaderForStandaloneChat } from './MainLayoutHeaderForStandaloneChat'

export enum HeaderVariants {
  Chat,
  Chatbot,
  Hidden,
}

export function MainLayoutHeader({
  postId,
  chatId,
  variant = HeaderVariants.Chat,
}: {
  postId?: string
  chatId?: string
  variant: HeaderVariants
}) {
  return (
    <header
      className={cn(
        'flex h-12 max-h-12 flex-row items-center justify-between border-zinc-200/50 py-2.5 lg:px-0',
        variant !== HeaderVariants.Hidden && 'border-b',
      )}
    >
      {variant === HeaderVariants.Chatbot && (
        <MainLayoutHeaderForChatbot postId={postId} />
      )}

      {variant === HeaderVariants.Chat && (
        <MainLayoutHeaderForStandaloneChat chatId={chatId} />
      )}

      {variant === HeaderVariants.Hidden && (
        <MainLayoutHeaderAsHidden postId={postId} />
      )}
    </header>
  )
}
