import { useEffect, useContext } from "react"
import { FirebaseContext } from "Components/Firebase"
import { AuthUserInterface } from "Components/UserAuth/Session/WithAuthentication/@Types"
import { useAppDispatch } from "app/hooks"
import { fetchUserShows } from "./Middleware"
import { resetAuthUser } from "Components/UserAuth/Session/WithAuthentication/authUserSlice"
import setupAuthUser from "Components/UserAuth/Session/WithAuthentication/Middleware/setupAuthUser"

const useInitializeApp = () => {
  const firebase = useContext(FirebaseContext)
  const dispatch = useAppDispatch()

  useEffect(() => {
    let authSubscriber: any
    const authUserListener = () => {
      authSubscriber = firebase.onAuthUserListener(
        async (authUser: AuthUserInterface["authUser"]) => {
          console.log("User logged in")
          // await updateUserEpisodesFromDatabase({ firebase })
          await dispatch(setupAuthUser(authUser, firebase))
          console.log("setupAuthUser END")
          dispatch(fetchUserShows(firebase))
        },
        () => {
          console.log("User logged out")
          dispatch(resetAuthUser())
        }
      )
    }

    authUserListener()
    return () => {
      authSubscriber()
    }
  }, [firebase, dispatch])
}

export default useInitializeApp
