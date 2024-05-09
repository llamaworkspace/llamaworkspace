import { useCanExecuteActionForPost } from '@/components/permissions/permissionsHooks'
import type { ComponentWithPostId } from '@/components/posts/postsTypes'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { ChatHeaderShareBody } from './ChatHeaderShareBody'

export const ChatHeaderShare = ({ postId }: ComponentWithPostId) => {
  const { can: canShare } = useCanExecuteActionForPost(
    PermissionAction.Share,
    postId,
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Share</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share GPT</DialogTitle>
          <DialogDescription>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          </DialogDescription>
        </DialogHeader>
        <ChatHeaderShareBody postId={postId} />
      </DialogContent>
    </Dialog>
  )

  return (
    <Popover>
      <div>
        {canShare && (
          <Button size="sm" variant="ghost" className="text-sm" asChild>
            <PopoverTrigger className="cursor-pointer font-medium">
              Share
            </PopoverTrigger>
          </Button>
        )}

        <div className="relative z-50 text-sm">
          <PopoverContent align="end" className="w-[500px]">
            <ChatHeaderShareBody postId={postId} />
          </PopoverContent>
        </div>
      </div>
    </Popover>
  )
}
