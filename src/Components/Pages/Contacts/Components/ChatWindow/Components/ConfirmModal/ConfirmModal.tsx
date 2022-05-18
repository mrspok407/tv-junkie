import { ConfirmFunctionsInterface } from "Components/Pages/Contacts/@Types"
import useFrequentVariables from "Utils/Hooks/UseFrequentVariables"
import React, { useEffect, useRef } from "react"
import "./ConfirmModal.scss"

type Props = {
  confirmFunctions: ConfirmFunctionsInterface
}

const ConfirmModal: React.FC<Props> = ({ confirmFunctions }) => {
  const { contactsState, contactsDispatch } = useFrequentVariables()
  const { confirmModal, contacts } = contactsState

  const confirmRef = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as EventListener)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as EventListener)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClickOutside = (e: CustomEvent) => {
    if (!confirmRef.current?.contains(e.target as Node)) {
      handleCancel()
    }
  }

  const handleCancel = () => {
    contactsDispatch({
      type: "updateConfirmModal",
      payload: { isActive: false, function: "", contactKey: "" }
    })
  }

  const handleAprove = () => {
    confirmFunctions[confirmModal.function]({ contactInfo: contacts[confirmModal.contactKey!] })

    contactsDispatch({
      type: "updateConfirmModal",
      payload: { isActive: false, function: "", contactKey: "" }
    })
  }

  useEffect(() => {
    contactsDispatch({ type: "closePopups", payload: "" })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const messageMap: { [key: string]: string } = {
    handleRemoveContact: `Are you sure you want to remove <span>${
      contacts[confirmModal.contactKey!]?.userName
    }</span> from your contacts?`,
    handleClearHistory: `Are you sure you want to clear chat history? This will also remove it for <span>${
      contacts[confirmModal.contactKey!]?.userName
    }</span>.`,
    deleteSelectedMessages: `Are you sure you want to delete selected messages? This will also delete them for <span>${
      contacts[confirmModal.contactKey!]?.userName
    }</span>.`,
    deleteSelectedMessagesGroupChat: `Are you sure you want to delete selected messages? This will also delete them for everyone in the chat.`,
    handleLeaveChat: "Are you sure you want to leave this chat?",
    handleDeleteChat: "Are you sure you want to delete this chat? This can not be undone. Every message will be erased."
  }

  return (
    <div className="chat-window__confirm-container">
      <div className="chat-window__confirm" ref={confirmRef}>
        <div
          className="chat-window__confirm-warning"
          dangerouslySetInnerHTML={{ __html: messageMap[confirmModal.function] }}
        ></div>
        <div className="chat-window__confirm-button">
          <button className="button" type="button" onClick={() => handleAprove()}>
            Yes
          </button>
        </div>
        <div className="chat-window__confirm-button chat-window__confirm-button--cancel">
          <button className="button" type="button" onClick={() => handleCancel()}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
