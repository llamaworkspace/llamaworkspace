import { SectionsHeader, SectionsShell } from 'components/ui/Section'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/ui/tabs'
import { useNavigation } from 'lib/frontend/useNavigation'
import { useCurrentWorkspace } from '../../workspacesHooks'
import { SettingsAiProviders } from './SettingsAiProviders'
import { SettingsMembers } from './SettingsMembers'
import { SettingsName } from './SettingsName'

export function Settings({ tab }: { tab: string }) {
  const navigation = useNavigation()
  const { data: workspace } = useCurrentWorkspace()

  const handleTabChange = (tab: string) => {
    if (!workspace) return
    void navigation.push(`/w/:workspaceId/settings/:tab`, {
      workspaceId: workspace.id,
      tab,
    })
  }

  return (
    <SectionsShell>
      <SectionsHeader>Workspace settings</SectionsHeader>
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="mb-12 grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="models">AI Models</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <SettingsName />
        </TabsContent>
        <TabsContent value="members">
          <SettingsMembers />
        </TabsContent>
        <TabsContent value="models">
          <SettingsAiProviders />
        </TabsContent>
      </Tabs>
    </SectionsShell>
  )
}
