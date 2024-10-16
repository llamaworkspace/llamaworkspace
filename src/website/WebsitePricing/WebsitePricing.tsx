import { Badge } from '@/components/ui/badge'
import { CheckCircleIcon } from '@heroicons/react/20/solid'
import Head from 'next/head'
import { WebsiteFooter } from '../WebsiteFooter'
import { WebsiteFooterCTA } from '../WebsiteFooterCTA'
import { WebsiteHeader } from '../WebsiteHeader'
import { WebsiteHomeFAQs } from '../WebsiteHome/WebsiteHomeFAQs'

export function WebsitePricing() {
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

        <div className="space-y-32">
          <WebsiteHomeFeaturePricing />
          <WebsiteHomeFAQs />
          <WebsiteFooterCTA />
        </div>

        <WebsiteFooter />
      </div>
    </>
  )
}

function WebsiteHomeFeaturePricing() {
  return (
    <div className="mx-auto max-w-6xl overflow-hidden">
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] hidden aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-zinc-200 to-zinc-50 opacity-60 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
      <div className="pt-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-4xl sm:text-center">
            <h2 className="text-base font-bold uppercase leading-7 text-zinc-400">
              Pricing
            </h2>
            <h1 className="text-4xl font-semibold tracking-tighter text-zinc-950 sm:text-6xl">
              Free while in beta.
            </h1>
          </div>

          <div className="mx-auto mt-48 max-w-4xl sm:text-center">
            <h1 className="mb-4 text-2xl font-semibold tracking-tighter text-zinc-950 sm:text-4xl">
              Pricing plans after the beta period
            </h1>
            <h2 className="mx-auto mb-12 max-w-3xl text-lg text-zinc-500">
              We&apos;re aiming to move out of beta in Q1 2025. Here&apos;s a
              sneak peek at the pricing we&apos;re planning once we&apos;re out
              of beta.
            </h2>
          </div>
          <div className="flow-root">
            <div className="isolate -mt-16 grid max-w-sm grid-cols-1 gap-y-16 divide-y divide-zinc-100 sm:mx-auto lg:-mx-8 lg:mt-0 lg:max-w-none lg:grid-cols-3 lg:divide-x lg:divide-y-0 xl:-mx-4">
              <FreeTier />
              <TeamsTier />
              <EnterpriseTier />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const freeTierFeatures = [
  'Free forever for single-user mode',
  'Access to all Large Language Models',
  'Create custom apps',
  'Bring your own API keys',
  'Integrate with your own code',
]

const FreeTier = () => {
  return (
    <div className="pt-16 lg:pt-0 xl:px-14">
      <h3 className="text-base font-semibold leading-7 text-zinc-900">Free</h3>
      <p className="mt-6 flex items-baseline gap-x-1">
        <span className="text-5xl font-bold tracking-tight text-zinc-900">
          $0
        </span>
      </p>
      <p className="mt-3 text-sm leading-6 text-gray-500">
        Plus token usage
        <br />
        (expect $2-$6/seat/month)
      </p>

      <p className="mt-10 text-sm font-semibold leading-6 text-zinc-900">
        The easiest way to get started:
      </p>
      <ul
        role="list"
        className="mt-6 space-y-3 text-sm leading-6 text-zinc-600"
      >
        {freeTierFeatures.map((feature) => {
          return (
            <li key={feature} className="flex gap-x-3">
              <CheckCircleIcon
                aria-hidden="true"
                className="h-6 w-5 flex-none text-zinc-600"
              />
              {feature}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const teamsFeatures = [
  'Invite unlimited team members',
  'Share apps with your team',
  'Restrict access with granular permissions',
]

const TeamsTier = () => {
  return (
    <div className="pt-16 lg:pt-0 xl:px-14">
      <h3 className="text-base font-semibold leading-7 text-zinc-900">
        Teams <Badge variant="yellow">Free while in beta</Badge>
      </h3>
      <p className="mt-6 flex items-baseline gap-x-1">
        <span className="text-5xl font-bold tracking-tight text-zinc-900 line-through">
          $4
        </span>
        <span className="text-sm font-semibold leading-6 text-zinc-600">
          /seat/month
        </span>
      </p>
      <p className="mt-3 text-sm leading-6 text-gray-500">
        Plus token usage
        <br />
        (expect $2-$6/seat/month)
      </p>
      <p className="mt-10 text-sm font-semibold leading-6 text-zinc-900">
        Everything in &quot;Free&quot;, plus:
      </p>
      <ul
        role="list"
        className="mt-6 space-y-3 text-sm leading-6 text-zinc-600"
      >
        {teamsFeatures.map((feature) => {
          return (
            <li key={feature} className="flex gap-x-3">
              <CheckCircleIcon
                aria-hidden="true"
                className="h-6 w-5 flex-none text-zinc-600"
              />
              {feature}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const enterpriseFeatures = [
  'SAML SSO & SCIM',
  'Custom data retention',
  'Custom domain',
  'Dedicated support',
  'Tailored onboarding',
  'Auto-updates for self-hosted installations',
]

const EnterpriseTier = () => {
  return (
    <div className="pt-16 lg:pt-0 xl:px-14">
      <h3 className="text-base font-semibold leading-7 text-zinc-900">
        Enterprise & Self-hosted
      </h3>
      <p className="mt-6 flex items-baseline gap-x-1">
        <span className="text-5xl font-bold tracking-tight text-zinc-900">
          Contact us
        </span>
      </p>
      <p className="invisible mt-3 text-sm leading-6 text-gray-500">
        Plus token fees, paid directly to the AI providers.
      </p>

      <p className="mt-10 text-sm font-semibold leading-6 text-zinc-900">
        Everything in &quot;Teams&quot;, plus:
      </p>
      <ul
        role="list"
        className="mt-6 space-y-3 text-sm leading-6 text-zinc-600"
      >
        {enterpriseFeatures.map((feature) => {
          return (
            <li key={feature} className="flex gap-x-3">
              <CheckCircleIcon
                aria-hidden="true"
                className="h-6 w-5 flex-none text-zinc-600"
              />
              {feature}
            </li>
          )
        })}
      </ul>
      <div
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%+3rem)] hidden aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-zinc-600 to-zinc-100 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </div>
  )
}
