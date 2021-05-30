import classNames from "classnames"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { MessageInterface } from "Components/Pages/Contacts/@Types"
import React, { useEffect, useContext } from "react"
import { MESSAGE_LINE_HEIGHT } from "../../../@Context/Constants"
import { ContactsContext } from "../../../@Context/ContactsContext"
import useHandleMessageOptions from "../../FirebaseHelpers/UseHandleMessageOptions"

type Props = {
  messageOptionsRef: HTMLDivElement
  messageData: MessageInterface
}

const MessagePopup: React.FC<Props> = ({ messageOptionsRef, messageData }) => {
  const { authUser } = useContext(AppContext)
  const context = useContext(ContactsContext)

  const { selectMessage, deleteMessage, editMessage } = useHandleMessageOptions({ messageData })

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as EventListener)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as EventListener)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClickOutside = (e: CustomEvent) => {
    if (!messageOptionsRef?.contains(e.target as Node)) {
      context?.dispatch({ type: "updateMessagePopup", payload: "" })
    }
  }

  return (
    <div
      className={classNames("popup-container", {
        "popup-container--sended-message": messageData.sender === authUser?.uid,
        "popup-container--received-message": messageData.sender !== authUser?.uid
      })}
      onClick={() => context?.dispatch({ type: "updateMessagePopup", payload: "" })}
    >
      {messageData.sender === authUser?.uid && (
        <div className="popup__option">
          <button className="popup__option-btn" type="button" onClick={() => editMessage()}>
            Edit
          </button>
        </div>
      )}

      <div className="popup__option">
        <button className="popup__option-btn" type="button" onClick={() => deleteMessage()}>
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
