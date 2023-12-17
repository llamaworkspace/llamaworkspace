import { SectionWrapper, SectionWrapperTitle } from '@/components/ui/Section'
import { SettingsApiKeys } from './SettingsApiKeys'
import { SettingsMembers } from './SettingsMembers'
import { SettingsName } from './SettingsName'

export function Settings() {
  return (
    <SectionWrapper>
      <SectionWrapperTitle>Workspace settings</SectionWrapperTitle>
      <SettingsName />
      <SettingsApiKeys />
      <SettingsMembers />
    </SectionWrapper>
  )
}
