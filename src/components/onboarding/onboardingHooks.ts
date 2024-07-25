import { api } from '@/lib/api'
import { useErrorHandler } from '../global/errorHandlingHooks'

export const useSetupInitialModel = () => {
  const errorHandler = useErrorHandler()
  return api.onboarding.setupInitialModel.useMutation({
    onError: errorHandler(),
  })
}
