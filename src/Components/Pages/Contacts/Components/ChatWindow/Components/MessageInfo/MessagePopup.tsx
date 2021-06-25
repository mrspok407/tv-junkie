import classNames from "classnames"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { MessageInterface } from "Components/Pages/Contacts/@Types"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import React, { useEffect, useContext } from "react"
import { MESSAGE_LINE_HEIGHT } from "../../../@Context/Constants"
import { ContactsContext } from "../../../@Context/ContactsContext"
import useHandleMessageOptions from "./FirebaseHelpers/UseHandleMessageOptions"

type Props = {
  messageOptionsRef: HTMLDivElement
  messageData: MessageInterface
}

const MessagePopup: React.FC<Props> = ({ messageOptionsRef, messageData }) => {
  const { authUser, contactsContext, contactsState } = useFrequentVariables()
  const { activeChat, messages, contacts } = contactsState
  const contactInfo = contacts[activeChat.chatKey] || {}
  const messagesData = messages[activeChat.chatKey] || []

  const { selectMessage, deleteMessagePrivateChat, deleteMessageGroupChat, editMessage } = useHandleMessageOptions({
    messageData
  })

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as EventListener)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as EventListener)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClickOutside = (e: CustomEvent) => {
    if (!messageOptionsRef?.contains(e.target as Node)) {
      contactsContext?.dispatch({ type: "updateMessagePopup", payload: "" })
    }
  }

  return (
    <div
      className={classNames("popup-container", {
        "popup-container--sended-message": messageData.sender === authUser?.uid,
        "popup-container--received-message": messageData.sender !== authUser?.uid,
        "popup-container--messages-less-two": messagesData.length <= 2,
        "popup-container--failed-deliver": messageData.isDelivered === false
      })}
      onClick={(e) => {
        e.stopPropagation()
        contactsContext?.dispatch({ type: "updateMessagePopup", payload: "" })
      }}
    >
      {messageData.sender === authUser?.uid && messageData.isDelivered !== false && (
        <div className="popup__option">
          <button className="popup__option-btn" type="button" onClick={() => editMessage()}>
            Edit
          </button>
        </div>
      )}

      <div className="popup__option">
        <button
          className="popup__option-btn"
          type="button"
          onClick={() => {
            if (contactInfo.isGroupChat) {
              deleteMessageGroupChat({ deleteMessagesKeys: [messageData.key] })
            } else {
              deleteMessagePrivateChat({ deleteMessagesKeys: [messageData.key] })
            }
          }}
        >
          Delete
        </button>
      </div>

      <div className="popup__option">
        <button className="popup__option-btn" type="button" onClick={() => selectMessage()}>
          Select
        </button>
      </div>
    </div>
  )
}

export default MessagePopup
