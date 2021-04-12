import { useState, useEffect, useContext } from "react"
import { FirebaseContext } from "Components/Firebase"
import useAuthUser from "Components/UserAuth/Session/WithAuthentication/UseAuthUser"

const useNewContactsActivity = () => {
  const firebase = useContext(FirebaseContext)
  const authUser = useAuthUser()

  const [newActivity, setNewActivity] = useState(false)
  const [newRequests, setNewRequests] = useState(false)

  const [newContactsActivity, setNewContactsActivity] = useState(false)

  useEffect(() => {
    firebase.newContactsActivity({ uid: authUser?.uid }).on("value", (snapshot: any) => {
      setNewActivity(!!snapshot.exists())
    })
    firebase.newContactsRequests({ uid: authUser?.uid }).on("value", (snapshot: any) => {
      setNewRequests(!!snapshot.exists())
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setNewContactsActivity(newActivity || newRequests === true ? true : false)
  }, [newActivity, newRequests])

  return newContactsActivity
}

export default useNewContactsActivity
