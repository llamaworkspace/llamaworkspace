import { useCreatePrivateChat } from '@/components/chats/chatHooks'
import { Button } from '@/components/ui/button'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { DocumentIcon } from '@heroicons/react/24/outline'
import { useStandaloneChats } from '../../sidebarHooks'
import { SidebarMobileLineItemForSingleChat } from './SidebarMobileLineItemForSingleChat'

export const SidebarMobileChatsSection = () => {
  const { data: standaloneChats } = useStandaloneChats()
  const { mutate: createStandaloneChat } = useCreatePrivateChat()
  const navigation = useNavigation()
  return (
    <li>
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase leading-6 text-zinc-400">
          Private chats
        </div>
        <div>
          <Button
            variant="outline"
            size="xs"
            onClick={() => void createStandaloneChat()}
          >
            <DocumentIcon className="-ml-0.5 h-3 w-3" />
          </Button>
        </div>
      </div>
      <ul role="list" className="-mx-2 mt-2 space-y-1">
        {standaloneChats && !standaloneChats.length && (
          <div className="mt-1 px-2 py-1 text-[0.84rem] italic text-zinc-400">
            No private chats yet. Go on and create one.
          </div>
        )}
        {standaloneChats?.slice(0, 6).map((chat) => {
          const isCurrent = navigation.query.chat_id === chat.id
          return (
            <SidebarMobileLineItemForSingleChat
              isCurrent={isCurrent}
              href={`/c/${chat.id}`}
              title={chat.title ?? 'Untitled chat'}
              key={chat.id}
            />
          )
        })}
      </ul>
    </li>
  )
}
