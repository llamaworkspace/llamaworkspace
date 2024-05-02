import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PostConfigSubmitButtonGroupProps {
  pristine: boolean
  submitting: boolean
  handleSubmit: () => void
  handleSubmitAndRedirect: () => void
}

export const PostConfigSubmitButtonGroup = ({
  pristine,
  submitting,
  handleSubmit,
  handleSubmitAndRedirect,
}: PostConfigSubmitButtonGroupProps) => {
  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0 z-50 space-x-4 border-t-2 border-zinc-300 bg-zinc-50 px-8 py-4 text-right ease-in-out',
        pristine ? 'hidden' : 'block',
      )}
    >
      <Button
        onClick={() => void handleSubmit()}
        disabled={submitting}
        variant="outline"
      >
        Save
      </Button>
      <Button
        onClick={() => void handleSubmitAndRedirect()}
        disabled={submitting}
        variant="primary"
      >
        Save and go to Chat
      </Button>
    </div>
  )
}
