import { SidebarWrapperDesktop } from './SidebarWrapperDesktop'
import { SidebarWrapperMobile } from './SidebarWrapperMobile'

export function Sidebar() {
  return (
    <>
      <SidebarWrapperMobile />
      <SidebarWrapperDesktop />
    </>
  )
}
