export function AppSidebarHeader() {
  return (
    <ul data-sidebar="menu" className="flex w-full min-w-0 flex-col gap-1">
      <li data-sidebar="menu-item" className="group/menu-item relative">
        <button
          data-sidebar="menu-button"
          data-size="lg"
          data-active="false"
          className="peer/menu-button [&amp;>span:last-child]:truncate [&amp;>svg]:size-4 [&amp;>svg]:shrink-0 flex h-12 w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[state=open]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-0"
          type="button"
          id="radix-:Rcpuuuuu6ja:"
          aria-haspopup="menu"
          aria-expanded="false"
          data-state="closed"
        >
          Button here
        </button>
      </li>
    </ul>
  )
}
