import { useEffect } from 'react'
import useAuthListenerSubscriber from 'Components/UserAuth/Session/Authentication/Hooks/useAuthListenerSubscriber'

let appInitialized = false

const useInitializeApp = () => {
  const initializeAuthUserListener = useAuthListenerSubscriber()

  useEffect(() => {
    if (appInitialized) return
    initializeAuthUserListener()
    appInitialized = true
  }, [initializeAuthUserListener])
}

export default useInitializeApp
