import { signIn, useSession } from 'next-auth/react'
import { type PropsWithChildren, useEffect } from 'react'

export const MainLayoutSessionChecker = ({ children }: PropsWithChildren) => {
  const { status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      void signIn()
    }
  }, [status])

  if (status !== 'authenticated') {
    return null
  }

  return children
}
