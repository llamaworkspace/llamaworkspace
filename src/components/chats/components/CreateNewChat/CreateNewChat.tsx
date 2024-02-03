import { Skeleton } from '@/components/ui/skeleton'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { CreatePrivateChat } from './CreatePrivateChat'
import { CreateSharedChat } from './CreateSharedChat'
import { CreateNewChatProps } from './createNewChatTypes'

export const CreateNewChat = ({ loading, ...props }: CreateNewChatProps) => {
  const { query } = useNavigation()
  const postId = query.post_id
  const isShared = !!postId

  if (loading) return <Skeleton className="h-6 w-24" />

  if (isShared) return <CreateSharedChat {...props} />

  return <CreatePrivateChat {...props} />
}
