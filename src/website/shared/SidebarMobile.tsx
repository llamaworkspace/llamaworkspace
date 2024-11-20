import { useGlobalState } from '@/components/global/globalState'
import { Button } from '@/components/ui/button'
import { Dialog, Transition } from '@headlessui/react'
import { BookOpenIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { GitHubLogoIcon } from '@radix-ui/react-icons'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Fragment } from 'react'

export function SidebarMobile() {
  const { state, toggleMobileSidebar } = useGlobalState()
  const isOpen = state.isMobileSidebarOpen

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={toggleMobileSidebar}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-zinc-900/80" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <button
                    type="button"
                    className="-m-2.5 p-2.5"
                    onClick={() => toggleMobileSidebar()}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </Transition.Child>
              <SidebarContent />
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
function SidebarContent() {
  const router = useRouter()

  const handleSignIn = () => {
    router.push('/auth/signin')
  }

  return (
    <div className="flex grow flex-col gap-y-6 bg-white p-6">
      <Link href="/">
        <div className="flex">
          <Image
            alt="Llama Workspace logo"
            src="/images/llama-workspace-logo-black-square.svg"
            width="72"
            height="72"
            className="h-12 self-center"
          />
        </div>
      </Link>
      <div className="flex flex-col space-y-2">
        <Link
          href="/pricing"
          className="inline-flex items-center rounded-full px-4 py-2 text-sm leading-6 text-zinc-900 hover:bg-zinc-100"
        >
          Pricing
        </Link>
        <Link
          href="https://docs.llamaworkspace.ai"
          className="inline-flex items-center rounded-full px-4 py-2 text-sm leading-6 text-zinc-900 hover:bg-zinc-100"
        >
          <BookOpenIcon className="mr-2 h-4 w-4" />
          Docs
        </Link>
        <Link
          href="https://github.com/llamaworkspace/llamaworkspace"
          className="inline-flex items-center rounded-full px-4 py-2 text-sm leading-6 text-zinc-900 hover:bg-zinc-100"
        >
          <GitHubLogoIcon className="mr-2" />
          Github
        </Link>
      </div>{' '}
      <Link href="/auth/signin">
        <Button onClick={() => void handleSignIn()}>
          Sign up / Log in
          <span aria-hidden="true" className="ml-1">
            &rarr;
          </span>
        </Button>
      </Link>
    </div>
  )
}
