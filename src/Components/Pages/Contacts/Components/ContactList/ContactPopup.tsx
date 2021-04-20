import React, { useState, useEffect, useRef, useLayoutEffect, useCallback, useContext } from "react"
import { ContactsContext } from "../Context/ContactsContext"

type Props = {
  contactOptionsRef: HTMLDivElement
  action?: any
}

const ContactPopup: React.FC<Props> = ({ contactOptionsRef, action = false }) => {
  const context = useContext(ContactsContext)

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as EventListener)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as EventListener)
    }
  }, [])

  const handleClickOutside = (e: CustomEvent) => {
    if (!contactOptionsRef?.contains(e.target as Node)) {
      if (!action) {
        context?.dispatch({ type: "updateContactPopup", payload: "" })
      } else {
        action(false)
      }
    }
  }

  return (
    <div className="popup-container">
      <div className="popup__option">
        <button className="popup__option-btn" type="button">
          Pin to top
        </button>
      </div>
      <div className="popup__option">
        <button className="popup__option-btn" type="button">
          View profile
        </button>
      </div>
      <div className="popup__option">
        <button className="popup__option-btn" type="button">
          Clear history
        </button>
      </div>
      <div className="popup__option">
        <button className="popup__option-btn" type="button">
          Mark as read
        </button>
      </div>
      <div className="popup__option">
        <button className="popup__option-btn" type="button">
          Remove from contacts
        </button>
      </div>
    </div>
  )
}

export default ContactPopup
