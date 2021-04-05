import { useContext } from "react"
import { FirebaseContext } from "Components/Firebase"
import { AppContext } from "Components/AppContext/AppContextHOC"

type Props = {
  userUid: string
}

const useSendContactRequest = ({ userUid }: Props) => {
  const { authUser } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)

  const acceptContactRequest = () => {
    const contactRef = firebase.contact({ authUid: authUser?.uid, contactUid: userUid })
    contactRef.update({ status: true }, async () => {
      // This should be in https callable
      const timeStamp = firebase.timeStamp()
      let isPinned: boolean

      try {
        const pinnedLastActivityTS = await firebase
          .user(userUid)
          .child(`contactsDatabase/contactsList/${authUser?.uid}`)
          .child("pinned_lastActivityTS")
          .once("value")

        isPinned = !!(pinnedLastActivityTS.val().slice(0, 4) === "true")
      } catch (error) {
        console.log(error)
      }

      firebase
        .user(userUid)
        .child(`contactsDatabase/contactsList/${authUser?.uid}`)
        .update(
          {
            status: true,
            newActivity: true,
            timeStamp
          },
          async () => {
            const timeStamp = await firebase
              .user(userUid)
              .child(`contactsDatabase/contactsList/${authUser?.uid}`)
              .child("timeStamp")
              .once("value")

            firebase
              .user(userUid)
              .child(`contactsDatabase/contactsList/${authUser?.uid}`)
              .update({ pinned_lastActivityTS: `${isPinned}_${timeStamp.val()}` })
          }
        )
    })
  }

  const rejectContactRequest = () => {}

  return { acceptContactRequest, rejectContactRequest }
}

export default useSendContactRequest
