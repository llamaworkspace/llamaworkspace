import { BookOpenIcon } from '@heroicons/react/24/outline'
import { GitHubLogoIcon } from '@radix-ui/react-icons'
import Image from 'next/image'
import Link from 'next/link'

export function WebsiteHomeHeader() {
  return (
    <>
      <header className="z-100">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
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
          <div className="flex lg:hidden">
            {/* <Link
              href="/p"
              className="rounded-full px-4 py-1 text-sm font-semibold leading-6 text-zinc-900  hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
            >
              Open beta access <span aria-hidden="true">&rarr;</span>
            </Link> */}
            {/* <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-slate-700"
              // onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button> */}
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {/* <a
            href="#"
            className="text-sm font-semibold leading-6 text-slate-600"
          >
            Features
          </a>
          <a
            href="#"
            className="text-sm font-semibold leading-6 text-slate-600"
          >
            Marketplace
          </a>
          <a
            href="#"
            className="text-sm font-semibold leading-6 text-slate-600"
          >
            Company
          </a> */}
          </div>
          <div className="hidden items-center space-x-2 lg:flex lg:flex-1 lg:justify-end">
            <Link
              href="https://docs.llamaworkspace.ai"
              className="inline-flex items-center rounded-full px-4 py-1  text-sm leading-6 text-zinc-900 hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
            >
              <BookOpenIcon className="mr-2 h-4 w-4" />
              Docs
            </Link>
            <Link
              href="https://github.com/imayolas/joia"
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
              Open beta sign-in <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>
        {/* <Dialog
          as="div"
          className="lg:hidden"
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
        >
          <div className="fixed inset-0 z-10" />
          <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-slate-900/10">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Your Company</span>
                <img
                  className="h-6 w-auto"
                  src="/images/joia_logo_red.svg"
                  alt="Joia"
                  width="47"
                  height="40"
                />
              </a>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-slate-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-slate-500/10">
                <div className="py-6">
                  <Link
                    href="/auth/signin"
                    className="rounded-full bg-zinc-600 px-4 py-1 text-sm font-semibold leading-6 text-white hover:bg-zinc-500"
                  >
                    Log in <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Dialog> */}
      </header>
    </>
  )
}
