import { CheckCircleIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { WebsiteHomeFeatureWrapper } from './WebsiteHomeFeatureWrapper'

export function WebsiteHomeFeatureValueForMoney() {
  return (
    <WebsiteHomeFeatureWrapper>
      <div className="relative rounded-lg border border-[#f0f5e8] py-8">
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
        <div className="">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl sm:text-center">
              <h2 className="text-base font-semibold uppercase leading-7 text-green-700">
                Pricing
              </h2>
              <p className="mt-2 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
                Start free, pay as you team grows.
              </p>
            </div>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600 sm:text-center">
              Distinctio et nulla eum soluta et neque labore quibusdam. Saepe et
              quasi iusto modi velit ut non voluptas in. Explicabo id ut
              laborum.
            </p>
            <div className="mt-20 flow-root">
              <div className="isolate -mt-16 grid max-w-sm grid-cols-1 gap-y-16 divide-y divide-zinc-100 sm:mx-auto lg:-mx-8 lg:mt-0 lg:max-w-none lg:grid-cols-3 lg:divide-x lg:divide-y-0 xl:-mx-4">
                <FreeTier />
                <TeamsTier />
                <EnterpriseTier />
              </div>
            </div>
          </div>
        </div>
      </div>
    </WebsiteHomeFeatureWrapper>
  )
}

const freeTierFeatures = [
  'Access to all Large Language Models',
  'Create custom apps',
  'Bring your own API keys',
  'Integrate with your own code',
]

const FreeTier = () => {
  return (
    <div className="pt-16 lg:px-8 lg:pt-0 xl:px-14">
      <h3 className="text-base font-semibold leading-7 text-zinc-900">Free</h3>
      <p className="mt-6 flex items-baseline gap-x-1">
        <span className="text-5xl font-bold tracking-tight text-zinc-900">
          $0
        </span>
      </p>
      <p className="mt-3 text-sm leading-6 text-gray-500">
        Plus token usage
        <br />
        (expect $4-$8/seat/month)
      </p>

      <Link
        href="/auth/signin"
        className="mt-10 block rounded-md bg-zinc-950 px-3 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
      >
        Start free
      </Link>
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
    <div className="pt-16 lg:px-8 lg:pt-0 xl:px-14">
      <h3 className="text-base font-semibold leading-7 text-zinc-900">Teams</h3>
      <p className="mt-6 flex items-baseline gap-x-1">
        <span className="text-5xl font-bold tracking-tight text-zinc-900">
          $4
        </span>
        <span className="text-sm font-semibold leading-6 text-zinc-600">
          /seat/month
        </span>
      </p>
      <p className="mt-3 text-sm leading-6 text-gray-500">
        Plus token usage
        <br />
        (expect $4-$8/seat/month)
      </p>
      <Link
        href="/auth/signin"
        className="mt-10 block rounded-md bg-zinc-950 px-3 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
      >
        Start trial
      </Link>
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
    <div className="pt-16 lg:px-8 lg:pt-0 xl:px-14">
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

      <Link
        href="/auth/signin"
        className="mt-10 block rounded-md bg-zinc-950 px-3 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
      >
        Talk to us
      </Link>
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
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#b3ff80] to-[#0a8a2f] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </div>
  )
}
