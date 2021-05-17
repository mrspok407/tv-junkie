import React, { useState, useEffect, useRef, useLayoutEffect, useCallback, useContext } from "react"
import { ContactInfoInterface } from "../../../Types"
import { ContactsContext } from "../../Context/ContactsContext"
import useContactOptions from "../Hooks/UseContactOptions"

type Props = {
  contactOptionsRef: HTMLDivElement
  togglePopup?: any
  contactInfo: ContactInfoInterface
}

const ContactPopup: React.FC<Props> = ({ contactOptionsRef, contactInfo, togglePopup = false }) => {
  const context = useContext(ContactsContext)
  const { contacts, activeChat } = context?.state!

  const optionsHandler = useContactOptions({ contactInfo, togglePopup })

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as EventListener)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as EventListener)
    }
  }, [])

  const handleClickOutside = (e: CustomEvent) => {
    if (!contactOptionsRef?.contains(e.target as Node)) {
      if (!togglePopup) {
        context?.dispatch({ type: "updateContactPopup", payload: "" })
      } else {
        togglePopup(false)
      }
    }
  }

  const isPinned = !!(contactInfo.pinned_lastActivityTS?.slice(0, 4) === "true")

  return (
    <div className="popup-container">
      <div className="popup__option">
        {isPinned ? (
          <button
            className="popup__option-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              optionsHandler.updateIsPinned()
            }}
          >
            Unpin from top
          </button>
        ) : (
          <button
            className="popup__option-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              optionsHandler.updateIsPinned()
            }}
          >
            Pin to top
          </button>
        )}
      </div>
      <div className="popup__option">
        <a
          onClick={(e) => {
            e.stopPropagation()
            if (togglePopup) togglePopup()
            context?.dispatch({ type: "updateContactPopup", payload: "" })
          }}
          className="popup__option-btn"
          href={`${
            process.env.NODE_ENV === "production"
              ? `https://www.tv-junkie.com/user/${contactInfo.key}`
              : `http://localhost:3000/user/${contactInfo.key}`
          }`}
          rel="noopener noreferrer"
          target="_blank"
        >
          View profile
        </a>
      </div>
      <div className="popup__option">
        <button
          className="popup__option-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            optionsHandler.handleClearHistory()
          }}
        >
          Clear history
        </button>
      </div>
      <div className="popup__option">
        <button
          className="popup__option-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            optionsHandler.handleMarkRead()
          }}
        >
          Mark as read
        </button>
      </div>
      <div className="popup__option">
        <button
          className="popup__option-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            optionsHandler.handleRemoveContact()
          }}
        >
          Remove from contacts
        </button>
      </div>
    </div>
  )
}

export default ContactPopup
