import {
  Section,
  SectionBody,
  SectionsHeader,
  SectionsShell,
} from '@/components/ui/Section'
import { AppCreate } from './AppCreate/AppCreate'
import { AppsListTable } from './AppsListTable'

export const AppsList = () => {
  return (
    <SectionsShell>
      <SectionsHeader>Workspace Apps</SectionsHeader>
      <Section>
        <SectionBody className="space-y-4">
          <AppCreate />
          <AppsListTable />
        </SectionBody>
      </Section>
    </SectionsShell>
  )
}
