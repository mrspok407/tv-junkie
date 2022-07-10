import { useContext, useEffect } from 'react'
import { AuthUserInterface } from 'Components/UserAuth/Session/Authentication/@Types'
import { useAppDispatch } from 'app/hooks'
import setupAuthUser from 'Components/UserAuth/Session/Authentication/AuthUserHandlers/setupAuthUser'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { logoutAuthUser } from 'Components/UserAuth/Session/Authentication/AuthUserHandlers/logoutAuthUser'
import { LocalStorageHandlersContext } from 'Components/AppContext/Contexts/LocalStorageContentContext/LocalStorageContentContext'
import { fetchUserShows } from './DatabaseHandlers/FetchData/fetchShowsData'
import { updateLoadingShows } from './userShowsSliceRed'
import { userShowsListeners } from './DatabaseHandlers/Listeners/firebaseListeners'

let appInitialized = false

const useInitializeApp = () => {
  const { firebase } = useFrequentVariables()
  const localStorageHandlers = useContext(LocalStorageHandlersContext)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (appInitialized) return
    appInitialized = true

    let authSubscriber: any
    const authUserListener = () => {
      authSubscriber = firebase.onAuthUserListener(
        async (authUser: AuthUserInterface['authUser']) => {
          console.log('User logged in')
          // await updateUserEpisodesFromDatabase({ firebase })
          dispatch(updateLoadingShows(true))
          await dispatch(setupAuthUser({ authUser, firebase, localStorageHandlers }))
          console.log('setupAuthUser END')
          await dispatch(fetchUserShows(firebase))
          dispatch(userShowsListeners({ firebase }))
        },
        () => {
          console.log('User logged out')
          dispatch(logoutAuthUser())
        },
      )
    }

    authUserListener()
    return () => {
      authSubscriber()
    }
  }, [firebase, dispatch, localStorageHandlers])
}

export default useInitializeApp
