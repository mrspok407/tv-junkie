import { useContext } from "react"
import { FirebaseContext } from "Components/Firebase"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { _handleContactRequest } from "firebaseHttpCallableFunctionsTests"

type Props = {
  userUid: string
}

const useSendContactRequest = ({ userUid }: Props) => {
  const { authUser } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)

  const contactRef = firebase.contact({ authUid: authUser?.uid, contactUid: userUid })

  const acceptContactRequest = () => {
    contactRef.update({ status: true }, async () => {
      // This should be in https callable
      const timeStamp = firebase.timeStamp()
      _handleContactRequest({
        data: { contactUid: userUid, status: "accept" },
        context: { auth: { uid: authUser?.uid } },
        database: firebase.database(),
        timeStamp
      })

      // const handleContactRequestCloud = firebase.httpsCallable("handleContactRequest")
      // handleContactRequestCloud({ contactUid: userUid, status: "accept" })
    })
  }

  const rejectContactRequest = () => {
    contactRef.set(null, async () => {
      const timeStamp = firebase.timeStamp()
      _handleContactRequest({
        data: { contactUid: userUid, status: "rejected" },
        context: { auth: { uid: authUser?.uid } },
        database: firebase.database(),
        timeStamp
      })

      // const handleContactRequestCloud = firebase.httpsCallable("handleContactRequest")
      // handleContactRequestCloud({ contactUid: userUid, status: "rejected" })
    })
  }

  return { acceptContactRequest, rejectContactRequest }
}

export default useSendContactRequest
