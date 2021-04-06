import { useState, useEffect, useContext } from "react"
import { FirebaseContext } from "Components/Firebase"
import useAuthUser from "Components/UserAuth/Session/WithAuthentication/UseAuthUser"

const useNewContactsActivity = () => {
  const firebase = useContext(FirebaseContext)
  const authUser = useAuthUser()

  const [newContactsActivity, setNewContactsActivity] = useState(false)

  useEffect(() => {
    firebase.newContactsActivity({ uid: authUser?.uid }).on("value", (snapshot: any) => {
      setNewContactsActivity(snapshot.val())
    })
    firebase.newContactsRequests({ uid: authUser?.uid }).on("value", (snapshot: any) => {
      setNewContactsActivity(!!snapshot.exists())
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return newContactsActivity
}

export default useNewContactsActivity
