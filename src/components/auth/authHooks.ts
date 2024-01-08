import { signOut } from 'next-auth/react'
import { useWorkspaceIdFromLocalStorage } from '../global/localStorageHooks'

export const useSignOut = () => {
  const [, , clearLastWorkspaceId] = useWorkspaceIdFromLocalStorage()
  return async function doSignOut() {
    await signOut({ callbackUrl: '/' })
    clearLastWorkspaceId()
  }
}
