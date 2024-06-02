import { useDefaultApp } from '@/components/apps/postsHooks'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { useCallback, useEffect, useState } from 'react'
import { isBoolean } from 'underscore'
import {
  useCreateChatForApp,
  useCreateStandaloneChat,
} from '../chats/chatHooks'
import { useCanPerformActionForApp } from '../permissions/permissionsHooks'

/**
 * Hook that automatically redirects to the latest app in the current workspace.
 * If there are no apps, it returns hasNoApps=true after it finishes loading.
 */
export function useDefaultPageRedirection() {
  const navigation = useNavigation()
  const appId = navigation.query?.post_id as string
  const workspaceId = navigation.query?.workspace_id as string
  const { mutate: createStandaloneChat } = useCreateStandaloneChat()
  const { mutate: createChatForApp } = useCreateChatForApp()
  const { data: defaultApp } = useDefaultApp()
  const { data: canUse } = useCanPerformActionForApp(
    PermissionAction.Use,
    appId,
  )

  const [redirectIsCalled, setRedirectIsCalled] = useState(false)
  const [isExecuted, setIsExecuted] = useState(false)

  const redirect = useCallback(() => {
    setRedirectIsCalled(true)
  }, [])

  useEffect(() => {
    if (!redirectIsCalled) return
    if (isExecuted) return

    // When the user does not have permission access to the appId: redirect to the default
    if (appId && isBoolean(canUse)) {
      if (!defaultApp) return
      setIsExecuted(true)

      if (appId === defaultApp.id || !canUse) {
        void createStandaloneChat()
      } else {
        void createChatForApp({ appId })
      }

      return
    }

    if (workspaceId) {
      void navigation.replace(`/w/:workspaceId/settings`, { workspaceId })
    }
  }, [
    redirectIsCalled,
    isExecuted,
    appId,
    defaultApp,
    createStandaloneChat,
    createChatForApp,
    navigation,
    workspaceId,
    canUse,
  ])

  return {
    redirect,
  }
}
