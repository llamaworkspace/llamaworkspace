import { api } from '@/lib/api'
import { useErrorHandler } from '../global/errorHandlingHooks'

export const useSelf = () => {
  const errorHandler = useErrorHandler()

  return api.users.getSelf.useQuery(undefined, {
    onError: errorHandler(),
  })
}

export const useUpdateSelf = () => {
  const errorHandler = useErrorHandler()

  return api.users.updateSelf.useMutation({
    onError: errorHandler(),
  })
}
