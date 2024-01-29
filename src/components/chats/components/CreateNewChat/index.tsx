import { Skeleton } from '@/components/ui/skeleton'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { FC } from 'react'
import { CreateChat } from './CreateChat'
import { CreateStandaloneChat } from './CreateStandaloneChat'
import { CreateNewChatProps } from './types'

export const CreateNewChat: FC<CreateNewChatProps> = ({
  loading,
  ...props
}) => {
  const { query } = useNavigation()
  const postId = query.post_id
  const isStandalone = !!postId

  if (loading) return <Skeleton className="h-6 w-24" />

  if (isStandalone) return <CreateStandaloneChat {...props} />

  return <CreateChat {...props} />
}
