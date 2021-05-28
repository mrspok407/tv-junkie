import { ErrorsInterface } from "Components/AppContext/AppContextHOC"
import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import { ActiveChatInterface, ContactStatusInterface, MessageInterface } from "Components/Pages/Contacts/@Types"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"

export const editMessage = async ({
  activeChat,
  firebase,
  authUser,
  editedMessageText,
  originalMessage
}: {
  activeChat: ActiveChatInterface
  firebase: FirebaseInterface
  authUser: AuthUserInterface | null
  editedMessageText: string
  originalMessage: MessageInterface
}) => {
  console.log(originalMessage.message)
  console.log(editedMessageText)
  if (originalMessage.message === editedMessageText) return
  const updateData = {
    [`messages/${originalMessage.key}`]: {
      sender: originalMessage.sender,
      timeStamp: originalMessage.timeStamp,
      message: editedMessageText,
      isEdited: true
    },
    [`members/${authUser?.uid}/status/isTyping`]: null
  }
  return await firebase.privateChats().child(activeChat.chatKey).update(updateData)
}
