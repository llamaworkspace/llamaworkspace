import { signOut } from 'next-auth/react'

export const useSignOut = () => {
  return async function doSignOut() {
    await signOut({ callbackUrl: '/' })
  }
}
