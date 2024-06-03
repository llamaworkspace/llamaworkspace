import { EMPTY_POST_NAME } from '@/components/apps/appsConstants'
import { useCreateChatForApp } from '@/components/chats/chatHooks'
import { EmojiWithFallback } from '@/components/ui/icons/EmojiWithFallback'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { SidebarMainItemShell } from './SidebarMainItemShell'

interface AppItemProps {
  appId: string
  title: string | null
  emoji: string | null
}

export const SidebarMainAppItem = ({ appId, title, emoji }: AppItemProps) => {
  const navigation = useNavigation()
  const { mutate: createChat } = useCreateChatForApp()
  const isActive = navigation.query.app_id === appId

  return (
    <SidebarMainItemShell
      title={title ?? EMPTY_POST_NAME}
      isActive={isActive}
      icon={
        <EmojiWithFallback
          unified={emoji}
          size={24}
          fallbackClassName="h-6 w-6 text-zinc-400"
        />
      }
      onClick={() => createChat({ appId })}
    />
  )
}
