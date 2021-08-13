import { ContactStatusInterface } from "../@Types"
import useFrequentVariables from "./UseFrequentVariables"

const useFirebaseReferences = () => {
  const { firebase, authUser, contactsState } = useFrequentVariables()
  const { activeChat, contacts } = contactsState
  const contactInfo = contacts[activeChat.contactKey] || {}

  const updateMemberStatus = ({
    value,
    isGroupChat,
    callback
  }: {
    value: ContactStatusInterface
    isGroupChat?: boolean
    callback?: any
  }) => {
    return firebase
      .chatMemberStatus({
        chatKey: activeChat.chatKey,
        memberKey: authUser?.uid!,
        isGroupChat: isGroupChat || contactInfo.isGroupChat
      })
      .update({ ...value }, callback)
  }

  const setMemberStatus = ({
    value,
    isGroupChat,
    callback
  }: {
    value: ContactStatusInterface | null
    isGroupChat?: boolean
    callback?: any
  }) => {
    return firebase
      .chatMemberStatus({
        chatKey: activeChat.chatKey,
        memberKey: authUser?.uid!,
        isGroupChat: isGroupChat || contactInfo.isGroupChat
      })
      .set(value, callback)
  }

  return {
    updateMemberStatus,
    setMemberStatus
  }
}

export default useFirebaseReferences
