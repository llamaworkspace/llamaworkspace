import { AppSidebar } from '@/components/global/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AnalyticsProvider } from '../../components/global/analytics-provider'

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AnalyticsProvider trackPageViews identifyUser>
      <SidebarProvider>
        <AppSidebar />
        <main className="bg-background relative flex min-h-svh flex-1 flex-col">
          <div className="flex h-svh w-full">
            <div className="flex flex-1 flex-col">{children}</div>
          </div>
        </main>
      </SidebarProvider>
    </AnalyticsProvider>
  )
}
