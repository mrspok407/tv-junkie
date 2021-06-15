import { useState, useEffect, useContext } from "react"
import { FirebaseContext } from "Components/Firebase"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"

const useAuthUser = () => {
  const [authUser, setAuthUser] = useState<AuthUserInterface | null>(JSON.parse(localStorage.getItem("authUser")!))
  const firebase = useContext(FirebaseContext)

  useEffect(() => {
    let authSubscriber: any
    const authUserListener = () => {
      authSubscriber = firebase.onAuthUserListener(
        async (authUser: AuthUserInterface) => {
          const username = await firebase.user(authUser.uid).child("username").once("value")
          authUser.username = username.val() || ""
          localStorage.setItem("authUser", JSON.stringify(authUser))
          setAuthUser(authUser)
        },
        () => {
          localStorage.removeItem("authUser")
          setAuthUser(null)
        }
      )
    }

    authUserListener()
    return () => {
      authSubscriber()
    }
  }, [firebase])

  return authUser
}

export default useAuthUser
