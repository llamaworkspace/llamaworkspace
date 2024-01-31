import { Skeleton } from '@/components/ui/skeleton'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { CreateSharedChat } from './CreateSharedChat'
import { CreateStandaloneChat } from './CreateStandaloneChat'
import { CreateNewChatProps } from './createNewChatTypes'

export const CreateNewChat = ({ loading, ...props }: CreateNewChatProps) => {
  const { query } = useNavigation()
  const postId = query.post_id
  const isStandalone = !!postId

  if (loading) return <Skeleton className="h-6 w-24" />

  if (isStandalone) return <CreateStandaloneChat {...props} />

  return <CreateSharedChat {...props} />
}
