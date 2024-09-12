import { CheckBadgeIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

export function WebsiteHomeHero() {
  return (
    <div className="relative isolate pt-6">
      <div className="pb-24 sm:py-8 md:pt-12">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <span className="block rounded bg-fuchsia-200 px-4 py-3 md:inline md:rounded-full">
                <span className="mb-2 mr-4 font-bold">Open-sourcing soon</span>
                <br className="md:hidden" />
                <div className="my-2 md:hidden"></div>
                <span className="rounded-full border border-fuchsia-800 px-4 py-1 text-sm font-semibold text-fuchsia-800 hover:bg-fuchsia-300">
                  <a href="https://github.com/joiahq/joia" target="_blank">
                    Star us on GitHub
                  </a>
                </span>
              </span>
            </div>
            <h1 className="text-center text-3xl font-bold tracking-tighter text-gray-900 sm:text-6xl">
              The open-source
              <br />
              ChatGPT Enterprise alternative.
            </h1>
            <div className="grid gap-x-8 md:grid-cols-2">
              <div>
                <ul className="mt-6 space-y-3 text-lg tracking-tight">
                  <li>
                    <CheckBadgeIcon className="mr-2 inline h-5 w-5 text-green-500" />
                    Same engine as ChatGPT, while{' '}
                    <mark className="highlight font-semibold">
                      saving over 50%
                    </mark>{' '}
                    on subscription costs.
                  </li>
                  <li>
                    <CheckBadgeIcon className="mr-2 inline h-5 w-5 text-green-500" />
                    Manage ChatGPT access for everyone in your company and
                    consolidate payments into a single bill.
                  </li>
                </ul>
              </div>
              <div>
                <ul className="mt-6 space-y-3 text-lg tracking-tight">
                  <li>
                    <CheckBadgeIcon className="mr-2 inline h-5 w-5 text-green-500" />
                    Boost productivity with shareable chatbots (aka GPTs).
                  </li>
                  <li>
                    <CheckBadgeIcon className="mr-2 inline h-5 w-5 text-green-500" />
                    Go beyond GPT-4 and access hundreds models like Llama 2,
                    Claude, and more.{' '}
                    <span className="rounded bg-fuchsia-200 p-0.5 text-xs font-semibold">
                      Coming soon
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/p"
                className="rounded-md bg-zinc-900 px-6 py-4 font-semibold text-white shadow-sm hover:bg-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
              >
                ✨ Sign up, it&apos;s free
              </Link>
            </div>
            <div className="mt-3 text-center text-sm text-zinc-500">
              Free to use while in beta. Only pay for the OpenAI costs.
            </div>
          </div>
        </div>
      </div>
      <div
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </div>
  )
}
