import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { MessageInterface } from "Components/Pages/Contacts/Types"
import React, { useState, useEffect, useRef, useLayoutEffect, useCallback, useContext } from "react"
import { ContactsContext } from "../../Context/ContactsContext"

type Props = {
  messageOptionsRef: HTMLDivElement
  messageData: MessageInterface
}

const MessagePopup: React.FC<Props> = ({ messageOptionsRef, messageData }) => {
  const { errors } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)
  const { activeChat } = context?.state!

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as EventListener)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as EventListener)
    }
  }, [])

  const handleClickOutside = (e: CustomEvent) => {
    if (!messageOptionsRef?.contains(e.target as Node)) {
      context?.dispatch({ type: "updateMessagePopup", payload: "" })
    }
  }

  const deleteMessage = async () => {
    try {
      await firebase.message({ chatKey: activeChat.chatKey, messageKey: messageData.key }).set(null)
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: "Message hasn't been deleted, because of the unexpected error."
      })
      throw new Error(`There has been some error updating database: ${error}`)
    }
  }

  return (
    <div className="popup-container">
      <div className="popup__option">
        <button className="popup__option-btn" type="button">
          Edit
        </button>
      </div>
      <div className="popup__option">
        <button className="popup__option-btn" type="button" onClick={() => deleteMessage()}>
          Delete
        </button>
      </div>
    </div>
  )
}

export default MessagePopup
