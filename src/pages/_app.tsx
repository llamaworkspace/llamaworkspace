import { RouterEventListenerProvider } from '@/components/global/components/RouterEventListenerProvider'
import { GlobalStateProvider } from '@/components/global/globalState'
import { TooltipProvider } from '@/components/ui/tooltip'
import { api } from '@/lib/api'
import '@/styles/globals.css'
import { ChakraProvider } from '@chakra-ui/react'
import { type Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { type AppType } from 'next/app'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

const MainApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <div className={`h-full font-sans`}>
      <GlobalStateProvider>
        <RouterEventListenerProvider>
          <SessionProvider session={session}>
            <ChakraProvider>
              <TooltipProvider>
                <DndProvider backend={HTML5Backend}>
                  <Component {...pageProps} />
                </DndProvider>
              </TooltipProvider>
            </ChakraProvider>
          </SessionProvider>
        </RouterEventListenerProvider>
      </GlobalStateProvider>
    </div>
  )
}

export default api.withTRPC(MainApp)
