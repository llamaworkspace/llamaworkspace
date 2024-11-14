import { cn } from '@/lib/utils'
import { AnalyticsProvider } from '../global/AnalyticsProvider'

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AnalyticsProvider trackPageViews identifyUser>
      <div>
        <Sidebar />
        <Main>{children}</Main>
      </div>
    </AnalyticsProvider>
  )
}
const Sidebar = () => {
  return <div>Sidebar</div>
}

const Main = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        'transition-spacing h-full duration-200 ease-out',
        // isDesktopSidebarOpen && 'lg:pl-72',
        true && 'lg:pl-72',
      )}
    >
      <div className="relative flex h-full w-full min-w-[300px] flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}
