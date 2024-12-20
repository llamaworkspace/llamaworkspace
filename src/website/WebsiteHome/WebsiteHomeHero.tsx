import Link from 'next/link'

export function WebsiteHomeHero() {
  return (
    <div className="relative isolate py-12">
      <div className="">
        <div className="mx-auto max-w-6xl space-y-16 px-6 lg:px-0">
          <div className="max-w-2xl space-y-4">
            <h1 className="font-heading text-4xl font-semibold tracking-tighter text-zinc-950 sm:text-6xl">
              The open-source
              <br />
              AI assistant for work.
            </h1>
            <h2 className="font-heading text-xl font-medium tracking-tighter text-zinc-900 sm:text-2xl">
              We are an open and extensible{' '}
              <span className="font-bold text-zinc-950">
                ChatGPT Teams alternative.
              </span>{' '}
              We work with any Large Language Model, on the infra of your
              choice, and help you cut subscription costs by up to 82%.
            </h2>
          </div>
          <div className="mt-12 items-center space-y-6 lg:mt-8">
            <Link
              href="/auth/signin"
              className="rounded-md border border-zinc-900 bg-zinc-900 px-12 py-4 font-semibold text-white shadow-sm hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
