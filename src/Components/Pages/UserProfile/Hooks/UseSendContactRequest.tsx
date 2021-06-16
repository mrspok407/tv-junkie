import { useContext } from "react"
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

  const sendContactRequest = async ({ resendRequest = false }) => {
    const timeStampData = firebase.timeStamp()

    // const newContactRequestCloud = firebase.httpsCallable("newContactRequest")
    // newContactRequestCloud({ contactUid: userUid, contactName: userName, resendRequest })

    try {
      await _newContactRequest({
        data: { contactUid: userUid, contactName: userName, timeStamp: timeStampData, resendRequest },
        context: { authUser: authUser! },
        database: firebase.database()
      })
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: "There has been some error updating database. Please try again."
      })

      throw new Error(`There has been some error updating database: ${error}`)
    }
  }

  return { sendContactRequest }
}

export default useSendContactRequest
