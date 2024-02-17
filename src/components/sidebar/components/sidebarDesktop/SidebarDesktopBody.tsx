import { useCreatePrivateChat } from '@/components/chats/chatHooks'
import { EMPTY_POST_NAME } from '@/components/posts/postsConstants'
import { useCreatePost } from '@/components/posts/postsHooks'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { cn } from '@/lib/utils'
import {
  ArrowUturnLeftIcon,
  DocumentIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { usePostsForSidebar, useStandaloneChats } from '../../sidebarHooks'
import { SidebarDesktopInfoCards } from './SidebarDesktopInfoCards'
import { SidebarDesktopLineItemForChatApp } from './SidebarDesktopLineItemForChatApp'
import { SidebarDesktopLineItemForSingleChat } from './SidebarDesktopLineItemForSingleChat'

export function SidebarDesktopBody() {
  const { mutate: createPost } = useCreatePost()
  const { mutate: createStandaloneChat } = useCreatePrivateChat()
  const { data: standaloneChats } = useStandaloneChats()
  const { workspace } = useCurrentWorkspace()
  // Unless needed, replace for something else that is not sortedPosts
  // maybe an ad-hoc query!
  const { sortedPosts } = usePostsForSidebar(workspace?.id)
  const navigation = useNavigation()

  const [seeMore, setSeeMore] = useState(false)

  const handleCreateStandaloneChat = () => {
    createStandaloneChat()
  }
  const handleCreatePost = () => {
    if (!workspace?.id) return
    createPost({ workspaceId: workspace.id })
  }

  const handleSeeMore = () => {
    setSeeMore(!seeMore)
  }

  const zeroSortedPosts = sortedPosts?.length === 0
  const onlyDefaultPost = !!(
    sortedPosts?.length === 1 && sortedPosts[0]?.isDemo
  )

  return (
    <>
      <div className="relative flex grow overflow-y-auto">
        <nav className="absolute bottom-0 left-0 right-0 top-0 flex grow flex-col overflow-y-auto px-4 py-6">
          <ul className="flex flex-1 flex-col gap-y-7">
            <li>
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase leading-6 text-zinc-400">
                  Private chats
                </div>
                <div>
                  <Tooltip>
                    <TooltipTrigger disabled={!standaloneChats}>
                      <Button
                        disabled={!standaloneChats}
                        variant="outline"
                        size="xs"
                        onClick={handleCreateStandaloneChat}
                      >
                        <DocumentIcon className="-ml-0.5 h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Create a new chat</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <ul className="-mx-1 mt-1 overflow-auto">
                {standaloneChats?.slice(0, 3)?.map((chat) => {
                  return (
                    <SidebarDesktopLineItemForSingleChat
                      href={`/c/${chat.id}`}
                      title={chat.title ?? 'Untitled chat'}
                      key={chat.id}
                      id={chat.id}
                      isCurrent={navigation.query.chat_id === chat.id}
                    />
                  )
                })}
              </ul>
              {standaloneChats && standaloneChats.length === 0 && (
                <div className="mt-1 text-[0.84rem] italic text-zinc-400">
                  No private chats yet. Go on and create one.
                </div>
              )}
              {standaloneChats && standaloneChats.length > 3 && (
                <div className="mt-1 cursor-pointer font-semibold text-zinc-600 ">
                  <Button
                    variant="link"
                    size="paddingless"
                    className="text-[0.82rem]"
                    onClick={handleSeeMore}
                  >
                    See more
                  </Button>
                </div>
              )}
            </li>

            <li>
              <div className="flex items-center justify-between">
                <div className="flex items-center leading-6">
                  <div className=" text-xs font-semibold uppercase text-zinc-400">
                    Shared Chatbots{' '}
                  </div>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild disabled={!standaloneChats}>
                      <div className="flex">
                        <InformationCircleIcon className="ml-1 inline h-4 w-4 text-zinc-400" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm" align="start">
                      Chatbots are accessible to everyone in the workspace, but
                      your conversations remain private to you.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div>
                  <Tooltip>
                    <TooltipTrigger disabled={!standaloneChats}>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={handleCreatePost}
                      >
                        <DocumentIcon className="-ml-0.5 h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Create a chatbot that everyone in your workspace can use
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <ul className="-mx-2 mt-1">
                {sortedPosts?.map((post, index) => {
                  const href = post.firstChatId
                    ? `/p/${post.id}/c/${post.firstChatId}`
                    : `/p/${post.id}/c/new`
                  return (
                    <SidebarDesktopLineItemForChatApp
                      key={post.id}
                      postId={post.id}
                      workspaceId={workspace?.id}
                      currentChatId={navigation.query.chat_id as string}
                      href={href}
                      title={post.title ?? EMPTY_POST_NAME}
                      emoji={post.emoji}
                      isCurrent={navigation.query.post_id === post.id}
                      showDroppableBefore={index === 0}
                    />
                  )
                })}
              </ul>
              {zeroSortedPosts && (
                <div className="mt-1 text-[0.84rem] italic text-zinc-400">
                  You have no chatbots yet
                </div>
              )}
              {(zeroSortedPosts || onlyDefaultPost) && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCreatePost}
                  >
                    Create your first chatbot
                  </Button>
                </div>
              )}
            </li>
          </ul>
        </nav>

        <nav
          className={cn(
            'absolute bottom-0 left-0 right-0 top-2 flex grow flex-col overflow-y-auto border bg-white px-4 py-4 pl-5 shadow-md transition ease-out',
            !seeMore ? 'translate-x-[-300px]' : 'translate-x-[-8px]',
          )}
        >
          <ul className="flex flex-1 flex-col gap-y-4">
            <li>
              <Button
                className="ml-0.5 px-2 py-1 text-xs"
                size="paddingless"
                variant="outline"
                onClick={handleSeeMore}
              >
                <ArrowUturnLeftIcon className="mr-2 h-2 w-2" /> Back
              </Button>
            </li>
            <li>
              <div className="ml-1 text-xs font-semibold uppercase leading-6 text-zinc-400">
                Chats
              </div>
              <ul className="mt-2 overflow-auto">
                {standaloneChats?.map((chat) => {
                  return (
                    <SidebarDesktopLineItemForSingleChat
                      id={chat.id}
                      href={`/c/${chat.id}`}
                      title={chat.title ?? 'Untitled chat'}
                      key={chat.id}
                      isCurrent={navigation.query.chat_id === chat.id}
                    />
                  )
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
      <SidebarDesktopInfoCards />
    </>
  )
}
