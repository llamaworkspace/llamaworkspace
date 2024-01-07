import { useNavigation } from '@/lib/frontend/useNavigation'
import { useEffect, type PropsWithChildren } from 'react'
import { useGlobalState } from '../globalState'

export const RouterEventListenerProvider = ({
  children,
}: PropsWithChildren) => {
  const navigation = useNavigation()
  const { toggleMobileSidebar } = useGlobalState()

  useEffect(() => {
    const handleRouteChange = () => {
      toggleMobileSidebar(false)
    }

    navigation.events.on('routeChangeStart', handleRouteChange)

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      navigation.events.off('routeChangeStart', handleRouteChange)
    }
  }, [navigation, toggleMobileSidebar])

  return <>{children}</>
}
