import { useDeletePost } from '@/components/posts/postsHooks'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { EllipsisHorizontalIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useState, type MouseEventHandler } from 'react'

interface SidebarDesktopLineItemDropdownProps {
  postId: string
  isHovered: boolean
}

export function SidebarDesktopLineItemDropdown({
  postId,
  isHovered,
}: SidebarDesktopLineItemDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { mutate: deletePost } = useDeletePost()

  // Prevents the <Link> above in the DOM from firing
  const handlePreventPropagation: MouseEventHandler<HTMLDivElement> = (
    event,
  ) => {
    event.stopPropagation()
  }

  const handleDelete = () => {
    void deletePost({ id: postId })
  }

  const handleShare = () => {
    // Todo: Do
    console.log('share me')
  }
  const handleDuplicate = () => {
    // Todo: Do
    console.log('dupl me')
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
      <DropdownMenuTrigger asChild>
        <div
          className={cn(
            'h-5 w-5 transform rounded duration-200',
            isHovered || isOpen ? 'opacity-100 hover:bg-zinc-200' : 'opacity-0',
          )}
        >
          <EllipsisHorizontalIcon className="h-5 w-5" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {/* <DropdownMenuGroup>
          <DropdownMenuItem onSelect={handleDuplicate}>
            <DocumentDuplicateIcon className="mr-2 h-4 w-4" />
            <span>Duplicate</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleShare}>
            <ShareIcon className="mr-2 h-4 w-4" />
            <span>Share</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator /> */}
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={handlePreventPropagation}
            onSelect={handleDelete}
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
