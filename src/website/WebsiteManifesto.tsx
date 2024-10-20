import Head from 'next/head'
import { WebsiteFooter } from './WebsiteFooter'
import { WebsiteHeader } from './WebsiteHeader'

export function WebsiteManifesto() {
  return (
    <>
      <Head>
        <title>Pricing - Llama Workspace</title>
        <meta property="og:title" content="Pricing - Llama Workspace" />

        <meta
          property="og:description"
          content="Llama Workdspace is free while in beta."
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

        <div className="mx-auto mt-24 max-w-3xl space-y-4 bg-white bg-opacity-20 p-8 text-lg">
          <h1 className="text-4xl font-semibold tracking-tighter">
            Why Llama Workspace?
          </h1>
          <p>
            ChatGPT is an incredible product. It&apos;s made a huge impact on
            society, from education to professional spaces, and its adoption is
            unprecedented. We all know it&apos;s going to reshape industries and
            even change jobs as we know them.
          </p>
          <p>
            But here&apos;s the thing: when a product is that powerful,
            impactful and transformative, we believe it should be as open and
            accessible as possible. People should be able to tweak it, make it
            their own, and not feel locked with one vendor.
          </p>
          <p>
            The biggest Large Language Model providers, like OpenAI and
            Anthropic, have chosen to build their user-facing AI assistants with
            a closed approach. And that&apos;s totally understandable:
            they&apos;re running massive businesses and need to make it work
            financially. But we think there should be an option for
            organizations that want something more customizable. Whether
            it&apos;s for privacy reasons, avoiding being tied to one model, or
            simply to save money, Llama Workspace offers that alternative.
          </p>

          <p>
            We also feel that open-source AI models have reached a point where
            they&apos;re fully capable of competing with the big players.
            What&apos;s been missing, though, is a workplace-focused chat
            interface—something that includes collaboration, insights,
            integrations, and compliance all in one. That&apos;s where Llama
            Workspace comes in.
          </p>
          <p>
            Our mission in the end is to be that alternative, so that you get
            the power of Large Language Models, with the freedom to customize it
            to your needs, and passing to you as many savings as possible.
          </p>
        </div>

        <WebsiteFooter />
      </div>
    </>
  )
}
