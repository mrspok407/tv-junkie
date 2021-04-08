import { useContext } from "react"
import { FirebaseContext } from "Components/Firebase"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { _handleContactRequest } from "firebaseHttpCallableFunctionsTests"

type Props = {
  userUid: string
}

const useSendContactRequest = ({ userUid }: Props) => {
  const { authUser, errors } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)

  const contactRef = firebase.contact({ authUid: authUser?.uid, contactUid: userUid })

  const acceptContactRequest = () => {
    const timeStamp = firebase.timeStamp()

    try {
      contactRef.update({ status: true }, async (error: any) => {
        if (error) {
          contactRef.update({ status: false })
          errors.handleError({
            errorData: error,
            message: "There has been some error accepting contact request. Please try again."
          })
          throw new Error(`There has been some error accepting contact request: ${error}`)
        }

        try {
          // This should be in https callable
          await _handleContactRequest({
            data: { contactUid: userUid, status: "accept" },
            context: { auth: { uid: authUser?.uid } },
            database: firebase.database(),
            timeStamp
          })

          // const handleContactRequestCloud = firebase.httpsCallable("handleContactRequest")
          // handleContactRequestCloud({ contactUid: userUid, status: "accept" })
        } catch (error) {
          errors.handleError({
            errorData: error,
            message: "There has been some error accepting contact request. Please try again."
          })

          throw new Error(`There has been some error accepting contact request: ${error}`)
        }
      })
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: "There has been some error accepting contact request. Please try again."
      })

      throw new Error(`There has been some error accepting contact request: ${error}`)
    }
  }

  // const rejectContactRequest = () => {
  //   contactRef.set(null, async () => {
  //     const timeStamp = firebase.timeStamp()
  //     _handleContactRequest({
  //       data: { contactUid: userUid, status: "rejected" },
  //       context: { auth: { uid: authUser?.uid } },
  //       database: firebase.database(),
  //       timeStamp
  //     })

  //     // const handleContactRequestCloud = firebase.httpsCallable("handleContactRequest")
  //     // handleContactRequestCloud({ contactUid: userUid, status: "rejected" })
  //   })
  // }

  return { acceptContactRequest }
}

export default useSendContactRequest
