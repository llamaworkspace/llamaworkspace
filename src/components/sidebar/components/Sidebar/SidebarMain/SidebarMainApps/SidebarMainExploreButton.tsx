import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { Square3Stack3DIcon } from '@heroicons/react/24/outline'
import { usePathname } from 'next/navigation'
import { SidebarMainItemShell } from './SidebarMainItemShell'

export const SidebarMainExploreButton = () => {
  const { data: workspace } = useCurrentWorkspace()
  const pathname = usePathname()

  const isActive = pathname === `/w/${workspace?.id}/apps`

  return (
    <SidebarMainItemShell
      title="See all Apps"
      isActive={isActive}
      showPencil={false}
      icon={<Square3Stack3DIcon className="h-6 w-6" />}
      linkHref={`/w/${workspace?.id}/apps`}
    />
  )
}
