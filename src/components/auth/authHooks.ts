import { signOut } from 'next-auth/react'
import { useLatestWorkspaceIdLocalStorage } from '../global/localStorageHooks'

export const useSignOut = () => {
  const [, , clearLastWorkspaceId] = useLatestWorkspaceIdLocalStorage()
  return async function doSignOut() {
    await signOut({ callbackUrl: '/' })
    clearLastWorkspaceId()
  }
}
