import { SelectAiModelsFormField } from '@/components/ai/components/SelectAiModelsFormField'
import { usePostConfigForChat } from '@/components/chats/chatHooks'
import { SectionWrapper, SectionWrapperTitle } from '@/components/ui/Section'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { Field, Form as FinalForm } from 'react-final-form'
import { useCurrentWorkspace } from '../workspacesHooks'
import { SettingsAiProviders } from './SettingsAiProviders'
import { SettingsMembers } from './SettingsMembers'
import { SettingsName } from './SettingsName'

export function Settings({ tab }: { tab: string }) {
  const navigation = useNavigation()
  const { workspace } = useCurrentWorkspace()

  const handleTabChange = (tab: string) => {
    if (!workspace) return
    void navigation.push(`/w/:workspaceId/settings/:tab`, {
      workspaceId: workspace.id,
      tab,
    })
  }

  return (
    <SectionWrapper>
      <SectionWrapperTitle>Workspace settings</SectionWrapperTitle>
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="max-w-[400px]x mb-12 grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="providers">AI Providers</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <SettingsName />
        </TabsContent>
        <TabsContent value="members">
          <SettingsMembers />
        </TabsContent>
        <TabsContent value="providers">
          <AiModelSelector />
          <div className="py-4">---</div>
          <SettingsAiProviders />
        </TabsContent>
      </Tabs>
    </SectionWrapper>
  )
}

interface FormValues {
  defaultModel: string
}

const AiModelSelector = ({ chatId }: { chatId?: string }) => {
  const { data: postConfig } = usePostConfigForChat(chatId)

  return (
    <FinalForm<FormValues>
      onSubmit={(values) => {
        console.log(values)
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
