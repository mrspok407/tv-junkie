import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import useHandleMessageOptions from "../../MessageInfo/FirebaseHelpers/UseHandleMessageOptions"

const useSelectOptions = () => {
  const { contactsState, contactsDispatch } = useFrequentVariables()
  const { activeChat, selectedMessages } = contactsState

  const selectedMessagesData = selectedMessages[activeChat.chatKey]

  const { deleteMessagePrivateChat, deleteMessageGroupChat } = useHandleMessageOptions({})

  const deleteSelectedMessages = async () => {
    await deleteMessagePrivateChat({ deleteMessagesKeys: selectedMessagesData })
    contactsDispatch({ type: "clearSelectedMessages", payload: { chatKey: activeChat.chatKey } })
  }

  const deleteSelectedMessagesGroupChat = async () => {
    await deleteMessageGroupChat({ deleteMessagesKeys: selectedMessagesData })
    contactsDispatch({ type: "clearSelectedMessages", payload: { chatKey: activeChat.chatKey } })
  }

  return { deleteSelectedMessages, deleteSelectedMessagesGroupChat }
}

export default useSelectOptions
