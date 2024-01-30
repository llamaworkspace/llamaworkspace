import { api } from '@/lib/api'
import { debounce } from 'lodash'
import { useEffect } from 'react'
import { useErrorHandler } from '../global/errorHandlingHooks'

export const useUpdateChatTitle = () => {
  const errorHandler = useErrorHandler()
  const utils = api.useContext()

  const { isSuccess, reset, mutate, ...rest } =
    api.chats.updateChatTitle.useMutation({
      onError: errorHandler(),
      onSuccess: async () => {
        await utils.sidebar.invalidate()
      },
    })

  useEffect(() => {
    if (isSuccess) {
      reset()
    }
  }, [isSuccess, reset])

  type MutateArgs = Parameters<typeof mutate>
  type Params = MutateArgs[0]
  type Options = MutateArgs[1]

  return {
    mutate: debounce((params: Params, options?: Options) => {
      mutate(params, options)
    }, 350),
    isSuccess,
    reset,
    ...rest,
  }
}
