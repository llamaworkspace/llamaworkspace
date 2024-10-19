import { AnalyticsProvider } from '@/components/global/clientAnalytics'
import { WebsiteManifesto } from '@/website/WebsiteManifesto'

export default function PricingPage() {
  return (
    <AnalyticsProvider trackPageViews>
      <WebsiteManifesto />
    </AnalyticsProvider>
  )
}
