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

  const sendContactRequest = () => {
    const contactRef = firebase.contact({ authUid: authUser?.uid, contactUid: userUid })
    const timeStamp = firebase.timeStamp()

    try {
      contactRef.set(
        {
          status: false,
          receiver: true,
          userName,
          pinned_lastActivityTS: "false",
          timeStamp,
          recipientNotified: false
        },
        async (error: any) => {
          // This should be in https callable
          if (error) {
            errors.handleError({
              errorData: error,
              message: "There has been some error sending contact request. Please try again."
            })

            throw new Error(`There has been some error sending contact request: ${error}`)
          }

          const contactInfo = await contactRef.once("value")
          const timeStamp = contactInfo.val().timeStamp
          const isPinned = !!(contactInfo.val().pinned_lastActivityTS.slice(0, 4) === "true")
          contactRef.update({ pinned_lastActivityTS: `${isPinned}_${timeStamp}` })

          const newContactRequestCloud = firebase.httpsCallable("newContactRequest")
          newContactRequestCloud({ contactUid: userUid, timeStamp }).then((res: any) => {
            console.log(res)
          })
          // _newContactRequest({
          //   data: { contactUid: userUid, timeStamp: timeStamp },
          //   context: { auth: { uid: authUser?.uid } },
          //   database: firebase.database()
          // })
        }
      )
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: "There has been some error sending contact request. Please try again."
      })

      throw new Error(`There has been some error sending contact request: ${error}`)
    }
  }

  const resendContactRequest = () => {
    const contactRef = firebase.contact({ authUid: authUser?.uid, contactUid: userUid })
    const timeStamp = firebase.timeStamp()

    try {
      contactRef.update({ status: false, timeStamp }, async () => {
        const contactInfo = await contactRef.once("value")
        const timeStamp = contactInfo.val().timeStamp
        const isPinned = !!(contactInfo.val().pinned_lastActivityTS.slice(0, 4) === "true")
        contactRef.update({ pinned_lastActivityTS: `${isPinned}_${timeStamp}` })

        // const newContactRequestCloud = firebase.httpsCallable("newContactRequest")
        // newContactRequestCloud({ contactUid: userUid, timeStamp })
        _newContactRequest({
          data: { contactUid: userUid, timeStamp: timeStamp },
          context: { auth: { uid: authUser?.uid } },
          database: firebase.database()
        })
      })
    } catch (error) {}
  }

  return { sendContactRequest, resendContactRequest }
}

export default useSendContactRequest
