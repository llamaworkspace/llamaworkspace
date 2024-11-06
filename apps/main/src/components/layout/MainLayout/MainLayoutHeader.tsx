import { MainLayoutHeaderAsHidden } from './MainLayoutHeaderAsHidden'
import { MainLayoutHeaderForChatbot } from './MainLayoutHeaderForChatbot'
import { MainLayoutHeaderForStandaloneChat } from './MainLayoutHeaderForStandaloneChat'

export enum HeaderVariants {
  Chatbot,
  Chat,
  Hidden,
}

export function MainLayoutHeader({
  appId,
  chatId,
  variant = HeaderVariants.Chat,
}: {
  appId?: string
  chatId?: string
  variant: HeaderVariants
}) {
  return (
    <div key={`${appId}-${chatId}`}>
      {variant === HeaderVariants.Chatbot && (
        <MainLayoutHeaderForChatbot appId={appId} chatId={chatId} />
      )}

      {variant === HeaderVariants.Chat && (
        <MainLayoutHeaderForStandaloneChat chatId={chatId} />
      )}

      {variant === HeaderVariants.Hidden && (
        <MainLayoutHeaderAsHidden appId={appId} />
      )}
    </div>
  )
}
