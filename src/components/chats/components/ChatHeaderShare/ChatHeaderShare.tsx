import { useCanExecuteActionForPost } from '@/components/permissions/permissionsHooks'
import type { ComponentWithPostId } from '@/components/posts/postsTypes'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { ChatHeaderSharePopoverContent } from './ChatHeaderSharePopoverContent'

export const ChatHeaderShare = ({ postId }: ComponentWithPostId) => {
  const { can: canShare } = useCanExecuteActionForPost(
    PermissionAction.Share,
    postId,
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
            <ChatHeaderSharePopoverContent postId={postId} />
          </PopoverContent>
        </div>
      </div>
    </Popover>
  )
}
