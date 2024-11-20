import { Section, SectionsHeader, SectionsShell } from '@/components/ui/Section'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useIsAdmin } from '@/components/users/usersHooks'
import { useRouter } from 'next/navigation'
import { useCurrentWorkspace } from '../../workspacesHooks'
import { SettingsAiProviders } from './SettingsAiProviders'
import { SettingsMembers } from './SettingsMembers'
import { SettingsName } from './SettingsName'

export function Settings({ tab }: { tab: string }) {
  const router = useRouter()
  const { data: workspace } = useCurrentWorkspace()

  const { isAdmin, isLoading } = useIsAdmin()

  const handleTabChange = (tab: string) => {
    if (!workspace) return
    router.push(`/w/${workspace.id}/settings/${tab}`)
  }

  if (!isAdmin && !isLoading) {
    return (
      <SectionsShell>
        <SectionsHeader>Workspace settings</SectionsHeader>
        <Section>
          <Alert variant="fuchsia">
            <AlertTitle>Permissions error</AlertTitle>
            <AlertDescription className="space-y-2">
              You do not have permission to access this page.
            </AlertDescription>
          </Alert>
        </Section>
      </SectionsShell>
    )
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
