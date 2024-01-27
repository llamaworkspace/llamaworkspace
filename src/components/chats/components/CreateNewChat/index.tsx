import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/router'
import { FC } from 'react'
import { CreateChat } from './CreateChat'
import { CreateStandaloneChat } from './CreateStandaloneChat'
import { CreateNewChatProps } from './types'

export const CreateNewChat: FC<CreateNewChatProps> = ({
  loading,
  ...props
}) => {
  const router = useRouter()
  const isStandalone = router.pathname.split('/').length > 2

  if (loading) return <Skeleton className="h-6 w-24" />

  if (isStandalone) return <CreateStandaloneChat {...props} />

  return <CreateChat {...props} />
}
