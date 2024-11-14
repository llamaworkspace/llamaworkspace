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
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
