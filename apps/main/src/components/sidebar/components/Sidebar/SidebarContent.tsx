import { SidebarFooter } from './SidebarFooter/SidebarFooter'
import { SidebarHeader } from './SidebarHeader'
import { SidebarMain } from './SidebarMain/SidebarMain'

export function SidebarContent() {
  return (
    <>
      <SidebarHeader />
      <SidebarMain />
      <SidebarFooter />
    </>
  )
}
