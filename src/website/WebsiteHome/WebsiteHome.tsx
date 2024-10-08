import Head from 'next/head'
import { WebsiteHomeFAQs } from './WebsiteHomeFAQs'
import { WebsiteHomeFeatureApps } from './WebsiteHomeFeatureApps'
import { WebsiteHomeFeatureChatWithDocs } from './WebsiteHomeFeatureChatWithDocs'
import { WebsiteHomeFeatureIntegrations } from './WebsiteHomeFeatureIntegrations'
import { WebsiteHomeFeatureMultiModel } from './WebsiteHomeFeatureMultiModel'
import { WebsiteHomeFeaturePricing } from './WebsiteHomeFeaturePricing'
import { WebsiteHomeFeatureWrapper } from './WebsiteHomeFeatureWrapper'
import { WebsiteHomeFooter } from './WebsiteHomeFooter'
import { WebsiteHomeHeader } from './WebsiteHomeHeader'
import { WebsiteHomeHero } from './WebsiteHomeHero'

export function WebsiteHome() {
  return (
    <>
      <Head>
        <title>
          Llama Workspace - Open Source ChatGPT Enterprise alternative.
        </title>
        <meta
          property="og:title"
          content="Open Source ChatGPT Enterprise alternative"
        />
        {/* <meta
          name="image"
          property="og:image"
          content="https://llamaworkspace.ai/images/2024-02/og_preview_feb_2024.png"
        /> */}
        <meta
          property="og:description"
          content="Open Source ChatGPT Enterprise alternative"
        />
        <meta property="og:url" content="//llamaworkspace.ai" />
      </Head>
      <div className="relative isolate overflow-hidden bg-white">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#fac3f1] to-[#c0c8f3] opacity-60 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <WebsiteHomeHeader />

        <div className="space-y-32">
          <WebsiteHomeHero />

          <div className="space-y-8">
            <WebsiteHomeFeatureWrapper>
              <div className="space-y-3">
                <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
                  All the functionality you expect
                  <br />
                  from an AI assistant
                </h2>
                <h3 className="text-xl font-medium tracking-tight text-zinc-600 sm:text-xl">
                  We have all the functionality you expect from an AI assistant,
                  and more.
                </h3>
              </div>
            </WebsiteHomeFeatureWrapper>
            <div className="mb-32 space-y-24">
              <WebsiteHomeFeatureMultiModel />
              <WebsiteHomeFeatureApps />
              <WebsiteHomeFeatureChatWithDocs />
              <WebsiteHomeFeatureIntegrations />
            </div>
          </div>
          <WebsiteHomeFeaturePricing />
          <WebsiteHomeFAQs />
          {/* <WebsiteHomeCTA /> */}
        </div>

        <WebsiteHomeFooter />
      </div>
    </>
  )
}
