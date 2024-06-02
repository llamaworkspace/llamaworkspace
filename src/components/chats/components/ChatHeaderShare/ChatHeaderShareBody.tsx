import { usePostShare } from '@/components/apps/postsHooks'
import type { ComponentWithPostId } from '@/components/apps/postsTypes'
import { Separator } from '@/components/ui/separator'
import { ShareScope } from '@/shared/globalTypes'
import { ChatHeaderShareHandleUsers } from './ChatHeaderShareHandleUsers'
import { ChatHeaderShareWhoCanAccess } from './ChatHeaderShareWhoCanAccess'

export const ChatHeaderShareBody = ({ appId }: ComponentWithPostId) => {
  const { data: share } = usePostShare(appId)

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
