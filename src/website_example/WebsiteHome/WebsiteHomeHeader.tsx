import Image from 'next/image'
import Link from 'next/link'

export function WebsiteHomeHeader() {
  // const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
      <header className="z-100">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
          aria-label="Global"
        >
          <div className="flex lg:flex-1">
            <Image
              className="h-6 w-auto"
              src="/images/joia_logo_red.svg"
              alt="Joia"
              width="38"
              height="32"
            />
          </div>
          <div className="flex lg:hidden">
            <Link
              href="/p"
              className="rounded-full bg-zinc-900 px-4 py-1 text-sm font-semibold leading-6  text-white hover:bg-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
            >
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
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
          <div className="hidden space-x-2 lg:flex lg:flex-1 lg:justify-end">
            <Link
              href="/auth/signin"
              className="rounded-full px-4 py-1 text-sm font-semibold leading-6 text-zinc-900  hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
            >
              Sign up
            </Link>
            <Link
              href="/p"
              className="rounded-full bg-zinc-900 px-4 py-1 text-sm font-semibold leading-6 text-white  hover:bg-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
            >
              Log in <span aria-hidden="true">&rarr;</span>
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
