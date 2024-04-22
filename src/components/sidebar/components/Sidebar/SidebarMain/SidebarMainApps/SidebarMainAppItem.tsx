import { useCreateSharedChat } from '@/components/chats/chatHooks'
import { EMPTY_POST_NAME } from '@/components/posts/postsConstants'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { Emoji } from 'emoji-picker-react'
import { SidebarMainItemShell } from './SidebarMainItemShell'

interface AppItemProps {
  postId: string
  title: string | null
}

export const SidebarMainAppItem = ({ postId, title }: AppItemProps) => {
  const navigation = useNavigation()
  const { mutate: createChat } = useCreateSharedChat()
  const isActive = navigation.query.post_id === postId

  return (
    <SidebarMainItemShell
      title={title ?? EMPTY_POST_NAME}
      isActive={isActive}
      icon={
        <Emoji unified={Math.random() > 0.5 ? '2728' : '1f984'} size={24} />
      }
      onClick={() => createChat({ postId })}
    />
  )
}
