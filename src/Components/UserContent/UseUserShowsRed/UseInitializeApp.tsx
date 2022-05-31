import { useEffect } from 'react'
import { AuthUserInterface } from 'Components/UserAuth/Session/WithAuthentication/@Types'
import { useAppDispatch } from 'app/hooks'
import setupAuthUser from 'Components/UserAuth/Session/WithAuthentication/Middleware/setupAuthUser'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { logoutAuthUser } from 'Components/UserAuth/Session/WithAuthentication/Middleware/logoutAuthUser'
import { fetchUserShows } from './Middleware'
import { updateLoadingShows } from './userShowsSliceRed'

const useInitializeApp = () => {
  const { firebase } = useFrequentVariables()
  const dispatch = useAppDispatch()

  useEffect(() => {
    let authSubscriber: any
    const authUserListener = () => {
      authSubscriber = firebase.onAuthUserListener(
        async (authUser: AuthUserInterface['authUser']) => {
          console.log('User logged in')
          // await updateUserEpisodesFromDatabase({ firebase })
          dispatch(updateLoadingShows(true))
          await dispatch(setupAuthUser(authUser, firebase))
          console.log('setupAuthUser END')
          dispatch(fetchUserShows(firebase))
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
  }, [firebase, dispatch])
}

export default useInitializeApp
