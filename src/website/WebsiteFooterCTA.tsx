import Link from 'next/link'

export function WebsiteFooterCTA() {
  return (
    <div className="bg-zinc-900 py-32 text-white">
      <div className="px-6 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight  sm:text-4xl">
            Get early access to Llama Workspace today
          </h2>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/auth/signup"
              className="rounded-md bg-white px-6 py-4 font-semibold text-zinc-900 shadow-sm hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
