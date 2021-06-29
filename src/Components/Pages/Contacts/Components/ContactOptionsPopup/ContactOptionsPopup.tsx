import React, { useState, useEffect, useRef, useLayoutEffect, useCallback, useContext } from "react"
import { ContactInfoInterface } from "../../@Types"
import { ContactsContext } from "../@Context/ContactsContext"
import useContactOptions from "./Hooks/UseContactOptions"
import "./ContactOptionsPopup.scss"
import classNames from "classnames"

type Props = {
  contactOptionsRef: HTMLDivElement
  contactInfo: ContactInfoInterface
}

const ContactOptionsPopup: React.FC<Props> = ({ contactOptionsRef, contactInfo }) => {
  const context = useContext(ContactsContext)
  const optionsHandler = useContactOptions({ contactInfo })

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as EventListener)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as EventListener)
    }
  }, [])

  const handleClickOutside = (e: CustomEvent) => {
    if (!contactOptionsRef?.contains(e.target as Node)) {
      context?.dispatch({ type: "closePopups", payload: "" })
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
      {!contactInfo.isGroupChat && (
        <>
          <div className="popup__option">
            <a
              onClick={(e) => {
                e.stopPropagation()
                context?.dispatch({ type: "closePopups", payload: "" })
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
          {contactInfo.status === true && (
            <div className="popup__option">
              <button
                className="popup__option-btn"
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  context?.dispatch({
                    type: "updateConfirmModal",
                    payload: { isActive: true, function: "handleClearHistory", contactKey: contactInfo.key }
                  })
                }}
              >
                Clear history
              </button>
            </div>
          )}
        </>
      )}

      {!contactInfo.removedFromGroup && (
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
      )}

      <div className="popup__option">
        <button
          className="popup__option-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            context?.dispatch({
              type: "updateConfirmModal",
              payload: {
                isActive: true,
                function: `${contactInfo.isGroupChat ? "handleLeaveChat" : "handleRemoveContact"}`,
                contactKey: contactInfo.key
              }
            })
          }}
        >
          {contactInfo.isGroupChat ? "Leave chat" : "Remove from contacts"}
        </button>
      </div>
    </div>
  )
}

export default ContactOptionsPopup