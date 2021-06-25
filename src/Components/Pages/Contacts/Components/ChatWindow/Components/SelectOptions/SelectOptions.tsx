import classNames from "classnames"
import { AppContext } from "Components/AppContext/AppContextHOC"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import React, { useContext, useRef } from "react"
import { MessageInterface } from "../../../../@Types"
import { ContactsContext } from "../../../@Context/ContactsContext"
import "./SelectOptions.scss"

type Props = {}

const SelectOptions: React.FC<Props> = () => {
  const { contactsContext, contactsState } = useFrequentVariables()
  const { activeChat, selectedMessages, contacts } = contactsState
  const contactInfo = contacts[activeChat.chatKey] || {}
  const selectedMessagesData = selectedMessages[activeChat.chatKey] || []

  const handleCancel = () => {
    contactsContext?.dispatch({ type: "clearSelectedMessages", payload: { chatKey: activeChat.chatKey } })
  }

  const handleDelete = () => {
    contactsContext?.dispatch({
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
