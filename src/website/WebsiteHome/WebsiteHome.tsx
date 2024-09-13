import Head from 'next/head'
import { WebsiteHomeFeatureApps } from './WebsiteHomeFeatureApps'
import { WebsiteHomeFeatureMultiModel } from './WebsiteHomeFeatureMultiModel'
import { WebsiteHomeFooter } from './WebsiteHomeFooter'
import { WebsiteHomeHeader } from './WebsiteHomeHeader'
import { WebsiteHomeHero } from './WebsiteHomeHero'

export function WebsiteHome() {
  return (
    <>
      <Head>
        <title>
          Llama Workspace - The self-hostable ChatGPT Teams/Enterprise
          alternative.
        </title>
        <meta
          property="og:title"
          content="The self-hostable ChatGPT Teams/Enterprise
          alternative."
        />
        {/* <meta
          name="image"
          property="og:image"
          content="https://llamaworkspace.ai/images/2024-02/og_preview_feb_2024.png"
        />
        <meta
          property="og:description"
          content="The self-hostable ChatGPT Teams/Enterprise alternative."
        /> */}
        <meta property="og:url" content="//llamaworkspace.ai" />
      </Head>
      <div className="relative isolate overflow-hidden bg-white">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#d4ead0] to-[#d4ead0] opacity-60 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <WebsiteHomeHeader />

        <div className="space-y-32">
          <WebsiteHomeHero />

          <div className="mb-32 space-y-24">
            <WebsiteHomeFeatureMultiModel />
            <WebsiteHomeFeatureApps />
          </div>
          {/* <WebsiteHomeFeatureValueForMoney />
          <WebsiteHomeFAQs /> */}
          {/* <WebsiteHomeCTA /> */}
        </div>

        <WebsiteHomeFooter />
      </div>
    </>
  )
}
