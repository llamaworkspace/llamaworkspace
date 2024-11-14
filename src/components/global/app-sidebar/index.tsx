import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { AppSidebarBody } from './app-sidebar-body'
import { AppSidebarFooter } from './app-sidebar-footer'
import { AppSidebarHeader } from './app-sidebar-header'

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <AppSidebarHeader />
      </SidebarHeader>
      <SidebarContent>
        <AppSidebarBody />
      </SidebarContent>
      <SidebarFooter>
        <AppSidebarFooter />
      </SidebarFooter>
    </Sidebar>
  )
}
