import { AnalyticsProvider } from '@/components/global/clientAnalytics'
import { WebsitePricing } from '@/website/WebsitePricing/WebsitePricing'

export default function PricingPage() {
  return (
    <AnalyticsProvider trackPageViews>
      <WebsitePricing />
    </AnalyticsProvider>
  )
}
