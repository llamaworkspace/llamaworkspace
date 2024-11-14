import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'

const MAX_HEIGHT = 200

interface ChatProps {
  appId?: string
  chatId?: string
  stableOnChatboxHeightChange?: (height: number) => void
  onChatSubmit?: () => void
  showScrollToBottomIcon?: boolean
  onScrollToBottomIconClick?: () => void
}

export function Chatbox({ onClick }: ChatProps) {
  return (
    <div className="relative mx-auto max-w-3xl bg-white px-2 pb-2 lg:px-0">
      <form>
        <div
          className={cn(
            'flex items-center gap-x-2 rounded-md border border-zinc-200 bg-white p-2',
          )}
        >
          <div className="relative flex h-full w-full justify-center">
            <textarea
              rows={1}
              placeholder={'Write something'}
              className={cn(
                'm-0 h-auto w-full resize-none overflow-y-auto p-0 text-zinc-900 outline-none focus:ring-0 focus-visible:ring-0',
              )}
            />
            {/* Shadow textarea */}
            <div
              // Keep this and uncomment in dev to debugging the shadow textarea
              // className="absolute left-0 right-0 top-[-220px] overflow-hidden bg-pink-200"
              className="absolute h-0 max-h-0 overflow-hidden"
              style={{
                whiteSpace: 'pre-wrap',
              }}
            >
              pepeepepe
            </div>
          </div>
          <div className="self-end">
            <Button type="button" variant="secondary" onClick={onClick}>
              <PaperAirplaneIcon className="h-5 w-5 text-zinc-950" />
            </Button>
          </div>
        </div>
      </form>
      <div className="mt-2 flex justify-end text-xs tracking-tight">
        <div className="text-zinc-400">
          <span className="font-semibold">Shift + Enter</span> &nbsp;to add a
          new line
        </div>
      </div>
    </div>
  )
}
