import { ErrorsInterface } from "Components/AppContext/AppContextHOC"
import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import {
  ActiveChatInterface,
  ContactInfoInterface,
  ContactStatusInterface,
  MessageInterface
} from "Components/Pages/Contacts/@Types"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"

export const sendMessage = async ({
  activeChat,
  authUser,
  firebase,
  message,
  contactStatusData: contactStatusData,
  contactsData
}: {
  activeChat: ActiveChatInterface
  authUser: AuthUserInterface | null
  firebase: FirebaseInterface
  message: string
  contactStatusData: ContactStatusInterface
  contactsData: ContactInfoInterface[]
}) => {
  const firstUnpinnedContactIndex = contactsData.findIndex(
    (contact) => contact.pinned_lastActivityTS.slice(0, 4) !== "true"
  )
  const activeContactIndex = contactsData.findIndex((contact) => contact.key === activeChat.contactKey)
  const updateContactLastActivity = Math.max(firstUnpinnedContactIndex, 0) < activeContactIndex

  const timeStampEpoch = new Date().getTime()
  const messageRef = firebase.privateChats().child(`${activeChat.chatKey}/messages`).push()
  const messageKey = messageRef.key
  const updateData: any = {
    [`privateChats/${activeChat.chatKey}/messages/${messageKey}`]: {
      sender: authUser?.uid,
      message,
      timeStamp: timeStampEpoch * 2
    },
    [`privateChats/${activeChat.chatKey}/members/${activeChat.contactKey}/unreadMessages/${messageKey}`]:
      !contactStatusData?.isOnline || !contactStatusData?.chatBottom || !contactStatusData?.pageInFocus ? true : null,
    [`privateChats/${activeChat.chatKey}/members/${authUser?.uid}/status/isTyping`]: null
  }
  if (updateContactLastActivity) {
    updateData[`users/${authUser?.uid}/contactsDatabase/contactsLastActivity/${activeChat.contactKey}`] = timeStampEpoch
  }
  await firebase.database().ref().update(updateData)
  return messageKey
}
