import { useEffect } from 'react'
import { AuthUserInterface } from 'Components/UserAuth/Session/WithAuthentication/@Types'
import { useAppDispatch } from 'app/hooks'
import { resetAuthUser } from 'Components/UserAuth/Session/WithAuthentication/authUserSlice'
import setupAuthUser from 'Components/UserAuth/Session/WithAuthentication/Middleware/setupAuthUser'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { fetchUserShows } from './Middleware'

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
          await dispatch(setupAuthUser(authUser, firebase))
          console.log('setupAuthUser END')
          dispatch(fetchUserShows(firebase))
        },
        () => {
          console.log('User logged out')
          dispatch(resetAuthUser())
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
