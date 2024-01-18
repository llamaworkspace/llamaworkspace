import { useUpdatePost } from '@/components/posts/postsHooks'
import { StyledLink } from '@/components/ui/StyledLink'
import {
  Alert,
  AlertDescription,
  AlertRightButton,
  AlertTitle,
} from '@/components/ui/alert'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { useShouldDisplayEmptySettingsAlert } from '../chatHooks'

interface ChatNoSettingsAlertProps {
  postId?: string
  chatId?: string
}

export const ChatNoSettingsAlert = ({
  postId,
  chatId,
}: ChatNoSettingsAlertProps) => {
  const href = `/p/${postId}/c/${chatId}/configuration?focus=system_message`
  const shouldDisplay = useShouldDisplayEmptySettingsAlert(postId, chatId)
  const { mutate: updatePost } = useUpdatePost()

  const handleDismiss = () => {
    if (!postId) return
    updatePost({ id: postId, hideEmptySettingsAlert: true })
  }

  if (!shouldDisplay) return null

  return (
    <div className="space-y-4">
      <div>
        <Alert variant="fuchsia">
          <AlertRightButton onClick={handleDismiss}>Dismiss</AlertRightButton>
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            You haven&apos;t set up any custom instructions for this chatbot.{' '}
            <StyledLink href={href}>Set them up now</StyledLink>.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
