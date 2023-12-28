// Todo: deprectate chakra-ui
// along with dependencies: @chakra-ui/react @emotion/react @emotion/styled framer-motion

import { useToast } from '@chakra-ui/react'
import { useCallback } from 'react'

const TOAST_DURATION = 3000

interface ToastOptions {
  duration?: number
}

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
  const toast = useToast()

  return useCallback(
    (message: string, options?: ToastOptions) => {
      const description = message || 'Something went wrong. Please try again.'

      if (!getShouldTriggerByKey(description)) {
        return
      }

      toast({
        title: 'Error',
        description,
        status: 'error',
        duration: options?.duration ?? TOAST_DURATION,
        isClosable: true,
        position: 'top',
      })
    },
    [toast],
  )
}

export const useSuccessToast = () => {
  const toast = useToast()
  return useCallback(
    (title = 'Success', description: string) => {
      toast({
        title,
        description,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
    },
    [toast],
  )
}
