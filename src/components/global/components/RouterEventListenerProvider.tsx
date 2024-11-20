'use client'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, type PropsWithChildren } from 'react'
import { useGlobalState } from '../globalState'

export const RouterEventListenerProvider = ({
  children,
}: PropsWithChildren) => {
  const { toggleMobileSidebar } = useGlobalState()
  const urlRef = useRef<string | null>(null)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const currentUrl = `${pathname}${searchParams?.toString() ?? ''}`

    if (!urlRef.current) {
      urlRef.current = currentUrl
      return
    }

    if (urlRef.current !== currentUrl) {
      urlRef.current = currentUrl
      toggleMobileSidebar(false)
    }
  }, [pathname, searchParams, toggleMobileSidebar])

  return <>{children}</>
}
