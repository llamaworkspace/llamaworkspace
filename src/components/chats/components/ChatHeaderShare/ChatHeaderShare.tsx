import { useCanPerformActionForPost } from '@/components/permissions/permissionsHooks'
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { ChatHeaderShareBody } from './ChatHeaderShareBody'

export const ChatHeaderShare = ({ postId }: ComponentWithPostId) => {
  const { data: canUse, isLoading } = useCanPerformActionForPost(
    PermissionAction.Invite,
    postId,
  )

  const tooltipOpenBlocker = isLoading ? false : undefined

  const button = <Button variant="ghost">Share</Button>
  const tooltip = (
    <Tooltip open={tooltipOpenBlocker}>
      <TooltipTrigger asChild>
        {/* Keep this div or the tooltip will fail when the button is disabled */}
        <div>
          <Button variant="ghost" disabled={true}>
            Share
          </Button>
        </div>
      </TooltipTrigger>
      {/* mr-2 ensures that the tooltip does not stick to the right of the browser */}
      <TooltipContent className="mr-2">
        <p>You do not have enough permissions to share this GPT.</p>
      </TooltipContent>
    </Tooltip>
  )

  return (
    <Dialog>
      <DialogTrigger asChild>{canUse ? button : tooltip}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share GPT access</DialogTitle>
          <DialogDescription>
            Invite team members to use this GPT. Note that only usage access is
            granted, and individual chats are never shared.
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
