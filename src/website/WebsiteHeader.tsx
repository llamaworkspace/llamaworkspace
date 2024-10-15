import { BookOpenIcon } from '@heroicons/react/24/outline'
import { GitHubLogoIcon } from '@radix-ui/react-icons'
import Image from 'next/image'
import Link from 'next/link'

export function WebsiteHeader() {
  return (
    <header className="z-100">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between p-6"
        aria-label="Global"
      >
        <Link href="/">
          <div className="flex lg:flex-1">
            <Image
              alt="Llama Workspace logo"
              src="/images/llama-workspace-logo-black-square.svg"
              width="72"
              height="72"
              className="h-12 self-center md:h-16"
            />
          </div>
        </Link>
        <div className="hidden lg:flex lg:gap-x-12"></div>
        <div className="hidden items-center space-x-2 lg:flex lg:flex-1 lg:justify-end">
          <Link
            href="/pricing"
            className="inline-flex items-center rounded-full px-4 py-1  text-sm leading-6 text-zinc-900 hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
          >
            Pricing
          </Link>
          <Link
            href="https://docs.llamaworkspace.ai"
            className="inline-flex items-center rounded-full px-4 py-1  text-sm leading-6 text-zinc-900 hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
          >
            <BookOpenIcon className="mr-2 h-4 w-4" />
            Docs
          </Link>

          <Link
            href="https://github.com/llamaworkspace/llamaworkspace"
            className="inline-flex items-center rounded-full px-4 py-1  text-sm  leading-6 text-zinc-900 hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
          >
            <GitHubLogoIcon className="mr-2" />
            Github
          </Link>
          <div className="px-2 text-zinc-500">|</div>
          <Link
            href="/p"
            className="rounded-full px-4 py-1 text-sm font-semibold leading-6 text-zinc-900  hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
          >
            Sign-in <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </nav>
    </header>
  )
}
