import { useContext, useState } from "react"
import { FirebaseContext } from "Components/Firebase"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { _newContactRequest } from "firebaseHttpCallableFunctionsTests"

type Props = {
  userName: string
  userUid: string
}

const useSendContactRequest = ({ userName, userUid }: Props) => {
  const { authUser, errors } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const [contactRequestLoading, setContactRequestLoading] = useState(false)

  const sendContactRequest = async () => {
    if (contactRequestLoading) return
    const timeStampData = firebase.timeStamp()

    // const newContactRequestCloud = firebase.httpsCallable("newContactRequest")
    // newContactRequestCloud({ contactUid: userUid, contactName: userName, authUser })

    try {
      setContactRequestLoading(true)
      await _newContactRequest({
        data: { contactUid: userUid, contactName: userName, timeStamp: timeStampData },
        context: { authUser: authUser! },
        database: firebase.database()
      })
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: "There has been some error updating database. Please try again."
      })

      throw new Error(`There has been some error updating database: ${error}`)
    } finally {
      setContactRequestLoading(false)
    }
  }

  return { sendContactRequest, contactRequestLoading }
}

export default useSendContactRequest
