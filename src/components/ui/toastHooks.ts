// Todo: deprectate chakra-ui
// along with dependencies: @chakra-ui/react @emotion/react @emotion/styled framer-motion

import { useCallback } from 'react'
import { toast } from 'sonner'

const TOAST_DURATION = 5000

const cache: Record<string, Date> = {}

const getShouldTriggerByKey = (key: string) => {
  const value = cache[key]

  if (!value) {
    cache[key] = new Date()
    return true
  }

  const now = new Date()
  const diff = now.getTime() - value.getTime()

  if (diff > TOAST_DURATION) {
    cache[key] = new Date()
    return true
  }

  return false
}

export const useErrorToast = () => {
  return useCallback((description?: string) => {
    description = description ?? 'Something went wrong. Please try again.'

    if (!getShouldTriggerByKey(description)) {
      return
    }

    toast.error('Error', {
      description,
      duration: TOAST_DURATION,
      position: 'top-center',
      classNames: {
        toast: 'border-red-200 bg-red-50 bg-opacity-30',
        title: 'text-red-800 font-semibold',
        description: 'text-zinc-800',
        icon: 'text-red-800',
      },
    })
  }, [])
}

// export const useSuccessToast = () => {
//   const toast = useToast()
//   return useCallback(
//     (title = 'Success', description: string) => {
//       toast({
//         title,
//         description,
//         status: 'success',
//         duration: 3000,
//         isClosable: true,
//         position: 'top',
//       })
//     },
//     [toast],
//   )
// }
