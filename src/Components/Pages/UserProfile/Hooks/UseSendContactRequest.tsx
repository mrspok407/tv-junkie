import { useContext } from "react"
import { FirebaseContext } from "Components/Firebase"
import { AppContext } from "Components/AppContext/AppContextHOC"

type Props = {
  userName: string
  userUid: string
}

const useSendContactRequest = ({ userName, userUid }: Props) => {
  const { authUser } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)

  const sendContactRequest = () => {
    const contactRef = firebase.contact({ authUid: authUser?.uid, contactUid: userUid })
    const timeStamp = firebase.timeStamp()

    contactRef.set(
      {
        status: false,
        receiver: true,
        userName,
        pinned_lastActivityTS: "false",
        timeStamp,
        recipientNotified: false
      },
      async () => {
        // This should be in https callable
        const contactInfo = await contactRef.once("value")
        const timeStamp = contactInfo.val().timeStamp
        const isPinned = !!(contactInfo.val().pinned_lastActivityTS.slice(0, 4) === "true")
        contactRef.update({ pinned_lastActivityTS: `${isPinned}_${timeStamp}` })

        // const newContactRequestCloud = firebase.httpsCallable("newContactRequest")
        // newContactRequestCloud({ contactUid: userUid, timeStamp })

        const authUserName = await firebase.users().child(`${authUser?.uid}/username`).once("value")

        firebase
          .users()
          .child(`${userUid}/contactsDatabase/contactsList/${authUser?.uid}`)
          .set({
            status: false,
            receiver: false,
            userName: authUserName.val(),
            pinned_lastActivityTS: `false_${timeStamp}`,
            timeStamp,
            recipientNotified: false,
            newActivity: true
          })
        firebase.users().child(`${userUid}/contactsDatabase/newContactsRequests/${authUser?.uid}`).set(true)
        firebase.users().child(`${userUid}/contactsDatabase/newContactsActivity`).set(true)
      }
    )
  }

  const resendContactRequest = () => {}

  return { sendContactRequest, resendContactRequest }
}

export default useSendContactRequest
