import { useEffect, useContext } from "react"
import { FirebaseContext } from "Components/Firebase"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"
import { useAppDispatch, useAppSelector } from "app/hooks"
import { fetchUserShows } from "./Middleware"
import { selectShows, updateInitialLoading } from "./userShowsSliceRed"
import { batch } from "react-redux"
import { setAuthUser } from "Components/UserAuth/Session/WithAuthentication/authUserSlice"
import setupAuthUser from "Components/UserAuth/Session/WithAuthentication/Middleware/setupAuthUser"

const useUserShowsRed = () => {
  const firebase = useContext(FirebaseContext)
  const dispatch = useAppDispatch()

  // const store = useAppSelector((state) => state)
  // console.log({ userShowsRedux: store })

  useEffect(() => {
    let authSubscriber: any
    const authUserListener = () => {
      authSubscriber = firebase.onAuthUserListener(
        async (authUser: AuthUserInterface) => {
          // await updateUserEpisodesFromDatabase({ firebase })
          await dispatch(setupAuthUser(authUser, firebase))
          console.log("setupAuthUser END")
          dispatch(fetchUserShows(firebase))
        },
        () => {
          dispatch(updateInitialLoading(false))
          authSubscriber()
        }
      )
    }

    authUserListener()
    return () => {
      authSubscriber()
    }
  }, [firebase, dispatch])
}

export default useUserShowsRed
