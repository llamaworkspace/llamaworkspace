import { cn } from '@/lib/utils'
import Head from 'next/head'
import { type PropsWithChildren } from 'react'
import { useGlobalState } from '../global/globalState'
import { EMPTY_POST_NAME } from '../posts/postsConstants'
import { usePostById } from '../posts/postsHooks'
import { Sidebar } from '../sidebar/Sidebar'
import {
  MainLayoutHeader,
  type HeaderVariants,
} from './MainLayout/MainLayoutHeader'
import { MainLayoutSessionChecker } from './MainLayoutSessionChecker'

interface MainLayoutProps extends PropsWithChildren {
  postId?: string
  chatId?: string
  hideHeader?: boolean
  variant: HeaderVariants
}

export function MainLayout({
  postId,
  chatId,
  children,
  variant,
}: MainLayoutProps) {
  const { data: post } = usePostById(postId)
  const { state } = useGlobalState()
  const { isDesktopSidebarOpen } = state

  const postTitle = post && (post.title ?? EMPTY_POST_NAME)
  const head = post ? `${postTitle} | Joia` : 'Joia'

  // IMPORTANT: Keep this key prop, it forces re-renders that otherwise
  // would not happen when navigating between posts.
  return (
    <MainLayoutSessionChecker key={postId}>
      <Head>
        <title>{head}</title>
      </Head>
      <Sidebar />
      <div
        className={cn(
          'transition-spacing h-full duration-200 ease-out ',
          isDesktopSidebarOpen && 'lg:pl-72',
        )}
      >
        <div className="flex h-full w-full min-w-[300px] flex-1 flex-col overflow-hidden">
          <MainLayoutHeader postId={postId} chatId={chatId} variant={variant} />

          {children}
        </div>
      </div>
    </MainLayoutSessionChecker>
  )
}
