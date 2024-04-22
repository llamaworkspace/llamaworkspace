import { useCreateSharedChat } from '@/components/chats/chatHooks'
import { EMPTY_POST_NAME } from '@/components/posts/postsConstants'
import { useCreatePost } from '@/components/posts/postsHooks'
import { usePostsForSidebar } from '@/components/sidebar/sidebarHooks'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { cn } from '@/lib/utils'
import { Square3Stack3DIcon } from '@heroicons/react/24/outline'
import { Emoji } from 'emoji-picker-react'

interface AppItemProps {
  postId: string
  title: string | null
}

const AppItem = ({ postId, title }: AppItemProps) => {
  const navigation = useNavigation()
  const { mutate: createChat } = useCreateSharedChat()
  const isActive = navigation.query.post_id === postId

  return (
    <div>
      <div
        className={cn(
          'flex w-full cursor-pointer items-center gap-2 rounded px-2 py-2 text-[14px] font-bold text-zinc-950 transition hover:bg-zinc-200/80 active:bg-zinc-300',
          isActive && 'bg-zinc-200',
        )}
        onClick={() => createChat({ postId })}
      >
        <span className="flex grow basis-0 items-center gap-x-1">
          <Emoji unified={'2728'} size={24} />
          <span className="line-clamp-1">
            {title ? title : EMPTY_POST_NAME}
          </span>
        </span>
      </div>
    </div>
  )
}

const AppExploreItem = () => {
  const { data: workspace } = useCurrentWorkspace()
  const { mutate: createPost } = useCreatePost()

  const handleCreatePost = () => {
    if (!workspace?.id) return
    createPost({ workspaceId: workspace.id })
  }
  return (
    <div
      className="flex w-full cursor-pointer items-center gap-2 rounded px-2 py-2 text-[14px] font-bold text-zinc-950 transition hover:bg-zinc-200/80"
      onClick={handleCreatePost}
    >
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
    <div className="space-y-0.5">
      {sortedPosts?.map((post) => {
        return <AppItem key={post.id} postId={post.id} title={post.title} />
      })}

      <AppExploreItem />
    </div>
  )
}
