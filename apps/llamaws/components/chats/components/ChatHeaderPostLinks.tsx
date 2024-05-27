import { Cog6ToothIcon } from '@heroicons/react/24/outline'
import { Cog6ToothIcon as Cog6ToothIconSolid } from '@heroicons/react/24/solid'
import { TabEnum, getTabForRoute } from 'components/posts/postsNavigation'
import { Skeleton } from 'components/ui/skeleton'
import { useNavigation } from 'lib/frontend/useNavigation'
import { cn } from 'lib/utils'
import Link from 'next/link'
import { ChatHeaderShare } from './ChatHeaderShare/ChatHeaderShare'

interface ChatHeaderPostLinksProps {
  postId?: string
  chatId?: string
}

export const ChatHeaderPostLinks = ({
  postId,
  chatId,
}: ChatHeaderPostLinksProps) => {
  const navigation = useNavigation()

  const activeTab = getTabForRoute(navigation.route)

  const chatLink = postId && chatId ? `/p/${postId}/c/${chatId}` : '#'
  const configLink =
    postId && chatId ? `/p/${postId}/c/${chatId}/configuration` : '#'

  return (
    <nav className="flex items-center gap-x-4 text-sm text-zinc-900">
      {!postId && <Skeleton className="h-3 w-36" />}
      {postId && (
        <>
          <ul className="flex items-center gap-x-4">
            <li>
              <ChatHeaderShare postId={postId} />
            </li>
            <Link
              href={activeTab === TabEnum.Configuration ? chatLink : configLink}
            >
              <li>
                <div
                  className={cn(
                    'cursor-pointer rounded-full border border-zinc-200 bg-transparent p-1.5 shadow-sm hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-50',
                    activeTab === TabEnum.Configuration
                      ? 'border-zinc-600 bg-zinc-200'
                      : 'border-zinc-300',
                  )}
                >
                  {activeTab === TabEnum.Configuration ? (
                    <Cog6ToothIconSolid className="h-5 w-5 text-zinc-900" />
                  ) : (
                    <Cog6ToothIcon className="h-5 w-5 text-zinc-700" />
                  )}
                </div>
              </li>
            </Link>
          </ul>
        </>
      )}
    </nav>
  )
}
