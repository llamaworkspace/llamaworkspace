import type { ComponentWithAppId } from '@/components/apps/appsTypes'
import { useCanPerformActionForApp } from '@/components/permissions/permissionsHooks'
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

export const ChatHeaderShare = ({ appId }: ComponentWithAppId) => {
  const { data: canInvite, isLoading } = useCanPerformActionForApp(
    PermissionAction.Invite,
    appId,
  )

  const tooltipOpenBlocker = isLoading ? false : undefined

  const button = <Button variant="ghost">Share</Button>
  const tooltip = (
    <div>
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
          <p>You do not have sharing permissions for this app.</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )

  return (
    <Dialog>
      <DialogTrigger asChild>{canInvite ? button : tooltip}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share app access</DialogTitle>
          <DialogDescription>
            Invite team members to use this app. Note that only usage access is
            granted, and individual chats are never shared.
          </DialogDescription>
        </DialogHeader>
        <div className="-mx-3 max-h-[400px] overflow-y-auto ">
          <div className="mx-3">
            <ChatHeaderShareBody appId={appId} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
