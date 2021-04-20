import React, { useState, useEffect, useRef, useLayoutEffect, useCallback, useContext } from "react"
import { ContactsContext } from "../../Context/ContactsContext"

type Props = {
  messageOptionsRef: HTMLDivElement
}

const MessagePopup: React.FC<Props> = ({ messageOptionsRef }) => {
  const context = useContext(ContactsContext)

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

  return (
    <div className="popup-container">
      <div className="popup__option">
        <button className="popup__option-btn" type="button">
          Edit
        </button>
      </div>
      <div className="popup__option">
        <button className="popup__option-btn" type="button">
          Delete
        </button>
      </div>
    </div>
  )
}

export default MessagePopup
