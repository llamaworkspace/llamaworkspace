import { useCreateChatForApp } from '@/components/chats/chatHooks'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface AppConfigSubmitButtonGroupProps {
  appId?: string
  pristine: boolean
  submitting: boolean
  showSubmitError?: boolean
  onSave: () => Promise<void>
}

export const AppConfigSubmitButtonGroup = ({
  appId,
  pristine,
  submitting,
  showSubmitError = false,
  onSave,
}: AppConfigSubmitButtonGroupProps) => {
  const router = useRouter()
  const pathname = usePathname()

  const searchParams = useSearchParams()
  const returnToChatRoute = pathname?.replace(`/configuration`, '') ?? ''
  const { mutateAsync: createChat } = useCreateChatForApp()

  const onSaveAndRedirect = () => {
    async function run() {
      await Promise.resolve(onSave())
      // Check this
      if (searchParams?.get('chat_id')) {
        return void router?.push(returnToChatRoute)
      }
      if (!appId) return
      await createChat({ appId })
    }
    void run()
  }

  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0 z-50 border-t-2 border-zinc-300 bg-zinc-50 px-8 py-4 ease-in-out',
        pristine ? 'hidden' : 'block',
      )}
    >
      <div className="flex items-center justify-end gap-x-2">
        {showSubmitError && (
          <div className="rounded bg-red-100 px-1 py-0.5 text-sm text-red-600">
            Cannot save. Some of the required fields are missing.
          </div>
        )}
        <Button
          onClick={() => void onSave()}
          disabled={submitting}
          variant="outline"
        >
          Save
        </Button>
        <Button
          onClick={() => void onSaveAndRedirect()}
          disabled={submitting}
          variant="primary"
        >
          Save and go to Chat
        </Button>
      </div>
    </div>
  )
}
