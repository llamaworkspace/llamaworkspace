import { useCreateSharedChat } from '@/components/chats/chatHooks'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid'
import type { Post } from '@prisma/client'
import { Emoji } from 'emoji-picker-react'

interface AppsListRowProps {
  post: Post
  onRowDelete: (postId: string) => void
}

export const AppsListRow = ({ post, onRowDelete }: AppsListRowProps) => {
  const { mutate: createChat } = useCreateSharedChat()

  const handleCreateChat = () => {
    createChat({ postId: post.id })
  }

  const handleDelete = () => {
    onRowDelete(post.id)
  }

  return (
    <>
      <div
        onClick={handleCreateChat}
        className={cn(
          'group grid grid-cols-12 border-b border-b-zinc-200 py-3',
          'cursor-pointer transition delay-0 duration-75 hover:bg-zinc-100 ',
        )}
      >
        <div className="flex items-start justify-center">
          <div className="col-span-2 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-50">
            <Emoji unified={Math.random() > 0.5 ? '2728' : '1f984'} size={24} />
          </div>
        </div>
        <div className="col-span-9 flex flex-col justify-center">
          <div className=" font-semibold">{post.title ?? 'Untitled'}</div>

          {/* <div className="line-clamp-2 text-sm">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Odio fugit
          incidunt accusantium, minima, eligendi accusamus magnam non reiciendis
          voluptate quam a nam modi nesciunt cupiditate sequi eos, facere
          veritatis dolor?
        </div> */}
        </div>
        <div className="col-span-2 flex items-center justify-end gap-x-2 pr-2">
          <div
            className={cn(
              'flex h-8 w-8 transform items-center justify-center rounded opacity-0 duration-100',
              'group-hover:opacity-100',
            )}
          >
            <PencilSquareIcon className="h-5 w-5" />
          </div>
          <div
            className={cn(
              'flex h-8 w-8 transform items-center justify-center rounded duration-100',
              'hover:bg-zinc-200',
            )}
          >
            <EllipsisDropdown onDelete={handleDelete} />
          </div>
        </div>
      </div>
    </>
  )
}

interface EllipsisDropdownProps {
  onDelete: () => void
}

const EllipsisDropdown = ({ onDelete }: EllipsisDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          onClick={(ev) => {
            ev.stopPropagation()
          }}
          className="flex h-8 w-8 transform items-center justify-center rounded duration-100 hover:bg-zinc-200"
        >
          <EllipsisHorizontalIcon className="h-6 w-6" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem
          onClick={(ev) => {
            ev.stopPropagation()
            onDelete()
          }}
          className="pepe"
        >
          <TrashIcon className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
