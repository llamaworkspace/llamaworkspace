import { AppConfigForGPT } from './AppConfigForGPT/AppConfigForGPT'

interface AppConfigProps {
  postId?: string
}

export function AppConfig({ postId }: AppConfigProps) {
  return <AppConfigForGPT postId={postId} />
}
