import { useCallback, useMemo } from 'react'
import { useLocalStorage } from 'usehooks-ts'

export const useWorkspaceIdFromLocalStorage = () => {
  const [get, set] = useLocalStorage<string | undefined>(
    'latestWorkspaceId',
    undefined,
  )

  const remove = useCallback(() => {
    window.localStorage.removeItem('latestWorkspaceId')
  }, [])

  return useMemo(() => {
    return [get, set, remove] as const
  }, [get, set, remove])
}
