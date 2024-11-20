'use client'

import { api } from '@/lib/api'
import '@/styles/globals.css'
import { type Session } from 'next-auth'
import type { PropsWithChildren } from 'react'
import { Toaster } from 'sonner'
import { Providers } from './providers'

const LayoutClient = ({
  session,
  children,
}: PropsWithChildren<{ session: Session | null }>) => {
  return (
    <Providers session={session}>
      {children}
      <Toaster />
    </Providers>
  )
}

export default api.withTRPC(LayoutClient)
