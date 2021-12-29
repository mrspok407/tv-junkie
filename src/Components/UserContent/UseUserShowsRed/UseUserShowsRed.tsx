import { useEffect, useContext } from "react"
import { FirebaseContext } from "Components/Firebase"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"
import { useAppDispatch, useAppSelector } from "app/hooks"
import { fetchUserShows } from "./Middleware"
import { selectShows, updateInitialLoading } from "./userShowsSliceRed"
import { selectFirebase } from "Components/Firebase/credentialsSlice"

const useUserShowsRed = () => {
  const firebase = useAppSelector(selectFirebase)
  const dispatch = useAppDispatch()

  // const store = useAppSelector((state) => state)
  // console.log({ userShowsRedux: store })

  useEffect(() => {
    let authSubscriber: any
    const authUserListener = () => {
      authSubscriber = firebase.onAuthUserListener(
        async (authUser: AuthUserInterface) => {
          // await updateUserEpisodesFromDatabase({ firebase })
          dispatch(fetchUserShows(authUser.uid))
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
