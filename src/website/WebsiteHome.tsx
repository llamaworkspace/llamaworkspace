import Head from 'next/head'
import { WebsiteHomeFooter } from './WebsiteHome/WebsiteHomeFooter'
import { WebsiteHomeHeader } from './WebsiteHome/WebsiteHomeHeader'
import { WebsiteHomeHero } from './WebsiteHome/WebsiteHomeHero'

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
        <meta
          name="image"
          property="og:image"
          content="https://llamaworkspace.ai/images/2024-02/og_preview_feb_2024.png"
        />
        <meta
          property="og:description"
          content="The self-hostable ChatGPT Teams/Enterprise alternative."
        />
        <meta property="og:url" content="//llamaworkspace.ai" />
      </Head>
      <div className="relative isolate overflow-hidden bg-white">
        <svg
          className="absolute inset-0 -z-10 h-full w-full stroke-slate-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="0787a7c5-978c-4f66-83c7-11c213f99cb7"
              width={200}
              height={200}
              x="50%"
              y={-1}
              patternUnits="userSpaceOnUse"
            >
              <path d="M.5 200V.5H200" fill="none" />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            strokeWidth={0}
            fill="url(#0787a7c5-978c-4f66-83c7-11c213f99cb7)"
          />
        </svg>
        <WebsiteHomeHeader />

        <div className="space-y-32">
          <WebsiteHomeHero />
          {/* <WebsiteHomeTestimonials /> */}

          {/* <div className="mb-32 space-y-24">
            <WebsiteHomeFeatureUserManagement />
            <WebsiteHomeFeatureAnyLlm />
            <WebsiteHomeFeatureChatbots />
          </div> */}
          {/* <WebsiteHomeFeatureValueForMoney />
          <WebsiteHomeFAQs /> */}
          {/* <WebsiteHomeCTA /> */}
        </div>

        <WebsiteHomeFooter />
      </div>
    </>
  )
}
