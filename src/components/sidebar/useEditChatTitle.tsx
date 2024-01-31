import { useEffect, useState } from 'react'

import { useUpdateChatTitle } from '@/components/chats/useUpdateChatTitle'

export const useEditChatTitle = (id: string, initialValue: string) => {
  const [value, setValue] = useState<string>(initialValue)

  const { mutate } = useUpdateChatTitle()

  useEffect(() => {
    if (value && id) {
      void mutate({ id: id, title: value })
    }

    // Clean on unmount
    return () => {
      mutate.cancel()
    }
  }, [value, id])

  return {
    onChange: setValue,
    value,
  }
}
