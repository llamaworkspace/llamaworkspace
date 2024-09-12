import Link from 'next/link'

export function WebsiteHomeCTA() {
  return (
    <div className="bg-zinc-900 py-32 text-white">
      <div className="px-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight  sm:text-5xl">
            Try Joia today.
          </h2>
          <p className="mt-6 text-2xl font-medium leading-8 tracking-tighter text-zinc-400">
            And boost your team&apos;s productivity with ChatGPT, without
            breaking the bank.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/p"
              className="rounded-md bg-white px-6 py-4 font-semibold text-zinc-900 shadow-sm hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
