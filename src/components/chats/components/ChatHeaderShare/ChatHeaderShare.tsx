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
        <div className="-mx-3 max-h-[400px] overflow-y-auto ">
          <div className="mx-3">
            <ChatHeaderShareBody postId={postId} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
