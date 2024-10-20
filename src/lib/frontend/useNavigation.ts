// eslint-disable-next-line no-restricted-imports
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import {
  defaultConfiguration,
  makeNavigation,
  type DefaultConfiguration,
} from './routes'

export type ApplicationPaths =
  | '/'
  | '/auth/signin'
  | '/w'
  | '/w/:workspaceId'
  | '/w/:workspaceId/empty'
  | '/w/:workspaceId/profile'
  | '/w/:workspaceId/settings'
  | '/w/:workspaceId/settings/:tab'
  | '/w/:workspaceId/onboarding'
  | '/p'
  | '/p/:appId'
  | '/p/:appId/history'
  | '/p/:appId/publishing'
  | '/p/:appId/configuration'
  | '/p/:appId/c'
  | '/p/:appId/c/new'
  | '/p/:appId/c/:chatId'
  | '/p/:appId/c/:chatId/configuration'
  | '/c'
  | '/c/:chatId'
export type ApplicationRoutesConfiguration = DefaultConfiguration

export const useNavigation = () => {
  const router = useRouter()

  return useMemo(
    () => ({
      ...router,
      ...makeNavigation<ApplicationPaths, ApplicationRoutesConfiguration>(
        router,
        defaultConfiguration,
      ),
      pushRaw: router.push,
      replaceRaw: router.replace,
    }),
    [router],
  )
}
