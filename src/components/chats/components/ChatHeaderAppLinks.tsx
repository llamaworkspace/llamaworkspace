import { Skeleton } from '@/components/ui/skeleton'
import { AppOptionsDropdown } from '@/components/workspaces/components/Apps/AppOptionsDropdown'
import { cn } from '@/lib/utils'
import { ChatHeaderShare } from './ChatHeaderShare/ChatHeaderShare'

interface ChatHeaderAppLinksProps {
  appId?: string
  chatId?: string
}

export const ChatHeaderAppLinks = ({
  appId,
  chatId,
}: ChatHeaderAppLinksProps) => {
  return (
    <nav className="flex items-center gap-x-4 text-sm text-zinc-900">
      {!appId && <Skeleton className="h-3 w-36" />}
      {appId && (
        <>
          <ul className="flex items-center gap-x-4">
            <li>
              <ChatHeaderShare appId={appId} />
            </li>

            <li>
              <div
                className={cn(
                  'flex h-8 w-8 transform cursor-pointer items-center justify-center rounded duration-100',
                  'hover:bg-zinc-200',
                )}
              >
                <AppOptionsDropdown
                  appId={appId}
                  fromChatId={chatId}
                  canDelete={true}
                  onDuplicate={() => console.log('duplicate')}
                  canDuplicate={true}
                  onDeleteSuccessRedirectTo={`/p`}
                />
              </div>
            </li>
          </ul>
        </>
      )}
    </nav>
  )
}
