import { usePostsForSidebar } from '@/components/sidebar/sidebarHooks'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { SidebarMainAppItem } from './SidebarMainAppItem'
import { SidebarMainExploreButton } from './SidebarMainExploreButton'

export const SidebarMainApps = () => {
  const { data: workspace } = useCurrentWorkspace()
  const { sortedPosts } = usePostsForSidebar(workspace?.id)

  return (
    <div className="space-y-0.5">
      {sortedPosts?.map((post) => {
        return (
          <SidebarMainAppItem
            key={post.id}
            postId={post.id}
            title={post.title}
          />
        )
      })}

      <SidebarMainExploreButton />
    </div>
  )
}
