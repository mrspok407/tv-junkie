import React, { useState, useEffect, useRef, useLayoutEffect, useCallback, useContext } from "react"
import { ContactsContext } from "../Context/ContactsContext"

type Props = {
  messageOptionsRef: HTMLDivElement
}

const MessagePopup: React.FC<Props> = ({ messageOptionsRef }) => {
  const context = useContext(ContactsContext)

  useEffect(() => {
    console.log("test")
    document.addEventListener("mousedown", handleClickOutside as EventListener)
    return () => {
      console.log("unmount")
      document.removeEventListener("mousedown", handleClickOutside as EventListener)
    }
  }, [])

  const handleClickOutside = (e: CustomEvent) => {
    if (!messageOptionsRef?.contains(e.target as Node)) {
      context?.dispatch({ type: "updateMessagePopup", payload: "" })
    }
  }

  return (
    <div className="chat-window__message-popup-wrapper">
      <div className="chat-window__message-popup">
        <span>test</span>
      </div>
    </div>
  )
}

export default MessagePopup
