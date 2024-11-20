import {
  Section,
  SectionBody,
  SectionsHeader,
  SectionsShell,
} from '@/components/ui/Section'
import { Button } from '@/components/ui/button'
import { getEnumByValue } from '@/lib/utils'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAppById } from '../../appsHooks'
import { AppEngineType } from '../../appsTypes'
import { AppConfigForExternalApp } from './AppConfigForExternalApp/AppConfigForExternalApp'
import { AppConfigForGPT } from './AppConfigForGPT/AppConfigForGPT'

interface AppConfigProps {
  appId?: string
}

export function AppConfig({ appId }: AppConfigProps) {
  const { data: app } = useAppById(appId)
  const searchParams = useSearchParams()
  if (!app) return null

  const fromChatId = searchParams?.get('fromChatId')
  const returnToChatRoute = fromChatId && `/p/${appId}/c/${fromChatId}`

  let engineType: JSX.Element

  switch (getEnumByValue(AppEngineType, app.engineType)) {
    case AppEngineType.Default:
    case AppEngineType.Assistant:
      engineType = <AppConfigForGPT appId={appId} />
      break

    case AppEngineType.External:
      engineType = <AppConfigForExternalApp appId={appId} />
      break

    default:
      throw new Error(`A friendly name has not been set for an engine type`)
  }
  return (
    <SectionsShell>
      {returnToChatRoute && (
        <div className="mb-8">
          <Link href={returnToChatRoute}>
            <Button variant="outline">&larr; Back to chat</Button>
          </Link>
        </div>
      )}
      <SectionsHeader className="mb-2">App configuration</SectionsHeader>
      <Section>
        <SectionBody>{engineType}</SectionBody>
      </Section>
    </SectionsShell>
  )
}
