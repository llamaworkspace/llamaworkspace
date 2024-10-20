import { useGlobalState } from '@/components/global/globalState'
import { Button } from '@/components/ui/button'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { Dialog, Transition } from '@headlessui/react'
import { BookOpenIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { GitHubLogoIcon } from '@radix-ui/react-icons'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { Fragment } from 'react'
import { WebsiteFAQs } from '../WebsiteFAQs'
import { WebsiteFooter } from '../WebsiteFooter'
import { WebsiteFooterCTA } from '../WebsiteFooterCTA'
import { WebsiteHeader } from '../WebsiteHeader'
import { WebsiteHomeFeatureApps } from './WebsiteHomeFeatureApps'
import { WebsiteHomeFeatureChatWithDocs } from './WebsiteHomeFeatureChatWithDocs'
import { WebsiteHomeFeatureIntegrations } from './WebsiteHomeFeatureIntegrations'
import { WebsiteHomeFeatureMultiModel } from './WebsiteHomeFeatureMultiModel'
import { WebsiteHomeValueForMoney } from './WebsiteHomeFeatureValueForMoney/WebsiteHomeValueForMoney'
import { WebsiteHomeHero } from './WebsiteHomeHero'
import WebsiteHomeLogos from './WebsiteHomeLogos'

export function WebsiteHome() {
  return (
    <>
      <Head>
        <title>
          Llama Workspace - Open Source ChatGPT Enterprise alternative.
        </title>
        <meta property="og:title" content="Open Source AI Assistant for work" />
        {/* <meta
          name="image"
          property="og:image"
          content="https://llamaworkspace.ai/images/2024-02/og_preview_feb_2024.png"
        /> */}
        <meta
          property="og:description"
          content="A ChatGPT Enterprise alternative that runs on any Large Language Model. On your infra or ours. All while helping you save up to 70% in subscription costs."
        />
        <meta property="og:url" content="//llamaworkspace.ai" />
      </Head>
      <div className="hidden">
        <SidebarThing />
      </div>

      <div className="relative isolate overflow-hidden bg-white">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="to-tr relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#fac3f1] to-[#c0c8f3] opacity-60 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <WebsiteHeader />

        <div className="space-y-32">
          <WebsiteHomeHero />
          <WebsiteHomeLogos />

          <div className="mb-32 space-y-24">
            <div className="mx-auto -mb-12 max-w-6xl px-6 lg:px-0">
              <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tighter text-zinc-900 sm:text-6xl ">
                AI superpowers for every employee.
              </h1>
            </div>
            <WebsiteHomeFeatureMultiModel />
            <WebsiteHomeFeatureApps />
            <WebsiteHomeFeatureChatWithDocs />
            <WebsiteHomeFeatureIntegrations />
            <WebsiteHomeValueForMoney />
          </div>

          <div className="mb-32">
            <WebsiteFAQs />
          </div>

          <WebsiteFooterCTA />
        </div>

        <WebsiteFooter />
      </div>
    </>
  )
}

function SidebarThing() {
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
  const navigation = useNavigation()

  const handleSignIn = () => {
    navigation.push('/auth/signin')
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
      <Link href="/auth/signup">
        <Button onClick={handleSignIn}>
          Sign up / Log in
          <span aria-hidden="true" className="ml-1">
            &rarr;
          </span>
        </Button>
      </Link>
    </div>
  )
}
