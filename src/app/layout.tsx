import '@/styles/globals.css'
import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'
import { Toaster } from 'sonner'

import { buildMetaTitle } from '@/lib/frontend/build-meta-title'
import { TRPCReactProvider } from '@/trpc/react'

export const metadata: Metadata = {
  title: buildMetaTitle('Llama Workspace'),
  description: 'Llama Workspace, the open-source AI Assistant for work',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} h-full`}>
      <body className="h-full">
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Toaster
          toastOptions={
            {
              // unstyled: true,
              // classNames: {
              //   error: 'bg-red-400',
              //   success: 'text-green-400',
              //   warning: 'text-yellow-400',
              //   info: 'bg-blue-400',
              // },
            }
          }
        />
      </body>
    </html>
  )
}
