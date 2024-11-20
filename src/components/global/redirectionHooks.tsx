import { useDefaultApp } from '@/components/apps/appsHooks'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { useParams, useRouter } from 'next/navigation'
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
  const params = useParams<{ app_id?: string; workspace_id?: string }>()
  const router = useRouter()
  const appId = params?.app_id
  const workspaceId = params?.workspace_id
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
      router.replace(`/w/${workspaceId}/settings`)
    }
  }, [
    redirectIsCalled,
    isExecuted,
    appId,
    defaultApp,
    createStandaloneChat,
    createChatForApp,
    workspaceId,
    canUse,
    router,
  ])

  return {
    redirect,
  }
}
