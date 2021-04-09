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

  const sendContactRequest = async () => {
    const contactRef = firebase.contact({ authUid: authUser?.uid, contactUid: userUid })
    const timeStampData = firebase.timeStamp()

    try {
      await contactRef.set({
        status: false,
        receiver: true,
        userName,
        pinned_lastActivityTS: "false",
        timeStamp: timeStampData,
        recipientNotified: false
      })

      // const newContactRequestCloud = firebase.httpsCallable("newContactRequest")
      // await newContactRequestCloud({ contactUid: userUid, timeStamp })

      const contactInfo = await contactRef.once("value")
      const timeStamp = contactInfo.val().timeStamp
      const isPinned = !!(contactInfo.val().pinned_lastActivityTS.slice(0, 4) === "true")

      await contactRef.update({ pinned_lastActivityTS: `${isPinned}_${timeStamp}` })
      await _newContactRequest({
        data: { contactUid: userUid, timeStamp: timeStamp },
        context: { auth: { uid: authUser?.uid } },
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

  const resendContactRequest = () => {
    const contactRef = firebase.contact({ authUid: authUser?.uid, contactUid: userUid })
    const timeStamp = firebase.timeStamp()

    try {
      contactRef.update({ status: false, timeStamp }, async (error: any) => {
        if (error) {
          contactRef.set(null)
          errors.handleError({
            errorData: error,
            message: "There has been some error sending contact request. Please try again."
          })
          throw new Error(`There has been some error sending contact request: ${error}`)
        }

        const contactInfo = await contactRef.once("value")
        const timeStamp = contactInfo.val().timeStamp
        const isPinned = !!(contactInfo.val().pinned_lastActivityTS.slice(0, 4) === "true")

        // const newContactRequestCloud = firebase.httpsCallable("newContactRequest")

        contactRef.update({ pinned_lastActivityTS: `${isPinned}_${timeStamp}` })
        try {
          // newContactRequestCloud({ contactUid: userUid, timeStamp })
          _newContactRequest({
            data: { contactUid: userUid, timeStamp: timeStamp, resendRequest: true },
            context: { auth: { uid: authUser?.uid } },
            database: firebase.database()
          })
        } catch (error) {
          console.log({ error })
          errors.handleError({
            errorData: error,
            message: "There has been some error sending contact request. Please try again."
          })

          throw new Error(`There has been some error sending contact request: ${error}`)
        }
      })
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: "There has been some error sending contact request. Please try again."
      })

      throw new Error(`There has been some error sending contact request: ${error}`)
    }
  }

  return { sendContactRequest, resendContactRequest }
}

export default useSendContactRequest
