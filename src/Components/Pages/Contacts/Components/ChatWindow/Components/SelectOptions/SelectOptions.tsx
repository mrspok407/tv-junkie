import useFrequentVariables from "Utils/Hooks/UseFrequentVariables"
import React from "react"
import "./SelectOptions.scss"

type Props = {}

const SelectOptions: React.FC<Props> = () => {
  const { contactsState, contactsDispatch } = useFrequentVariables()
  const { activeChat, selectedMessages, contacts } = contactsState
  const contactInfo = contacts[activeChat.chatKey] || {}
  const selectedMessagesData = selectedMessages[activeChat.chatKey] || []

  const handleCancel = () => {
    contactsDispatch({ type: "clearSelectedMessages", payload: { chatKey: activeChat.chatKey } })
  }

  const handleDelete = () => {
    contactsDispatch({
      type: "updateConfirmModal",
      payload: {
        isActive: true,
        function: `${contactInfo.isGroupChat ? "deleteSelectedMessagesGroupChat" : "deleteSelectedMessages"}`,
        contactKey: activeChat.contactKey
      }
    })
  }
  return (
    <div className="chat-window__select-options">
      <div className="chat-window__select-options-messages">
        {selectedMessagesData?.length === 1
          ? `${selectedMessagesData.length} Message`
          : `${selectedMessagesData.length} Messages`}
      </div>
      <div className="chat-window__select-options-cancel">
        <button type="button" className="button chat-window__select-options-btn" onClick={() => handleCancel()}>
          Cancel
        </button>
      </div>
      <div className="chat-window__select-options-delete">
        <button type="button" className="button chat-window__select-options-btn" onClick={() => handleDelete()}>
          Delete
        </button>
      </div>
    </div>
  )
}

export default SelectOptions
