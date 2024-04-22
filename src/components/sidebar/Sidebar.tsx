import { SidebarWrapperDesktop } from './components/SidebarWrapperDesktop'
import { SidebarWrapperMobile } from './components/SidebarWrapperMobile'

export function Sidebar() {
  return (
    <>
      <SidebarWrapperMobile />
      <SidebarWrapperDesktop />
    </>
  )
}
