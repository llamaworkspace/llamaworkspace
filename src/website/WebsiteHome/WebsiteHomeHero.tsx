import { Button } from '@/components/ui/button'
import { GitHubLogoIcon } from '@radix-ui/react-icons'
import Link from 'next/link'

declare global {
  interface Window {
    userCountry: string
  }
}

export function WebsiteHomeHero() {
  // let isEU = false
  // if (typeof window !== 'undefined') {
  //   isEU = euCountriesGDPR.includes(window.userCountry)
  // }

  return (
    <div className="relative isolate pt-6">
      <div className="pt-12 sm:py-8 md:pt-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {/* <div className="mb-16 text-center">
              <span className="block rounded bg-fuchsia-200 px-4 py-3 md:inline md:rounded-full">
                <span className="mb-2 mr-4 font-bold">Open-sourcing soon</span>
                <br className="md:hidden" />
                <div className="my-2 md:hidden"></div>
                <span className="rounded-full border border-fuchsia-800 px-4 py-1 text-sm font-semibold text-fuchsia-800 hover:bg-fuchsia-300">
                  <a href="https://github.com/imayolas/joia" target="_blank">
                    Star us on GitHub
                  </a>
                </span>
              </span>
            </div> */}
            <div className="mb-10 space-y-4 text-center">
              {/* News pill */}
              {/* <div className="mb-6">
                <span className="rounded-full bg-pink-100 px-4 py-1 text-sm text-pink-600">
                  🎉 Joia is now open-source!{' '}
                  <StyledLink href="/blog/open-sourcing-joia">
                    Learn more.
                  </StyledLink>
                </span>
              </div> */}
              <div className="text-3xl font-bold md:text-2xl">
                <h1 className="leading-tight tracking-tighter text-zinc-800">
                  Open-source ChatGPT Teams/Enterprise alternative.
                </h1>
              </div>
              <h2 className="text-lgx tracking-tighter text-zinc-800 md:text-xl">
                Coming soon.
              </h2>
              {/* <h2 className="text-xl font-medium tracking-tighter text-zinc-800 md:text-3xl">
                A ChatGPT-like interface to access any Large Language Model,
                Private Chatbot or Custom Agent.
              </h2> */}
            </div>

            {/* <div className="grid gap-x-8 md:grid-cols-2 md:text-lg">
              <div>
                <ul className="mt-6 space-y-6 tracking-tight">
                  <li>
                    <CheckBadgeIcon className="mr-2 inline h-5 w-5 text-green-500" />
                    Ask questions to any LLM, including GPT-4, Claude, Gemini or
                    Mistral. Without paying a per-seat subscription.
                  </li>
                  <li>
                    <CheckBadgeIcon className="mr-2 inline h-5 w-5 text-green-500" />
                    Securely connect to your data, and ask questions to the AI.
                  </li>
                </ul>
              </div>
              <div>
                <ul className="mt-6 space-y-6 tracking-tight">
                  <li>
                    <CheckBadgeIcon className="mr-2 inline h-5 w-5 text-green-500" />
                    Build, iterate and share internal chatbots and agents.
                  </li>
                  <li>
                    <CheckBadgeIcon className="mr-2 inline h-5 w-5 text-green-500" />
                    Self-host it for maximum privacy and control.
                  </li>
                  {isEU && (
                    <li className="md:hidden">
                      <CheckBadgeIcon className="mr-2 inline h-5 w-5 text-green-500" />
                      Be fully GDPR compliant with our EU cloud infrastructure
                    </li>
                  )}
                </ul>
              </div>
            </div> */}
            <div className="mt-8 flex flex-col items-center justify-center gap-x-6 gap-y-4 md:flex-row">
              <Link passHref href="https://github.com/imayolas/llamaworkspace">
                <Button variant="outline">
                  <GitHubLogoIcon className="mr-2" /> Github repo
                </Button>
              </Link>
              {/* <Link
                href="https://github.com/imayolas/joia"
                className="rounded-md border bg-white px-12 py-4 font-semibold text-zinc-900 shadow-sm hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
              >
                Talk to us
              </Link> */}
            </div>
          </div>
          {/* <div className="mt-16 flow-root sm:mt-24">
            <WebsiteHomeHeroProductShot />
          </div> */}
        </div>
      </div>
      {/* <div
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
      </div> */}
    </div>
  )
}

const euCountriesGDPR = [
  'AT', // Austria
  'BE', // Belgium
  'BG', // Bulgaria
  'HR', // Croatia
  'CY', // Cyprus
  'CZ', // Czech Republic
  'DK', // Denmark
  'EE', // Estonia
  'FI', // Finland
  'FR', // France
  'DE', // Germany
  'GR', // Greece
  'HU', // Hungary
  'IE', // Ireland
  'IT', // Italy
  'LV', // Latvia
  'LT', // Lithuania
  'LU', // Luxembourg
  'MT', // Malta
  'NL', // Netherlands
  'PL', // Poland
  'PT', // Portugal
  'RO', // Romania
  'SK', // Slovakia
  'SI', // Slovenia
  'ES', // Spain
  'SE', // Sweden
]
