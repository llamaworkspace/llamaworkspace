import { useGlobalState } from '@/components/global/globalState'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { Dialog, Transition } from '@headlessui/react'
import {
  Cog6ToothIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'
import { Fragment } from 'react'
import { SidebarMobileChatBotsSection } from './sidebarMobile/SidebarMobileChatBotsSection'
import { SidebarMobileChatsSection } from './sidebarMobile/SidebarMobileChatsSection'

export function SidebarMobile() {
  const { state, toggleMobileSidebar } = useGlobalState()
  const isOpen = state.isMobileSidebarOpen
  const { workspace } = useCurrentWorkspace()
  const profileLink = workspace?.id ? `/w/${workspace.id}/profile` : '#'
  const settingsLink = workspace?.id ? `/w/${workspace.id}/settings` : '#'
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50 lg:hidden"
        onClose={toggleMobileSidebar}
      >
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
              {/* Sidebar component, swap this element with another sidebar if you like */}
              <div className="flex grow flex-col gap-1 overflow-y-auto bg-white px-6 pb-4 md:gap-y-5">
                <div className="flex h-16 shrink-0 items-center">
                  <Image
                    className="h-6 w-auto"
                    src="/images/joia_logo_red.svg"
                    alt="Joia"
                    width="38"
                    height="32"
                  />
                </div>
                <nav className="flex flex-1 flex-col">
                  <Alert variant="fuchsia" className="mb-4">
                    <AlertDescription>
                      This sidebar still has limited functionality. Use the
                      desktop version for a complete experience.
                    </AlertDescription>
                  </Alert>

                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <SidebarMobileChatsSection />
                    <SidebarMobileChatBotsSection />

                    <li className="mt-auto">
                      <Link
                        href={settingsLink}
                        className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-zinc-700 hover:bg-zinc-50 hover:text-indigo-600"
                      >
                        <Cog6ToothIcon
                          className="h-6 w-6 shrink-0 text-zinc-400 group-hover:text-indigo-600"
                          aria-hidden="true"
                        />
                        Workspace settings
                      </Link>
                      <Link
                        href={profileLink}
                        className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-zinc-700 hover:bg-zinc-50 hover:text-indigo-600"
                      >
                        <UserCircleIcon
                          className="h-6 w-6 shrink-0 text-zinc-400 group-hover:text-indigo-600"
                          aria-hidden="true"
                        />
                        Profile
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
