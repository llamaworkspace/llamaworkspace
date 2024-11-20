import Head from 'next/head'
import { WebsiteFAQs } from '../WebsiteFAQs'
import { WebsiteFooterCTA } from '../WebsiteFooterCTA'
import { WebsiteLayout } from '../shared/WebsiteLayout'
import { WebsiteHomeFeatureApps } from './WebsiteHomeFeatureApps'
import { WebsiteHomeFeatureChatWithDocs } from './WebsiteHomeFeatureChatWithDocs'
import { WebsiteHomeFeatureIntegrations } from './WebsiteHomeFeatureIntegrations'
import { WebsiteHomeFeatureMultiModel } from './WebsiteHomeFeatureMultiModel'
import { WebsiteHomeValueForMoney } from './WebsiteHomeFeatureValueForMoney/WebsiteHomeValueForMoney'
import { WebsiteHomeHero } from './WebsiteHomeHero'
import WebsiteHomeLogos from './WebsiteHomeLogos'

export function WebsiteHome() {
  return (
    <>
      <Head>
        <title>Llama Workspace - Open Source ChatGPT Teams alternative.</title>
        <meta property="og:title" content="Open Source AI Assistant for work" />
        {/* <meta
          name="image"
          property="og:image"
          content="https://llamaworkspace.ai/images/2024-02/og_preview_feb_2024.png"
        /> */}
        <meta
          property="og:description"
          content="A ChatGPT Teams alternative that runs on any Large Language Model. On your infra or ours. All while helping you save up to 70% in subscription costs."
        />
        <meta property="og:url" content="//llamaworkspace.ai" />
      </Head>

      <WebsiteLayout>
        <div className="space-y-32">
          <WebsiteHomeHero />
          <WebsiteHomeLogos />

          <div className="mb-32 space-y-24">
            <div className="mx-auto -mb-12 max-w-6xl px-6 lg:px-0">
              <h1 className="font-heading max-w-3xl text-4xl font-semibold tracking-tighter text-zinc-900 sm:text-6xl ">
                AI superpowers for every employee.
              </h1>
            </div>
            <WebsiteHomeFeatureMultiModel />
            <WebsiteHomeFeatureApps />
            <WebsiteHomeFeatureChatWithDocs />
            <WebsiteHomeFeatureIntegrations />
            <WebsiteHomeValueForMoney />
          </div>

          <div className="mb-32">
            <WebsiteFAQs />
          </div>

          <WebsiteFooterCTA />
        </div>
      </WebsiteLayout>
    </>
  )
}
