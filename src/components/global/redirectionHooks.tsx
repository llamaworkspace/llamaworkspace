import { useDefaultPost } from '@/components/posts/postsHooks'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { useCallback, useEffect, useState } from 'react'
import { isBoolean } from 'underscore'
import {
  useCreateChatForApp,
  useCreateStandaloneChat,
} from '../chats/chatHooks'
import { useCanPerformActionForPost } from '../permissions/permissionsHooks'

/**
 * Hook that automatically redirects to the latest app in the current workspace.
 * If there are no apps, it returns hasNoPosts=true after it finishes loading.
 */
export function useDefaultPageRedirection() {
  const navigation = useNavigation()
  const appId = navigation.query?.post_id as string
  const workspaceId = navigation.query?.workspace_id as string
  const { mutate: createStandaloneChat } = useCreateStandaloneChat()
  const { mutate: createChatForApp } = useCreateChatForApp()
  const { data: defaultPost } = useDefaultPost()
  const { data: canUse } = useCanPerformActionForPost(
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
      if (!defaultPost) return
      setIsExecuted(true)

      if (appId === defaultPost.id || !canUse) {
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
    defaultPost,
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
