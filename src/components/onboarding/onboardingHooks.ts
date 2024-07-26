import { api } from '@/lib/api'
import { useErrorHandler } from '../global/errorHandlingHooks'

export const usePeformInitialModelSetup = () => {
  const errorHandler = useErrorHandler()
  return api.onboarding.performInitialModelSetup.useMutation({
    onError: errorHandler(),
  })
}
