import { SelectAiModelsFormField } from '@/components/ai/components/SelectAiModelsFormField'
import {
  usePostConfigForChat,
  useUpdatePostConfigForStandaloneChat,
} from '@/components/chats/chatHooks'
import { cn } from '@/lib/utils'
import { Field, Form as FinalForm } from 'react-final-form'
import { ChatHeaderPostLinks } from '../../chats/components/ChatHeaderPostLinks'
import { useGlobalState } from '../../global/globalState'
import { SidebarToggleIcon } from '../../sidebar/SidebarToggleIcon'

export function MainLayoutHeaderForStandaloneChat({
  chatId,
}: {
  chatId?: string
}) {
  const { toggleMobileSidebar, toggleDesktopSidebar, state } = useGlobalState()
  const { isDesktopSidebarOpen } = state
  return (
    <>
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
        <div className="flex w-full justify-between px-2 md:px-6">
          <div id="header-left" className="flex grow items-center text-sm">
            {/* Fixme, mobile! */}
            {/* <ChatHeaderPostTitle postId={postId} /> */}
            <AiModelSelector chatId={chatId} />
          </div>
          <div id="header-left" className="items-center text-sm">
            <ChatHeaderPostLinks />
          </div>
        </div>
      </div>
      {/* Desktop header */}
      <div className="hidden h-8 w-full items-center lg:flex">
        <button
          type="button"
          className={cn(
            'ml-6 h-8 w-8 text-zinc-700',
            isDesktopSidebarOpen && 'hidden',
          )}
          onClick={toggleDesktopSidebar}
        >
          <span className="sr-only">Open sidebar</span>
          <SidebarToggleIcon />
        </button>
        <div className="flex w-full justify-between px-6">
          <div id="header-left" className="flex grow items-center text-sm">
            <AiModelSelector chatId={chatId} />
          </div>
        </div>
      </div>
    </>
  )
}

interface FormValues {
  defaultModel: string
}

const AiModelSelector = ({ chatId }: { chatId?: string }) => {
  const { data: postConfig, refetch } = usePostConfigForChat(chatId)
  const { mutate: updatePostConfigVersion } =
    useUpdatePostConfigForStandaloneChat()

  return (
    <FinalForm<FormValues>
      onSubmit={(values) => {
        if (!chatId) return
        updatePostConfigVersion(
          {
            chatId,
            model: values.defaultModel,
          },
          { onSuccess: () => void refetch() },
        )
      }}
      initialValues={{ defaultModel: postConfig?.model }}
      render={({ handleSubmit }) => {
        return (
          <div className="grid md:grid-cols-3">
            <Field
              name="defaultModel"
              render={({ input }) => {
                return (
                  <SelectAiModelsFormField
                    {...input}
                    placeholder="Select a model"
                    onValueChange={() => void handleSubmit()}
                    variant="chatHeader"
                  />
                )
              }}
            />
          </div>
        )
      }}
    />
  )
}
