import { SidebarFooterUserSettingsDropdown } from './SidebarFooterUserSettingsDropdown'

export function SidebarFooter() {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between gap-x-4 border-b border-zinc-200/50 px-2">
      <SidebarFooterUserSettingsDropdown />
    </div>
  )
}
