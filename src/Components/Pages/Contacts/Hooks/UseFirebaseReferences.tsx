import { ContactStatusInterface } from "../@Types"
import useFrequentVariables from "./UseFrequentVariables"

const useFirebaseReferences = () => {
  const { firebase, authUser, contactsState } = useFrequentVariables()
  const { activeChat, contacts } = contactsState
  const contactInfo = contacts[activeChat.contactKey] || {}

  const updateMemberStatus = ({ value, isGroupChat, callback }: updateMemberStatus) => {
    return firebase
      .chatMemberStatus({
        chatKey: activeChat.chatKey,
        memberKey: authUser?.uid!,
        isGroupChat: isGroupChat || contactInfo.isGroupChat
      })
      .update({ ...value }, callback)
  }

  const setMemberStatus = ({ value, isGroupChat, callback }: setMemberStatus) => {
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

interface updateMemberStatus {
  value: ContactStatusInterface
  isGroupChat?: boolean
  callback?: any
}

interface setMemberStatus extends Omit<updateMemberStatus, "value"> {
  value: ContactStatusInterface | null
}
