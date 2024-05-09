import { usePostShare } from '@/components/posts/postsHooks'
import type { ComponentWithPostId } from '@/components/posts/postsTypes'
import { Separator } from '@/components/ui/separator'
import { ShareScope } from '@/shared/globalTypes'
import { ChatHeaderShareHandleUsers } from './ChatHeaderShareHandleUsers'
import { ChatHeaderShareWhoCanAccess } from './ChatHeaderShareWhoCanAccess'

export const ChatHeaderShareBody = ({ postId }: ComponentWithPostId) => {
  const { data: share } = usePostShare(postId)

  return (
    <div>
      <ChatHeaderShareWhoCanAccess postId={postId} />
      {share?.scope === ShareScope.User && (
        <>
          <Separator className="my-4" />
          <div className="mt-4x">
            <ChatHeaderShareHandleUsers postId={postId} />
          </div>
        </>
      )}
    </div>
  )
}
