import { Section, SectionBody, SectionHeader } from '@/components/ui/Section'
import { SettingsMembersInviteForm } from './SettingsMembersInviteForm'
import { SettingsMembersTable } from './SettingsMembersTable'

export const SettingsMembers = () => {
  return (
    <Section>
      <SectionHeader title="Members" />
      <SectionBody>
        <SettingsMembersInviteForm />
        <SettingsMembersTable />
      </SectionBody>
    </Section>
  )
}
