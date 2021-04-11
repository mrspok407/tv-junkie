import { useCallback, useContext } from "react"
import { FirebaseContext } from "Components/Firebase"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { _updateRecipientNotified } from "firebaseHttpCallableFunctionsTests"

type Props = {
  userUid: string
}

const useRecipientNotified = ({ userUid }: Props) => {
  const { authUser, errors } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)

  const updateRecipientNotified = useCallback(async () => {
    const contactRef = firebase.contact({ authUid: authUser?.uid, contactUid: userUid })

    console.log("useCallback")

    try {
      await _updateRecipientNotified({
        data: { contactUid: userUid },
        context: { auth: { uid: authUser?.uid } },
        database: firebase.database()
      })
    } catch (error) {
      contactRef.child("recipientNotified").off()
      contactRef.child("receiver").off()
      errors.handleError({
        errorData: error,
        message: "There has been some error updating database. Please try again."
      })
      throw new Error(`There has been some error updating database: ${error}`)
    }
  }, [firebase, authUser, errors, userUid])

  return { updateRecipientNotified }
}

export default useRecipientNotified
