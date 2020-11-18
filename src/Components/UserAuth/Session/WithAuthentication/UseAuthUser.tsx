import { useState, useEffect, useContext } from "react"
import { FirebaseContext } from "Components/Firebase"

const useAuthUser = () => {
  const [authUser, setAuthUser] = useState<any>(JSON.parse(localStorage.getItem("authUser")!))
  const firebase = useContext(FirebaseContext)

  const authUserListener = () => {
    firebase.onAuthUserListener(
      (authUser: { uid: string }) => {
        // console.log("setting authUser in LS")
        localStorage.setItem("authUser", JSON.stringify(authUser))
        setAuthUser(authUser)
      },
      () => {
        localStorage.removeItem("authUser")
        setAuthUser(null)
      }
    )
  }

  useEffect(() => {
    authUserListener()
    return () => {
      authUserListener()
    }
    // eslint-disable-next-line
  }, [])

  return authUser
}

export default useAuthUser
