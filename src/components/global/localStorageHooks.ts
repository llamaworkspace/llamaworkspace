import { useCallback } from 'react'
import { useLocalStorage } from 'usehooks-ts'

export const useLatestWorkspaceIdLocalStorage = () => {
  const parent = useLocalStorage<string | undefined>(
    'latestWorkspaceId',
    undefined,
  )

  const remove = useCallback(() => {
    window.localStorage.removeItem('latestWorkspaceId')
  }, [])

  return [...parent, remove] as const
}
