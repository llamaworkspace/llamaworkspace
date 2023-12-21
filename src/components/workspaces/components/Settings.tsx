import { SectionWrapper, SectionWrapperTitle } from '@/components/ui/Section'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { useCurrentWorkspace } from '../workspacesHooks'
import { SettingsApiKeys } from './SettingsApiKeys'
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
          <TabsTrigger value="providers">AI Services</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <SettingsName />
        </TabsContent>
        <TabsContent value="members">
          <SettingsMembers />
        </TabsContent>
        <TabsContent value="providers">
          <SettingsApiKeys />
        </TabsContent>
      </Tabs>
    </SectionWrapper>
  )
}
