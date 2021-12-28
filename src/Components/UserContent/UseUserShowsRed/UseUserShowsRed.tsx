import { useEffect, useContext } from "react"
import { FirebaseContext } from "Components/Firebase"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"
import { useAppDispatch, useAppSelector } from "app/hooks"
import { fetchUserShows } from "./Middleware"
import { selectShows } from "./userShowsSliceRed"

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
          if (!authUser) return
          // await updateUserEpisodesFromDatabase({ firebase })

          try {
            dispatch(fetchUserShows(authUser.uid, firebase))
          } catch (error) {}
        },
        () => {
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
