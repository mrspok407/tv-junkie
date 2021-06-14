import { ErrorsInterface } from "Components/AppContext/AppContextHOC"
import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import { ActiveChatInterface, ContactStatusInterface, MessageInterface } from "Components/Pages/Contacts/@Types"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"

let typingTimer: number | null = null
const TIMEOUT = 1500
export const updateTyping = async ({
  activeChat,
  authUser,
  firebase,
  setTypingNull = null,
  isGroupChat
}: {
  activeChat: ActiveChatInterface
  authUser: AuthUserInterface | null
  firebase: FirebaseInterface
  setTypingNull?: boolean | null
  isGroupChat: boolean
}) => {
  if (setTypingNull) {
    firebase.chatMemberStatus({ chatKey: activeChat.chatKey, memberKey: authUser?.uid!, isGroupChat }).update({
      isTyping: null
    })
    return
  }

  firebase.chatMemberStatus({ chatKey: activeChat.chatKey, memberKey: authUser?.uid!, isGroupChat }).update({
    isTyping: true
  })
  if (typingTimer) window.clearTimeout(typingTimer)
  typingTimer = window.setTimeout(() => {
    firebase.chatMemberStatus({ chatKey: activeChat.chatKey, memberKey: authUser?.uid!, isGroupChat }).update({
      isTyping: null
    })
  }, TIMEOUT)
}
