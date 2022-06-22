import { ContactStatusInterface } from '../@Types'
import useFrequentVariables from '../../../../Utils/Hooks/UseFrequentVariables'

const useFirebaseReferences = () => {
  const { firebase, authUser, contactsState } = useFrequentVariables()
  const { activeChat, contacts } = contactsState
  const contactInfo = contacts[activeChat.contactKey] || {}

  const updateMemberStatus = ({ value, isGroupChat, callback }: UpdateMemberStatus) =>
    firebase
      .chatMemberStatus({
        chatKey: activeChat.chatKey,
        memberKey: authUser?.uid!,
        isGroupChat: isGroupChat || contactInfo.isGroupChat,
      })
      .update({ ...value }, callback)

  const setMemberStatus = ({ value, isGroupChat, callback }: SetMemberStatus) =>
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

interface UpdateMemberStatus {
  value: ContactStatusInterface
  isGroupChat?: boolean
  callback?: any
}

interface SetMemberStatus extends Omit<UpdateMemberStatus, 'value'> {
  value: ContactStatusInterface | null
}
