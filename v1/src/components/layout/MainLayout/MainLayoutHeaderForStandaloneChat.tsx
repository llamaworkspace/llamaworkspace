import { SelectAiModelsFormField } from '@/components/ai/components/SelectAiModelsFormField'
import {
  useAppConfigForChat,
  useUpdateAppConfigForStandaloneChat,
} from '@/components/chats/chatHooks'
import { Skeleton } from '@/components/ui/skeleton'
import { useMemo } from 'react'
import { Field, Form as FinalForm } from 'react-final-form'
import { useGlobalState } from '../../global/globalState'
import { SidebarToggleIcon } from '../../sidebar/components/Sidebar/SidebarToggleIcon'

export function MainLayoutHeaderForStandaloneChat({
  chatId,
}: {
  chatId?: string
}) {
  const { toggleMobileSidebar } = useGlobalState()

  return (
    <header className="flex h-14 max-h-14 flex-row items-center justify-between py-2.5 lg:px-0">
      {/* Mobile button */}
      <div className="flex w-full px-2 py-5 lg:hidden">
        <button
          type="button"
          className="text-zinc-700"
          onClick={() => void toggleMobileSidebar()}
        >
          <span className="sr-only">Open sidebar</span>
          <SidebarToggleIcon />
        </button>
        <div className="flex w-full justify-between px-2">
          <div id="header-left" className="flex grow items-center text-sm">
            {chatId ? (
              <AiModelSelector chatId={chatId} />
            ) : (
              <Skeleton className="h-5 w-48" />
            )}
          </div>
        </div>
      </div>
      {/* Desktop header */}
      <div className="hidden h-8 w-full items-center lg:flex">
        <div className="flex w-full justify-between px-6">
          <div id="header-left" className="flex grow items-center text-sm">
            {chatId ? (
              <AiModelSelector chatId={chatId} />
            ) : (
              <Skeleton className="h-5 w-72" />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

interface FormValues {
  model: string
}

const AiModelSelector = ({ chatId }: { chatId?: string }) => {
  const { data: appConfig, refetch } = useAppConfigForChat(chatId)
  const { mutate: updateAppConfigVersion } =
    useUpdateAppConfigForStandaloneChat()

  const initialValues = useMemo(() => {
    return {
      model: appConfig?.model,
    }
  }, [appConfig])

  return (
    <FinalForm<FormValues>
      onSubmit={(values) => {
        if (!chatId) return
        updateAppConfigVersion(
          {
            chatId,
            model: values.model,
          },
          { onSuccess: () => void refetch() },
        )
      }}
      initialValues={initialValues}
      render={({ handleSubmit }) => {
        return (
          <div className="grid md:grid-cols-3">
            <Field
              name="model"
              render={({ input }) => {
                return (
                  <span className="rounded-md border border-zinc-100 bg-white/90">
                    <SelectAiModelsFormField
                      {...input}
                      placeholder="Select a model"
                      onValueChange={() => void handleSubmit()}
                      variant="chatHeader"
                      loadingEl={<Skeleton className="h-5 w-72" />}
                    />
                  </span>
                )
              }}
            />
          </div>
        )
      }}
    />
  )
}
