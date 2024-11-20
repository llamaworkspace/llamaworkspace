'use client'
import { RouterEventListenerProvider } from '@/components/global/components/RouterEventListenerProvider'
import { GlobalStateProvider } from '@/components/global/globalState'
import { TooltipProvider } from '@/components/ui/tooltip'
import '@/styles/globals.css'
import { ChakraProvider } from '@chakra-ui/react'
import { type Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'

export function Providers({
  session,
  children,
}: {
  session: Session | null
  children: React.ReactNode
}) {
  return (
    <GlobalStateProvider>
      <RouterEventListenerProvider>
        <SessionProvider session={session}>
          <ChakraProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </ChakraProvider>
        </SessionProvider>
      </RouterEventListenerProvider>
    </GlobalStateProvider>
  )
}
