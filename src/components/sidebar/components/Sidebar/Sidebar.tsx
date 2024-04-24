import { SidebarWrapperDesktop } from './SidebarWrapperDesktop'
import { SidebarWrapperMobile } from './SidebarWrapperMobile'

export function Sidebar() {
  return (
    <>
      <div className="lg:hidden">
        <SidebarWrapperMobile />
      </div>
      <div className="hidden lg:block">
        <SidebarWrapperDesktop />
      </div>
    </>
  )
}
