import { EMPTY_POST_NAME } from '@/components/posts/postsConstants'
import { useCreatePost } from '@/components/posts/postsHooks'
import { Button } from '@/components/ui/button'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { usePostsForSidebar } from '../../sidebarHooks'
import { SidebarMobileLineItemForChatbot } from './SidebarMobileLineItemForChatbot'

export const SidebarMobileChatBotsSection = () => {
  const { mutate: createPost } = useCreatePost()
  const { workspace } = useCurrentWorkspace()
  const { sortedPosts } = usePostsForSidebar(workspace?.id)

  const navigation = useNavigation()
  const [openedPostId, setOpenedPostId] = useState<string | null>()
  const navigationPostId = navigation.query.post_id as string

  const handleOpenPostId = (postId: string) => () => {
    setOpenedPostId(postId)
  }
  const handleCreatePost = () => {
    if (!workspace?.id) return
    createPost({ workspaceId: workspace.id })
  }
  useEffect(() => {
    if (navigationPostId) {
      setOpenedPostId(navigationPostId)
    }
  }, [navigationPostId])

  return (
    <li>
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase leading-6 text-zinc-400">
          Shared chatbots
        </div>
        <div>
          <Button variant="outline" size="xs" onClick={handleCreatePost}>
            <PlusIcon className="-ml-0.5 h-3 w-3" />
          </Button>
        </div>
      </div>
      <ul role="list" className="-mx-2 mt-2 space-y-1">
        {sortedPosts && !sortedPosts.length && (
          <div className="mt-1 px-2 py-1 text-[0.84rem] italic text-zinc-400">
            No chatbots yet.
          </div>
        )}
        {sortedPosts?.map((sortedPost) => {
          const isCurrent = openedPostId === sortedPost.id
          return (
            <div
              key={sortedPost.id}
              onClick={handleOpenPostId(sortedPost.id)}
              className="cursor-pointer"
            >
              <SidebarMobileLineItemForChatbot
                postId={sortedPost.id}
                currentChatId={navigation.query.chat_id as string}
                postSortId={sortedPost.id}
                href={`/p/${sortedPost.id}/c/${sortedPost.firstChatId}`}
                title={sortedPost.title ?? EMPTY_POST_NAME}
                isCurrent={isCurrent}
              />
            </div>
          )
        })}
      </ul>
    </li>
  )
}
