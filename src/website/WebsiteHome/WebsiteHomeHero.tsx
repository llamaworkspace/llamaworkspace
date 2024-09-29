import { StyledLink } from '@/components/ui/StyledLink'
import Link from 'next/link'

export function WebsiteHomeHero() {
  return (
    <div className="relative isolate pt-6">
      <div className="pb-24 sm:py-8 md:pt-12">
        <div className="mx-auto max-w-6xl px-6 ">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-3xl font-semibold tracking-tighter text-zinc-950 sm:text-6xl">
              Meet the open-source
              <br />
              AI assistant for work.
            </h1>
            <h2 className="text-xl font-medium tracking-tight text-zinc-800 sm:text-2xl">
              We are an open and extensible{' '}
              <span className="font-bold text-zinc-950">
                ChatGPT Enterprise alternative.
              </span>{' '}
              We run on any Large Language Model, on your infra or ours. All
              while helping you{' '}
              <StyledLink href="/pricing">save up to 70%</StyledLink> in
              subscription costs.
            </h2>
          </div>
          <div className="mt-10 items-center gap-x-6 sm:flex">
            <Link
              href="/auth/signin"
              className="rounded-md border border-zinc-900 bg-zinc-900 px-12 py-4 font-semibold text-white shadow-sm hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
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
