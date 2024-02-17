import { MainLayoutHeaderAsHidden } from './MainLayoutHeaderAsHidden'
import { MainLayoutHeaderForChatbot } from './MainLayoutHeaderForChatbot'
import { MainLayoutHeaderForStandaloneChat } from './MainLayoutHeaderForStandaloneChat'

export enum HeaderVariants {
  Chatbot,
  Chat,
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
    <div key={`${postId}-${chatId}`}>
      {variant === HeaderVariants.Chatbot && (
        <MainLayoutHeaderForChatbot postId={postId} />
      )}

      {variant === HeaderVariants.Chat && (
        <MainLayoutHeaderForStandaloneChat chatId={chatId} />
      )}

      {variant === HeaderVariants.Hidden && (
        <MainLayoutHeaderAsHidden postId={postId} />
      )}
    </div>
  )
}
