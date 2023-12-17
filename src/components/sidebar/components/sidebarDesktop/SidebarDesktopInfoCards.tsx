import { SidebarInfoCardType } from '@/shared/globalTypes'
import { useInfoCardForSidebar } from '../../sidebarHooks'
import { SidebarDesktopAddMembersCard } from './SidebarDesktopAddMembersCard'

export const SidebarDesktopInfoCards = () => {
  const { data } = useInfoCardForSidebar()

  if (data?.show === SidebarInfoCardType.Onboarding) {
    return <SidebarDesktopAddMembersCard />
  }
}
