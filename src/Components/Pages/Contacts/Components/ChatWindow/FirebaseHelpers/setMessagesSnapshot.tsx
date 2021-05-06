import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import { SnapshotStringBooleanInterface } from "Components/Pages/Contacts/Types"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"
import { MESSAGES_TO_LOAD } from "../../Context/Constants"

export const setMessagesSnapshot = async ({
  chatKey,
  authUser,
  messagesRef,
  firebase
}: {
  chatKey: string
  authUser: AuthUserInterface | null
  messagesRef: any
  firebase: FirebaseInterface
}) => {
  try {
    const authUserUnreadMessages: SnapshotStringBooleanInterface = await firebase
      .unreadMessages({ chatKey, uid: authUser?.uid })
      .limitToFirst(1)
      .once("value")

    if (authUserUnreadMessages.val() === null) {
      return await Promise.all([
        messagesRef.orderByChild("timeStamp").limitToLast(MESSAGES_TO_LOAD).once("value"),
        authUserUnreadMessages
      ])
    }

    const firstUnreadMessageTimeStamp: any = await firebase
      .message({ chatKey, messageKey: Object.keys(authUserUnreadMessages.val()!)[0] })
      .child("timeStamp")
      .once("value")

    const additionalMessages = await messagesRef
      .orderByChild("timeStamp")
      .endBefore(firstUnreadMessageTimeStamp.val())
      .limitToLast(MESSAGES_TO_LOAD)
      .once("value")

    return await Promise.all([
      messagesRef
        .orderByChild("timeStamp")
        .startAt(
          additionalMessages.val() === null
            ? firstUnreadMessageTimeStamp.val()
            : additionalMessages.val()[`${Object.keys(additionalMessages.val())[0]}`].timeStamp
        )
        .once("value"),
      authUserUnreadMessages
    ])
  } catch (error) {
    throw new Error("There were a problem loading messages. Please try to reload the page.")
  }
}
