import { useCallback, useRef, useContext } from 'react'
import { AuthUserInterface } from 'Components/UserAuth/Session/Authentication/@Types'
import { useAppDispatch } from 'app/hooks'
import setupAuthUser from 'Components/UserAuth/Session/Authentication/AuthUserHandlers/setupAuthUser'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { logoutAuthUser } from 'Components/UserAuth/Session/Authentication/AuthUserHandlers/logoutAuthUser'
import { LocalStorageHandlersContext } from 'Components/AppContext/Contexts/LocalStorageContentContext/LocalStorageContentContext'
import { updateLoadingShows } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { fetchUserShows } from 'Components/UserContent/UseUserShowsRed/DatabaseHandlers/FetchData/fetchShowsData'
import { userShowsListeners } from 'Components/UserContent/UseUserShowsRed/DatabaseHandlers/Listeners/firebaseListeners'

const useAuthListenerSubscriber = () => {
  const { firebase } = useFrequentVariables()
  const localStorageHandlers = useContext(LocalStorageHandlersContext)
  const dispatch = useAppDispatch()

  const authSubscriber = useRef<any>()

  const authUserListener = useCallback(() => {
    authSubscriber.current = firebase.onAuthUserListener(
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
        authSubscriber.current()
        console.log('User logged out')
        dispatch(logoutAuthUser())
      },
    )
  }, [firebase, dispatch, localStorageHandlers])

  return authUserListener
}

export default useAuthListenerSubscriber
