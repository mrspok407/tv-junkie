import classNames from "classnames"
import { AppContext } from "Components/AppContext/AppContextHOC"
import React, { useState, useEffect, useContext, useRef } from "react"
import { MessageInterface } from "../../../Types"
import { ContactsContext } from "../../Context/ContactsContext"
import MessagePopup from "./MessagePopup"
import "./MessageInfo.scss"

type Props = { messageData: MessageInterface }

const MessageInfo: React.FC<Props> = React.memo(({ messageData }) => {
  const { authUser } = useContext(AppContext)
  const context = useContext(ContactsContext)

  const { activeChat, contactsUnreadMessages, messagePopup } = context?.state!

  const messageOptionsRef = useRef<HTMLDivElement>(null!)

  return (
    <div className="chat-window__message-info">
      <div ref={messageOptionsRef} className="chat-window__message-options">
        <button
          type="button"
          className={classNames("chat-window__open-popup-btn", {
            "chat-window__open-popup-btn--open": messagePopup === messageData.key
          })}
          onClick={() => context?.dispatch({ type: "updateMessagePopup", payload: messageData.key })}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {messagePopup === messageData.key && (
          <MessagePopup messageOptionsRef={messageOptionsRef.current} messageData={messageData} />
        )}
      </div>

      {messageData.sender === authUser?.uid && (
        <div
          className={classNames("chat-window__message-status", {
            "chat-window__message-status--unread": contactsUnreadMessages[activeChat.chatKey]?.includes(messageData.key)
          })}
        ></div>
      )}
      <div className="chat-window__message-timestamp">
        {new Date(Number(messageData.timeStamp)).toLocaleTimeString().slice(0, -3)}
      </div>
    </div>
  )
})

export default MessageInfo
