import Head from 'next/head'
import { WebsiteFAQs } from '../WebsiteFAQs'
import { WebsiteFooter } from '../WebsiteFooter'
import { WebsiteFooterCTA } from '../WebsiteFooterCTA'
import { WebsiteHeader } from '../WebsiteHeader'
import { WebsiteHomeFeatureApps } from './WebsiteHomeFeatureApps'
import { WebsiteHomeFeatureChatWithDocs } from './WebsiteHomeFeatureChatWithDocs'
import { WebsiteHomeFeatureIntegrations } from './WebsiteHomeFeatureIntegrations'
import { WebsiteHomeFeatureMultiModel } from './WebsiteHomeFeatureMultiModel'
import { WebsiteHomeValueForMoney } from './WebsiteHomeFeatureValueForMoney/WebsiteHomeValueForMoney'
import { WebsiteHomeHero } from './WebsiteHomeHero'

export function WebsiteHome() {
  return (
    <>
      <Head>
        <title>
          Llama Workspace - Open Source ChatGPT Enterprise alternative.
        </title>
        <meta property="og:title" content="Open Source AI Assistant for work" />
        {/* <meta
          name="image"
          property="og:image"
          content="https://llamaworkspace.ai/images/2024-02/og_preview_feb_2024.png"
        /> */}
        <meta
          property="og:description"
          content="A ChatGPT Enterprise alternative that runs on any Large Language Model. On your infra or ours. All while helping you save up to 70% in subscription costs."
        />
        <meta property="og:url" content="//llamaworkspace.ai" />
      </Head>
      <div className="relative isolate overflow-hidden bg-white">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="to-tr relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#fac3f1] to-[#c0c8f3] opacity-60 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <WebsiteHeader />

        <div className="space-y-32">
          <WebsiteHomeHero />
          <Logos />

          <div className="mb-32 space-y-24">
            <div className="mx-auto -mb-12 max-w-6xl px-6 lg:px-0">
              <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tighter text-zinc-900 sm:text-6xl ">
                Give AI superpowers to every employee.
              </h1>
            </div>
            <WebsiteHomeFeatureMultiModel />
            <WebsiteHomeFeatureApps />
            <WebsiteHomeFeatureChatWithDocs />
            <WebsiteHomeFeatureIntegrations />
          </div>
          <div className="mb-32">
            <WebsiteHomeValueForMoney />
          </div>

          <div className="mb-32">
            <WebsiteFAQs />
          </div>

          <WebsiteFooterCTA />
        </div>

        <WebsiteFooter />
      </div>
    </>
  )
}

export default function Logos() {
  return (
    <div className="mx-auto max-w-6xl rounded-lg px-6 lg:px-0">
      <h2 className="text-center font-heading text-xl font-semibold tracking-tight text-zinc-800">
        Trusted by +800 teams and employees at
      </h2>
      <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 opacity-60 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
        <img
          alt="Transistor"
          src="https://tailwindui.com/plus/img/logos/158x48/transistor-logo-gray-900.svg"
          width={158}
          height={48}
          className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
        />
        <img
          alt="Reform"
          src="https://tailwindui.com/plus/img/logos/158x48/reform-logo-gray-900.svg"
          width={158}
          height={48}
          className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
        />
        <img
          alt="Tuple"
          src="https://tailwindui.com/plus/img/logos/158x48/tuple-logo-gray-900.svg"
          width={158}
          height={48}
          className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
        />
        <img
          alt="SavvyCal"
          src="https://tailwindui.com/plus/img/logos/158x48/savvycal-logo-gray-900.svg"
          width={158}
          height={48}
          className="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1"
        />
        <img
          alt="Statamic"
          src="https://tailwindui.com/plus/img/logos/158x48/statamic-logo-gray-900.svg"
          width={158}
          height={48}
          className="col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1"
        />
      </div>
    </div>
  )
}
