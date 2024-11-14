import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { AnalyticsProvider } from '../global/AnalyticsProvider'

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AnalyticsProvider trackPageViews identifyUser>
      <SidebarProvider className="">
        <AppSidebar />
        <main className="bg-background relative flex min-h-svh flex-1 flex-col peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow">
          <AppHeader />
          {children}
        </main>

        {/* {children} */}
      </SidebarProvider>
    </AnalyticsProvider>
  )
}

const AppHeader = () => {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 bg-yellow-200 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="h-5 w-5" />
        <div
          data-orientation="vertical"
          role="none"
          className="bg-border mr-2 h-4 w-[1px] shrink-0"
        ></div>
        <nav className="hidden" aria-label="breadcrumb">
          <ol className="text-muted-foreground flex flex-wrap items-center gap-1.5 break-words text-sm sm:gap-2.5">
            <li className="hidden items-center gap-1.5 md:block">
              <a className="hover:text-foreground transition-colors" href="#">
                Building Your Application
              </a>
            </li>
            <li
              role="presentation"
              aria-hidden="true"
              className="[&amp;>svg]:w-3.5 [&amp;>svg]:h-3.5 hidden md:block"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="lucide lucide-chevron-right"
              >
                <path d="m9 18 6-6-6-6"></path>
              </svg>
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span
                role="link"
                aria-disabled="true"
                aria-current="page"
                className="text-foreground font-normal"
              >
                Data Fetching
              </span>
            </li>
          </ol>
        </nav>
      </div>
    </header>
  )
}
export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
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
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <DaFooter />
      </SidebarFooter>
    </Sidebar>
  )
}

const DaFooter = () => {
  return (
    <div>
      <div data-sidebar="footer" className="flex flex-col gap-2 p-2">
        <ul data-sidebar="menu" className="flex w-full min-w-0 flex-col gap-1">
          <li data-sidebar="menu-item" className="group/menu-item relative">
            <button
              data-sidebar="menu-button"
              data-size="lg"
              data-active="false"
              className="peer/menu-button [&amp;>span:last-child]:truncate [&amp;>svg]:size-4 [&amp;>svg]:shrink-0 flex h-12 w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[state=open]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-0"
              type="button"
              id="radix-:Rspuuuuu6ja:"
              aria-haspopup="menu"
              aria-expanded="false"
              data-state="closed"
            >
              <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-lg">
                <img
                  className="aspect-square h-full w-full"
                  alt="shadcn"
                  src="/avatars/shadcn.jpg"
                />
              </span>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">shadcn</span>
                <span className="truncate text-xs">m@example.com</span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-chevrons-up-down ml-auto size-4"
              >
                <path d="m7 15 5 5 5-5"></path>
                <path d="m7 9 5-5 5 5"></path>
              </svg>
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}
