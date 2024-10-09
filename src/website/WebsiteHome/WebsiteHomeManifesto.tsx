import { CheckCircleIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { WebsiteHomeFeatureWrapper } from './WebsiteHomeFeatureWrapper'

export function WebsiteHomeManifesto() {
  return (
    <WebsiteHomeFeatureWrapper>
      <div
        id="manifesto"
        className="relative rounded-lg border border-[#f0f5e8] py-8"
      >
        <div className="mx-auto max-w-6xl px-6 ">
          <div className="mx-auto max-w-4xl sm:text-center">
            <p className="mt-2 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
              Our story
            </p>
          </div>
          <div className="mx-auto mt-6 max-w-2xl space-y-4 text-lg">
            {/* <div className="text-2xl font-semibold tracking-tight">
              Building an Open AI Future Together
            </div> */}
            <p>
              AI and Large Language Models have been around for quite a few
              years now. But it was with ChatGPT, the user interface we all
              know, that catapulted the mass adoption of those technologies;
              changing in the process how millions of us work on a daily basis.
            </p>
            <p>
              Like many of you, I was amazed by its power, and shortly after I
              started prototyping how a collaborative version of ChatGPT would
              look like. I shared it with friends and then.... what would become
              Llama Workspace. It showed what&apos;s possible when powerful AI
              is put directly into people&apos;s hands. But we think something
              this important shouldn&apos;t be locked up by one company or
              limited by closed systems. That&apos;s why we&apos;re building
              Llama Workspace—an open-source alternative that anyone can use,
              extend, and integrate.
            </p>
            <p>
              Then Anthropic&apos;s Claude came out. And Gemini, Mistral AI,
              then the Llama family. They are living proof that there isn't a
              single model for
            </p>

            <p>PRoblems: -</p>
            <p>
              realized It showed what&apos;s possible when powerful AI is put
              directly into people&apos;s hands. But we think something this
              important shouldn&apos;t be locked up by one company or limited by
              closed systems. That&apos;s why we&apos;re building Llama
              Workspace—an open-source alternative that anyone can use, extend,
              and integrate. **Why We&apos;re Building Llama Workspace** 1.
              **Because Everyone Should Have Access** We believe AI tools that
              impact so many lives should be open to all. By making Llama
              Workspace open-source, we ensure anyone can benefit without being
              tied down by a single vendor or restrictive licenses. We&apos;re
              indie hackers and builders who want technology to serve everyone.
              2. **To Keep Your Data Private** Privacy matters. With Llama
              Workspace, you can run everything on your own servers or in your
              own cloud. That means your data stays with you, not with some
              third-party service. We think that&apos;s how it should be,
              especially when dealing with sensitive information. 3. **To Save
              You Money** AI shouldn&apos;t break the bank. By offering a simple
              subscription and pay-as-you-go model for our cloud-hosted version,
              we can help organizations save 50% to 70% compared to ChatGPT
              Enterprise. We&apos;re all about making powerful tools affordable.
              **Join Us** We&apos;re indie hackers, artisans, and product
              builders who believe in an open, collaborative future for AI. If
              that sounds like you, we&apos;d love for you to join us.
              Let&apos;s build something amazing together. *Let&apos;s make AI
              accessible, private, and affordable—for everyone.*
            </p>
          </div>
          <div className="mt-20 flow-root">
            <div className="isolate -mt-16 grid max-w-sm grid-cols-1 gap-y-16 divide-y divide-zinc-100 sm:mx-auto lg:-mx-8 lg:mt-0 lg:max-w-none lg:grid-cols-3 lg:divide-x lg:divide-y-0 xl:-mx-4">
              <FreeTier />
              <TeamsTier />
              <EnterpriseTier />
            </div>
          </div>
        </div>
      </div>
    </WebsiteHomeFeatureWrapper>
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
    <div className="pt-16  lg:pt-0 xl:px-14">
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
    <div className="pt-16  lg:pt-0 xl:px-14">
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
        (expect $2-$6/seat/month)
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
    <div className="pt-16  lg:pt-0 xl:px-14">
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
        Get started
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
