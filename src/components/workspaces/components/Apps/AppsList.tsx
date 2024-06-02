import { useCreatePost } from '@/components/apps/postsHooks'
import {
  Section,
  SectionBody,
  SectionsHeader,
  SectionsShell,
} from '@/components/ui/Section'
import { Button } from '@/components/ui/button'
import { useCurrentWorkspace } from '../../workspacesHooks'
import { AppsListTable } from './AppsListTable'

export const AppsList = () => {
  return (
    <SectionsShell>
      <SectionsHeader>Workspace GPTs</SectionsHeader>
      <Section>
        <SectionBody className="space-y-4">
          <CreateAppSection />
          <AppsListTable />
        </SectionBody>
      </Section>
    </SectionsShell>
  )
}

const CreateAppSection = () => {
  const { data: workspace } = useCurrentWorkspace()
  const { mutateAsync: createPost } = useCreatePost()

  const handleCreatePost = async () => {
    if (!workspace?.id) return
    await createPost({ workspaceId: workspace.id })
  }

  return (
    <div className="flex w-full justify-end ">
      <Button onClick={() => void handleCreatePost()}>Create GPT</Button>
    </div>
  )
}
