import { EMPTY_APP_NAME } from '@/components/apps/appsConstants'
import { useAppById } from '@/components/apps/appsHooks'
import { LegacyJoiaIcon24 } from '@/components/ui/icons/LegacyJoiaIcon'
import { Skeleton } from '@/components/ui/skeleton'
import { Emoji } from 'emoji-picker-react'

export const ChatHeaderAppTitle = ({ appId }: { appId?: string }) => {
  const { data: app, isLoading } = useAppById(appId)

  if (isLoading) {
    return <Skeleton className="h-5 w-96" />
  }

  return (
    <div className="flex w-full items-center gap-x-1 text-zinc-900">
      <div className="relative text-xl">
        <div>
          {app?.emoji ? (
            <div className="w-12">
              <Emoji unified={app.emoji} size={36} />
            </div>
          ) : (
            <div className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center text-[1.1rem] text-zinc-300">
              <LegacyJoiaIcon24 />
            </div>
          )}
        </div>
      </div>
      <div className="line-clamp-1 text-lg font-bold tracking-tight md:text-xl">
        {app?.title ?? EMPTY_APP_NAME}
      </div>
    </div>
  )
}
