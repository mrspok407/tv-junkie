import { ContactStatusInterface } from '../@Types'
import useFrequentVariables from '../../../../Utils/Hooks/UseFrequentVariables'

const useFirebaseReferences = () => {
  const { firebase, authUser, contactsState } = useFrequentVariables()
  const { activeChat, contacts } = contactsState
  const contactInfo = contacts[activeChat.contactKey] || {}

  const updateMemberStatus = ({ value, isGroupChat, callback }: ГpdateMemberStatus) =>
    firebase
      .chatMemberStatus({
        chatKey: activeChat.chatKey,
        memberKey: authUser?.uid!,
        isGroupChat: isGroupChat || contactInfo.isGroupChat,
      })
      .update({ ...value }, callback)

  const setMemberStatus = ({ value, isGroupChat, callback }: ЫetMemberStatus) =>
    firebase
      .chatMemberStatus({
        chatKey: activeChat.chatKey,
        memberKey: authUser?.uid!,
        isGroupChat: isGroupChat || contactInfo.isGroupChat,
      })
      .set(value, callback)

  return {
    updateMemberStatus,
    setMemberStatus,
  }
}

export default useFirebaseReferences

interface ГpdateMemberStatus {
  value: ContactStatusInterface
  isGroupChat?: boolean
  callback?: any
}

interface ЫetMemberStatus extends Omit<ГpdateMemberStatus, 'value'> {
  value: ContactStatusInterface | null
}
