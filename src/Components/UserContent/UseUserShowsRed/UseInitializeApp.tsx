import { useContext, useEffect } from 'react'
import { AuthUserInterface } from 'Components/UserAuth/Session/Authentication/@Types'
import { useAppDispatch } from 'app/hooks'
import setupAuthUser from 'Components/UserAuth/Session/Authentication/AuthUserHandlers/setupAuthUser'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { logoutAuthUser } from 'Components/UserAuth/Session/Authentication/AuthUserHandlers/logoutAuthUser'
import { LocalStorageHandlersContext } from 'Components/AppContext/Contexts/LocalStorageContentContext/LocalStorageContentContext'
import useAuthListenerSubscriber from 'Components/UserAuth/Session/Authentication/Hooks/useAuthListenerSubscriber'
import { fetchUserShows } from './DatabaseHandlers/FetchData/fetchShowsData'
import { updateLoadingShows } from './userShowsSliceRed'
import { userShowsListeners } from './DatabaseHandlers/Listeners/firebaseListeners'

let appInitialized = false

const useInitializeApp = () => {
  const { firebase } = useFrequentVariables()
  const localStorageHandlers = useContext(LocalStorageHandlersContext)
  const dispatch = useAppDispatch()

  const authUserListener = useAuthListenerSubscriber()

  useEffect(() => {
    if (appInitialized) return
    authUserListener()
    appInitialized = true
  }, [authUserListener])
}

export default useInitializeApp
