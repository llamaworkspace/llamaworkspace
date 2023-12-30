import { SidebarDesktop } from './components/SidebarDesktop'
import { SidebarMobile } from './components/SidebarMobile'

export function Sidebar() {
  return (
    <>
      <SidebarMobile />
      <SidebarDesktop />
    </>
  )
}
