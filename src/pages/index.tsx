import { AnalyticsProvider } from '@/components/global/clientAnalytics'
import { WebsiteHome } from '@/website/WebsiteHome/WebsiteHome'

export default function HomePage() {
  return (
    <AnalyticsProvider>
      <WebsiteHome />
    </AnalyticsProvider>
  )
}
