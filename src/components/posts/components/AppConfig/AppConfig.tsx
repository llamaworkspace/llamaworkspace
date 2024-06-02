import { AppConfigForGPT } from './AppConfigForGPT/AppConfigForGPT'

interface AppConfigProps {
  appId?: string
}

export function AppConfig({ appId }: AppConfigProps) {
  return <AppConfigForGPT appId={appId} />
}
