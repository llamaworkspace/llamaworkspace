import { AnalyticsProvider } from '@/components/global/clientAnalytics'
import { WebsiteHome } from '@/website/WebsiteHome/WebsiteHome'

export default function HomePage() {
  return (
    <AnalyticsProvider trackPageViews>
      <WebsiteHome />
    </AnalyticsProvider>
  )
}
