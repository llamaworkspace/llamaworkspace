import Head from 'next/head'
import { WebsiteHomeCTA } from './WebsiteHomeCTA'
import { WebsiteHomeFAQs } from './WebsiteHomeFAQs'
import { WebsiteHomeFeatureChatbots } from './WebsiteHomeFeatureChatbots'
import { WebsiteHomeFeatureGpt4 } from './WebsiteHomeFeatureGpt4'
import { WebsiteHomeFeatureUserManagement } from './WebsiteHomeFeatureUserManagement'
import { WebsiteHomeFeatureValueForMoney } from './WebsiteHomeFeatureValueForMoney'
import { WebsiteHomeFooter } from './WebsiteHomeFooter'
import { WebsiteHomeHeader } from './WebsiteHomeHeader'
import { WebsiteHomeHero } from './WebsiteHomeHero'

export function WebsiteHomeExample() {
  return (
    <>
      <Head>
        <title>Joia - A ChatGPT alternative built for teams.</title>
        <meta
          property="og:title"
          content="ChatGPT supercharged: Faster, more affordable and built for teams."
        />
        <meta
          name="image"
          property="og:image"
          content="https://joia.so/images/homepage/linkedin_og_preview.png"
        />
        <meta
          property="og:description"
          content="Joia is an alternative ChatGPT platform built for collaboration. Add your team members and create shareable chatbots and centralize."
        />
        <meta property="og:url" content="//joia.so" />
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

          <div className="mb-32 space-y-24">
            <WebsiteHomeFeatureGpt4 />
            <WebsiteHomeFeatureChatbots />
            <WebsiteHomeFeatureUserManagement />
          </div>
          <WebsiteHomeFeatureValueForMoney />
          <WebsiteHomeFAQs />
          <WebsiteHomeCTA />
        </div>

        <WebsiteHomeFooter />
      </div>
    </>
  )
}
