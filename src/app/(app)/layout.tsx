import { authOptions } from '@/server/auth/nextauth'
import { getServerSession } from 'next-auth/next'
import LayoutClient from './layout-client'

export default async function MainApp({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions)

  return (
    <div className={`h-full font-sans`}>
      {/* @ts-expect-error Server Component */}
      <LayoutClient session={session}>{children}</LayoutClient>
    </div>
  )
}
