import { usePostsForSidebar } from '@/components/sidebar/sidebarHooks'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { SidebarMainAppItem } from './SidebarMainAppItem'
import { SidebarMainExploreButton } from './SidebarMainExploreButton'

export const SidebarMainApps = () => {
  const { data: workspace } = useCurrentWorkspace()
  const { data: posts } = usePostsForSidebar(workspace?.id)

  return (
    <div className="space-y-1">
      <div className="px-2 text-xs font-bold text-zinc-400">GPTs</div>

      <div className="space-y-0.5">
        {posts?.map((post) => {
          return (
            <SidebarMainAppItem
              key={post.id}
              postId={post.id}
              emoji={post.emoji}
              title={post.title}
            />
          )
        })}

        {/* Keep this div to respect space-y */}
        <div>
          <SidebarMainExploreButton />
        </div>
      </div>
    </div>
  )
}
