import React, { useState, useEffect, useRef, useLayoutEffect, useCallback, useContext } from "react"
import { ContactInfoInterface } from "../../../Types"
import { ContactsContext } from "../../Context/ContactsContext"

type Props = {
  contactOptionsRef: HTMLDivElement
  action?: any
  contactInfo: ContactInfoInterface
}

const ContactPopup: React.FC<Props> = ({ contactOptionsRef, contactInfo, action = false }) => {
  const context = useContext(ContactsContext)
  const { contacts, activeChat } = context?.state!

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

  const isPinned = !!(contactInfo.pinned_lastActivityTS?.slice(0, 4) === "true")

  return (
    <div className="popup-container">
      <div className="popup__option">
        {isPinned ? (
          <button className="popup__option-btn" type="button">
            Unpin from top
          </button>
        ) : (
          <button className="popup__option-btn" type="button">
            Pin to top
          </button>
        )}
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
