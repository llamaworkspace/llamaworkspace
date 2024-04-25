import { useCreateChat } from '@/components/chats/chatHooks'
import { EMPTY_POST_NAME } from '@/components/posts/postsConstants'
import { EmojiWithFallback } from '@/components/ui/icons/EmojiWithFallback'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { SidebarMainItemShell } from './SidebarMainItemShell'

interface AppItemProps {
  postId: string
  title: string | null
  emoji: string | null
}

export const SidebarMainAppItem = ({ postId, title, emoji }: AppItemProps) => {
  const navigation = useNavigation()
  const { mutate: createChat } = useCreateChat()
  const isActive = navigation.query.post_id === postId

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
      onClick={() => createChat({ postId })}
    />
  )
}
