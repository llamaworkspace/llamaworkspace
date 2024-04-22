import { SidebarBody } from './SidebarBody'
import { SidebarFooter } from './SidebarFooter'
import { SidebarHeader } from './SidebarHeader'

export function SidebarContentWrapper() {
  return (
    <>
      <SidebarHeader />
      <SidebarBody />
      <SidebarFooter />
    </>
  )
}
