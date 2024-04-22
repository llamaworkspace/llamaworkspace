import { EMPTY_POST_NAME } from '@/components/posts/postsConstants'
import { usePostsForSidebar } from '@/components/sidebar/sidebarHooks'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { cn } from '@/lib/utils'
import { Square3Stack3DIcon } from '@heroicons/react/24/outline'
import { Emoji } from 'emoji-picker-react'

import { useCallback } from 'react'

const useCreateAppInstance = () => {
  const navigation = useNavigation()

  return useCallback(
    async (postId: string) => {
      await navigation.push(`/p/:postId/c/new`, {
        postId,
      })
    },
    [navigation],
  )
}

interface AppItemProps {
  postId: string
  title: string | null
  highlighted?: boolean
}

const AppItem = ({ postId, title, highlighted }: AppItemProps) => {
  const createAppInstance = useCreateAppInstance()

  return (
    <div
      className={cn(
        'flex w-full cursor-pointer items-center gap-2 rounded  px-2 py-2 text-[14px] font-bold text-zinc-950 transition hover:bg-zinc-200/80',
        highlighted && 'bg-zinc-950 text-white',
        !highlighted && 'text-zinc-950',
      )}
      onClick={() => void createAppInstance(postId)}
    >
      <span className="flex grow basis-0 items-center gap-x-1 ">
        <Emoji unified={'2728'} size={24} />
        {title ? title : EMPTY_POST_NAME}
      </span>
    </div>
  )
}

const AppExploreItem = () => {
  return (
    <div className="flex w-full cursor-pointer items-center gap-2 rounded px-2 py-2 text-[14px] font-bold text-zinc-950 transition hover:bg-zinc-200/80">
      <span className="flex grow basis-0 items-center gap-x-1 ">
        <Square3Stack3DIcon className="h-6 w-6" />
        Explore GPTs
      </span>
    </div>
  )
}

export const SidebarMainApps = () => {
  const { data: workspace } = useCurrentWorkspace()
  const { sortedPosts } = usePostsForSidebar(workspace?.id)

  return (
    <div className="space-y-1">
      {sortedPosts?.map((post) => {
        return <AppItem key={post.id} postId={post.id} title={post.title} />
      })}

      <AppExploreItem />
    </div>
  )
}
