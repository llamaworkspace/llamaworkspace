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
  | '/w'
  | '/w/:workspaceId'
  | '/w/:workspaceId/empty'
  | '/w/:workspaceId/profile'
  | '/w/:workspaceId/settings'
  | '/w/:workspaceId/settings/:tab'
  | '/p'
  | '/p/:postId'
  | '/p/:postId/history'
  | '/p/:postId/publishing'
  | '/p/:postId/c'
  | '/p/:postId/c/new'
  | '/p/:postId/c/:chatId'
  | '/p/:postId/c/:chatId/configuration'
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
