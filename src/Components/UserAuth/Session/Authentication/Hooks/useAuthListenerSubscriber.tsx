import { useCallback, useRef, useContext } from 'react'
import { AuthUserInterface } from 'Components/UserAuth/Session/Authentication/@Types'
import { useAppDispatch } from 'app/hooks'
import setupAuthUser from 'Components/UserAuth/Session/Authentication/AuthUserHandlers/setupAuthUser'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { logoutAuthUser } from 'Components/UserAuth/Session/Authentication/AuthUserHandlers/logoutAuthUser'
import { LocalStorageHandlersContext } from 'Components/AppContext/Contexts/LocalStorageContentContext/LocalStorageContentContext'
import { fetchUserShows } from 'Components/UserContent/UseUserShowsRed/DatabaseHandlers/FetchData/fetchShowsData'
import { userShowsListeners } from 'Components/UserContent/UseUserShowsRed/DatabaseHandlers/Listeners/firebaseListeners'
import { setInitialContentLoading } from 'Components/UserContent/SharedActions'
import { fetchUserMovies } from 'Components/UserContent/UseUserMoviesRed/DatabaseHandlers/FetchData/fetchMoviesData'

const useAuthListenerSubscriber = () => {
  const { firebase } = useFrequentVariables()
  const localStorageHandlers = useContext(LocalStorageHandlersContext)
  const dispatch = useAppDispatch()

  const authSubscriber = useRef<any>()

  const initializeAuthUserListener = useCallback(() => {
    authSubscriber.current = firebase.onAuthUserListener(
      async (authUser: AuthUserInterface['authUser']) => {
        console.log('User logged in')
        // await updateUserEpisodesFromDatabase({ firebase })
        dispatch(setInitialContentLoading(true))
        await dispatch(setupAuthUser({ authUser, firebase, localStorageHandlers }))
        console.log('setupAuthUser END')
        dispatch(fetchUserMovies(firebase))
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

  return initializeAuthUserListener
}

export default useAuthListenerSubscriber
