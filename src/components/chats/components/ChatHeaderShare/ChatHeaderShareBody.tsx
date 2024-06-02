import { useAppShare } from '@/components/apps/postsHooks'
import type { ComponentWithAppId } from '@/components/apps/postsTypes'
import { Separator } from '@/components/ui/separator'
import { ShareScope } from '@/shared/globalTypes'
import { ChatHeaderShareHandleUsers } from './ChatHeaderShareHandleUsers'
import { ChatHeaderShareWhoCanAccess } from './ChatHeaderShareWhoCanAccess'

export const ChatHeaderShareBody = ({ appId }: ComponentWithAppId) => {
  const { data: share } = useAppShare(appId)

  return (
    <div>
      <ChatHeaderShareWhoCanAccess appId={appId} />
      {share?.scope === ShareScope.User && (
        <>
          <Separator className="my-4" />
          <div className="mt-4x">
            <ChatHeaderShareHandleUsers appId={appId} />
          </div>
        </>
      )}
    </div>
  )
}
