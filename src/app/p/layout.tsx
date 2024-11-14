import { AppHeader } from '@/components/global/app-header'
import { AppSidebar } from '@/components/global/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AnalyticsProvider } from '../global/AnalyticsProvider'

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AnalyticsProvider trackPageViews identifyUser>
      <SidebarProvider>
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
