import { ErrorsInterface } from "Components/AppContext/AppContextHOC"
import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import { ActiveChatInterface, ContactStatusInterface, MessageInterface } from "Components/Pages/Contacts/@Types"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"

export const sendMessage = async ({
  activeChat,
  authUser,
  firebase,
  message,
  contactsStatusData
}: {
  activeChat: ActiveChatInterface
  authUser: AuthUserInterface | null
  firebase: FirebaseInterface
  message: string
  contactsStatusData: ContactStatusInterface
}) => {
  const timeStampEpoch = new Date().getTime()
  const messageRef = firebase.privateChats().child(`${activeChat.chatKey}/messages`).push()
  const messageKey = messageRef.key
  const updateData = {
    [`messages/${messageKey}`]: {
      sender: authUser?.uid,
      message,
      timeStamp: timeStampEpoch * 2
    },
    [`members/${activeChat.contactKey}/unreadMessages/${messageKey}`]:
      !contactsStatusData?.isOnline || !contactsStatusData?.chatBottom || !contactsStatusData?.pageInFocus ? true : null
  }
  await firebase.privateChats().child(activeChat.chatKey).update(updateData)
  return messageKey
}
