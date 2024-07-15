import { getEnumByValue } from '@/lib/utils'
import { useAppById } from '../../appsHooks'
import { AppEngineType } from '../../appsTypes'
import { AppConfigForExternalApp } from './AppConfigForExternalApp/AppConfigForExternalApp'
import { AppConfigForGPT } from './AppConfigForGPT/AppConfigForGPT'

interface AppConfigProps {
  appId?: string
}

export function AppConfig({ appId }: AppConfigProps) {
  const { data: app } = useAppById(appId)

  if (!app) return null

  switch (getEnumByValue(AppEngineType, app.engineType)) {
    case AppEngineType.Default:
    case AppEngineType.Assistant:
      return <AppConfigForGPT appId={appId} />
    case AppEngineType.External:
      return <AppConfigForExternalApp appId={appId} />
    default:
      throw new Error(`A friendly name has not been set for an engine type`)
  }
}
