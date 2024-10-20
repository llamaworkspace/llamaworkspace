import Head from 'next/head'
import { WebsiteLayout } from './shared/WebsiteLayout'

export function WebsiteManifesto() {
  return (
    <>
      <Head>
        <title>Manifesto - Llama Workspace</title>
        <meta property="og:title" content="Pricing - Llama Workspace" />

        <meta property="og:description" content="Project's manifesto" />
        <meta property="og:url" content="//llamaworkspace.ai" />
      </Head>
      <WebsiteLayout>
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
      </WebsiteLayout>
    </>
  )
}
