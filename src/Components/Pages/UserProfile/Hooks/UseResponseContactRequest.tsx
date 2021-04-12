import { useContext } from "react"
import { FirebaseContext } from "Components/Firebase"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { _handleContactRequest } from "firebaseHttpCallableFunctionsTests"

type Props = {
  userUid: string
}

const useResponseContactRequest = ({ userUid }: Props) => {
  const { authUser, errors } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)

  const handleContactRequest = async ({ status }: { status: string }) => {
    const timeStamp = firebase.timeStamp()

    try {
      await _handleContactRequest({
        data: { contactUid: userUid, status },
        context: { auth: { uid: authUser?.uid } },
        database: firebase.database(),
        timeStamp
      })

      // const handleContactRequestCloud = firebase.httpsCallable("handleContactRequest")
      // handleContactRequestCloud({ contactUid: userUid, status: "accept" })
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: "There has been some error handling contact request. Please try again."
      })

      throw new Error(`There has been some error handling contact request: ${error}`)
    }
  }

  return { handleContactRequest }
}

export default useResponseContactRequest
