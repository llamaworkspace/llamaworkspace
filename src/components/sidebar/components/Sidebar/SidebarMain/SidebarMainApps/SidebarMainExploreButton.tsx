import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { Square3Stack3DIcon } from '@heroicons/react/24/outline'
import { SidebarMainItemShell } from './SidebarMainItemShell'

export const SidebarMainExploreButton = () => {
  const { data: workspace } = useCurrentWorkspace()
  const navigation = useNavigation()

  const isActive = navigation.pathname === `/w/[workspace_id]/apps`

  return (
    <SidebarMainItemShell
      title="All GPTs"
      isActive={isActive}
      showPencil={false}
      icon={<Square3Stack3DIcon className="h-6 w-6" />}
      linkHref={`/w/${workspace?.id}/apps`}
    />
  )
}
