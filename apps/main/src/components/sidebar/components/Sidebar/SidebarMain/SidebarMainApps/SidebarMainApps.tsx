import { useAppsForSidebar } from '@/components/sidebar/sidebarHooks'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { SidebarMainAppItem } from './SidebarMainAppItem'
import { SidebarMainExploreButton } from './SidebarMainExploreButton'

export const SidebarMainApps = () => {
  const { data: workspace } = useCurrentWorkspace()
  const { data: apps } = useAppsForSidebar(workspace?.id)

  return (
    <div className="space-y-1">
      <div className="px-2 text-xs font-bold text-zinc-400">Apps</div>

      <div className="space-y-0.5">
        {apps?.map((app) => {
          return (
            <SidebarMainAppItem
              key={app.id}
              appId={app.id}
              emoji={app.emoji}
              title={app.title}
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
