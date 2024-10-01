import { AnalyticsProvider } from '@/components/global/clientAnalytics'
import { WebsiteHomeFooter } from '@/website/WebsiteHome/WebsiteHomeFooter'
import { WebsiteHomeHeader } from '@/website/WebsiteHome/WebsiteHomeHeader'
import Image from 'next/image'
import type { PropsWithChildren } from 'react'

interface BlogLayoutProps extends PropsWithChildren {
  title: string
  postDate?: string
  hideAuthor?: boolean
}

export const BlogLayout = ({
  title,
  postDate,
  children,
  hideAuthor = false,
}: BlogLayoutProps) => {
  return (
    <AnalyticsProvider trackPageViews>
      <div className="relative isolate overflow-hidden ">
        <WebsiteHomeHeader />
        <div className="prose prose-zinc relative isolate mx-auto my-16 min-h-[400px] max-w-3xl overflow-hidden  px-4 prose-headings:tracking-tight prose-h1:text-2xl prose-h1:!leading-tight prose-h1:tracking-tighter prose-h1:text-zinc-800 prose-p:text-lg prose-p:leading-relaxed prose-p:text-zinc-900 prose-ul:text-lg prose-ul:leading-relaxed prose-ul:text-zinc-900 sm:prose-h1:text-5xl md:px-0 md:prose-h2:text-3xl">
          <div>
            <h1 className="mb-4 font-semibold">{title}</h1>
            <div className="flex items-center gap-x-3 text-sm text-zinc-600">
              {!hideAuthor && (
                <div>
                  <Image
                    className="m-0 rounded-full"
                    src="https://assets.llamaworkspace.ai/isaac_mayolas_profile_photo_2024_squared.png"
                    alt="Isaac Mayolas profle photo"
                    width="48"
                    height="48"
                  />
                </div>
              )}
              <div>
                {!hideAuthor && <div>Isaac Mayolas</div>}
                {postDate && <div className="text-zinc-400">{postDate}</div>}
              </div>
            </div>
          </div>

          {children}
        </div>
        <WebsiteHomeFooter />
      </div>
    </AnalyticsProvider>
  )
}
