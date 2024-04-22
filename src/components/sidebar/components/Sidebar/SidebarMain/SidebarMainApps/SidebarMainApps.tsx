import { usePostsForSidebarV2 } from '@/components/sidebar/sidebarHooks'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { SidebarMainAppItem } from './SidebarMainAppItem'
import { SidebarMainExploreButton } from './SidebarMainExploreButton'

export const SidebarMainApps = () => {
  const { data: workspace } = useCurrentWorkspace()
  const { data: posts } = usePostsForSidebarV2(workspace?.id)

  return (
    <div className="space-y-0.5">
      {posts?.map((post) => {
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
