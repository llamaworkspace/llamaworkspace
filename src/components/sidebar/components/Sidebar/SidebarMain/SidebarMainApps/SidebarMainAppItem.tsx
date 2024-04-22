import { useCreateSharedChat } from '@/components/chats/chatHooks'
import { EMPTY_POST_NAME } from '@/components/posts/postsConstants'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { Emoji } from 'emoji-picker-react'
import { SidebarMainItemShell } from './SidebarMainItemShell'

interface AppItemProps {
  postId: string
  title: string | null
}

export const SidebarMainAppItem = ({ postId, title }: AppItemProps) => {
  const navigation = useNavigation()
  const { mutate: createChat } = useCreateSharedChat()
  const isActive = navigation.query.post_id === postId

  return (
    <SidebarMainItemShell
      title={title ?? EMPTY_POST_NAME}
      isActive={isActive}
      icon={
        <Emoji unified={Math.random() > 0.5 ? '2728' : '1f984'} size={24} />
      }
      onClick={() => createChat({ postId })}
    />
  )

  // return (
  //   <div>
  //     <div
  //       className={cn(
  //         'flex w-full grow basis-0 cursor-pointer items-center  justify-between gap-2 gap-x-2 rounded px-2 py-2 text-[14px] font-bold text-zinc-950 transition hover:bg-zinc-200/80 active:bg-zinc-300',
  //         isActive && 'bg-zinc-200',
  //       )}
  //       onClick={() => createChat({ postId })}
  //     >
  //       <div className="w-[24px] min-w-[24px]">
  //         <Emoji unified={Math.random() > 0.5 ? '2728' : '1f984'} size={24} />
  //       </div>
  //       <span className="line-clamp-1 grow ">
  //         {title ? title : EMPTY_POST_NAME}
  //       </span>
  //       <div className="w-[20px]">
  //         <PencilSquareIcon className="h-5 w-5 text-zinc-950" />
  //       </div>
  //     </div>
  //   </div>
  // )
}
