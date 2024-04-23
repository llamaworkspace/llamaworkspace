import {
  Section,
  SectionBody,
  SectionWrapper,
  SectionWrapperTitle,
} from '@/components/ui/Section'
import { AppsListTable } from './AppsListTable'

export const AppsList = () => {
  return (
    <SectionWrapper>
      <SectionWrapperTitle>Explore GPTs</SectionWrapperTitle>
      <Section>
        <SectionBody>
          <AppsListTable />
        </SectionBody>
      </Section>
    </SectionWrapper>
  )
}
