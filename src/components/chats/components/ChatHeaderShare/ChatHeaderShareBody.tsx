import type { ComponentWithPostId } from '@/components/posts/postsTypes'
import { Separator } from '@/components/ui/separator'
import { ChatHeaderShareHandleUsers } from './ChatHeaderShareHandleUsers'
import { ChatHeaderShareWhoCanAccess } from './ChatHeaderShareWhoCanAccess'

export const ChatHeaderShareBody = ({ postId }: ComponentWithPostId) => {
  return (
    <div>
      <ChatHeaderShareWhoCanAccess postId={postId} />
      <Separator className="my-4" />
      <ChatHeaderShareHandleUsers postId={postId} />
    </div>
  )
}
