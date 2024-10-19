import { cn } from '@/lib/utils'
import Head from 'next/head'
import { type PropsWithChildren } from 'react'
import { EMPTY_APP_NAME } from '../apps/appsConstants'
import { useAppById } from '../apps/appsHooks'
import { useChatById } from '../chats/chatHooks'
import { AnalyticsProvider } from '../global/clientAnalytics'
import { useGlobalState } from '../global/globalState'
import { OnboardingCompletedChecker } from '../onboarding/components/OnboardingCompletedChecker'
import { Sidebar } from '../sidebar/components/Sidebar/Sidebar'
import {
  MainLayoutHeader,
  type HeaderVariants,
} from './MainLayout/MainLayoutHeader'
import { MainLayoutSessionChecker } from './MainLayoutSessionChecker'

interface MainLayoutProps extends PropsWithChildren {
  appId?: string
  chatId?: string
  hideHeader?: boolean
  variant: HeaderVariants
}

export function MainLayout({
  appId,
  chatId,
  children,
  variant,
}: MainLayoutProps) {
  const { data: app } = useAppById(appId)
  const { data: chat } = useChatById(chatId)
  const { state } = useGlobalState()
  const { isDesktopSidebarOpen } = state

  let appTitle = ''

  if (app) {
    if (app.isDefault) {
      if (chat && chat.title) {
        appTitle = `${chat.title} | Llama Workspace`
      } else {
        appTitle = 'Llama Workspace'
      }
    } else if (app.title) {
      appTitle = `${app.title} | Llama Workspace`
    } else {
      appTitle = `${EMPTY_APP_NAME} | Llama Workspace`
    }
  }
  // IMPORTANT: Keep this key prop, it forces re-renders that otherwise
  // would not happen when navigating between apps.
  return (
    <MainLayoutSessionChecker key={appId}>
      <Head>
        <title>{appTitle}</title>
      </Head>
      <AnalyticsProvider trackPageViews identifyUser>
        <OnboardingCompletedChecker />
        <Sidebar />
        <div
          className={cn(
            'transition-spacing h-full duration-200 ease-out ',
            isDesktopSidebarOpen && 'lg:pl-72',
          )}
        >
          <div className="relative flex h-full w-full min-w-[300px] flex-1 flex-col overflow-hidden">
            <MainLayoutHeader appId={appId} chatId={chatId} variant={variant} />
            <SidebarToggler />
            {children}
          </div>
        </div>
      </AnalyticsProvider>
    </MainLayoutSessionChecker>
  )
}

const SidebarToggler = () => {
  const { toggleDesktopSidebar, state } = useGlobalState()
  const { isDesktopSidebarOpen } = state
  return (
    <div className="absolute  hidden h-full items-center pl-1 lg:flex">
      <button
        onClick={toggleDesktopSidebar}
        className="group z-40 flex h-6 w-6 cursor-pointer flex-col items-center "
      >
        <div
          className={cn(
            'h-3 w-1 translate-y-[0.12rem] rounded-full bg-zinc-300 transition  group-hover:bg-zinc-900',
            isDesktopSidebarOpen && 'group-hover:rotate-[15deg]',
            !isDesktopSidebarOpen && 'rotate-[-15deg]',
          )}
        ></div>
        <div
          className={cn(
            'h-3 w-1 translate-y-[-0.12rem] rounded-full bg-zinc-300 transition group-hover:bg-zinc-900',
            isDesktopSidebarOpen && 'group-hover:rotate-[-15deg]',
            !isDesktopSidebarOpen && 'rotate-[15deg]',
          )}
        ></div>
      </button>
    </div>
  )
}
