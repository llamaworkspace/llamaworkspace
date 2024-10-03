import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type PropsWithChildren,
} from 'react'
import { useLocalStorage } from 'usehooks-ts'

type State = {
  isDesktopSidebarOpen: boolean
  isMobileSidebarOpen: boolean
}

type ActionType =
  | 'TOGGLE_DESKTOP_SIDEBAR'
  | 'TOGGLE_MOBILE_SIDEBAR'
  | 'OPEN_MOBILE_SIDEBAR'
  | 'CLOSE_MOBILE_SIDEBAR'

interface Action {
  type: ActionType
  payload?: Partial<State> | null
}

interface GlobalStateContextProps {
  state: State
  dispatch: React.Dispatch<Action>
}

const GlobalStateContext = createContext<GlobalStateContextProps | undefined>(
  undefined,
)

const settingsReducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'TOGGLE_DESKTOP_SIDEBAR':
      const isDesktopSidebarOpen = !state.isDesktopSidebarOpen
      return { ...state, isDesktopSidebarOpen }

    case 'OPEN_MOBILE_SIDEBAR':
      return { ...state, isMobileSidebarOpen: true }

    case 'CLOSE_MOBILE_SIDEBAR':
      return { ...state, isMobileSidebarOpen: false }

    case 'TOGGLE_MOBILE_SIDEBAR':
      return { ...state, isMobileSidebarOpen: !state.isMobileSidebarOpen }

    default:
      return state
  }
}

export const GlobalStateProvider = ({ children }: PropsWithChildren) => {
  const [initialIsDesktopSidebarOpen, setInitialIsDesktopSidebarOpen] =
    useLocalStorage('isDesktopSidebarOpen', true)

  // Declare available globalState props here
  const initialSettings = {
    isDesktopSidebarOpen: initialIsDesktopSidebarOpen,
    isMobileSidebarOpen: false,
  }
  const [state, dispatch] = useReducer(settingsReducer, initialSettings)

  useEffect(() => {
    setInitialIsDesktopSidebarOpen(state.isDesktopSidebarOpen)
  }, [state, setInitialIsDesktopSidebarOpen])

  return (
    <GlobalStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalStateContext.Provider>
  )
}

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext)

  if (!context) {
    throw new Error('useGlobalState must be used within a SettingsProvider')
  }

  const { state, dispatch } = context

  const toggleDesktopSidebar = () => {
    dispatch({ type: 'TOGGLE_DESKTOP_SIDEBAR' })
  }

  const toggleMobileSidebar = (value?: boolean) => {
    if (value === true) {
      return dispatch({ type: 'OPEN_MOBILE_SIDEBAR' })
    } else if (value === false) {
      return dispatch({ type: 'CLOSE_MOBILE_SIDEBAR' })
    }
    dispatch({ type: 'TOGGLE_MOBILE_SIDEBAR' })
  }

  return {
    state,
    toggleDesktopSidebar,
    toggleMobileSidebar,
  }
}
