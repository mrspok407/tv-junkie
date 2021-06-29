import classNames from "classnames"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import useTimestampFormater from "Components/Pages/Contacts/Hooks/UseTimestampFormater"
import React, { useState, useEffect, useRef } from "react"
import ContactOptionsPopup from "../../../ContactOptionsPopup/ContactOptionsPopup"
import Loader from "Components/UI/Placeholders/Loader"
import "./ContactInfo.scss"

type Props = {}

const ContactInfo: React.FC<Props> = ({}) => {
  const { authUser, newContactsActivity, contactsContext, contactsState } = useFrequentVariables()
  const { activeChat, contacts, contactsStatus, optionsPopupChatWindow, chatMembersStatus } = contactsState
  const contactInfo = contacts[activeChat.contactKey] || {}
  const chatMembersStatusData = chatMembersStatus[contactInfo.chatKey] || []
  const contactOptionsRef = useRef<HTMLDivElement>(null!)

  const formatedLastSeen = useTimestampFormater({ timeStamp: contactsStatus[activeChat.chatKey]?.lastSeen! })
  const chatMembersTyping = chatMembersStatusData?.filter((member) => member.isTyping && member.key !== authUser?.uid)

  const chatMembersOnline = chatMembersStatusData.filter((member) => member.isOnline).length

  return (
    <div
      className={classNames("chat-window__contact-info", {
        "chat-window__contact-info--group-chat": contactInfo.isGroupChat
      })}
      onClick={() => {
        if (!contactInfo.isGroupChat) return
        contactsContext?.dispatch({ type: "updateGroupInfoSettings" })
      }}
    >
      <div
        className={classNames("contact-info__close-chat", {
          "contact-info__close-chat--new-activity": newContactsActivity
        })}
      >
        <button
          className="contact-info__close-chat-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            contactsContext?.dispatch({ type: "updateActiveChat", payload: { chatKey: "", contactKey: "" } })
          }}
        ></button>
      </div>
      <div className="contact-info__name">{contactInfo.userName || contactInfo.groupName}</div>
      <div ref={contactOptionsRef} className="contact-item__options contact-info__options">
        <button
          type="button"
          className={classNames("contact-item__open-popup-btn", {
            "contact-item__open-popup-btn--open": optionsPopupChatWindow
          })}
          onClick={(e) => {
            e.stopPropagation()
            contactsContext?.dispatch({ type: "updateOptionsPopupChatWindow", payload: activeChat.contactKey })
          }}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {optionsPopupChatWindow && (
          <ContactOptionsPopup contactOptionsRef={contactOptionsRef.current} contactInfo={contactInfo} />
        )}
      </div>
      <div className="contact-info__status">
        {contactInfo.isGroupChat ? (
          chatMembersTyping.length ? (
            chatMembersTyping.length === 1 ? (
              <>
                <div>Someone typing</div> <Loader className="loader--typing" />
              </>
            ) : (
              <>
                <div>{chatMembersTyping.length} people typing</div> <Loader className="loader--typing" />
              </>
            )
          ) : !chatMembersStatusData.length ? (
            ""
          ) : chatMembersStatusData.length === 1 ? (
            "1 member"
          ) : (
            `${chatMembersStatusData.length} members${chatMembersOnline ? `, ${chatMembersOnline} online` : ""}`
          )
        ) : contactsStatus[activeChat.chatKey]?.isTyping ? (
          <>
            <div>Typing</div> <Loader className="loader--typing" />
          </>
        ) : contactsStatus[activeChat.chatKey]?.isOnline ? (
          "Online"
        ) : formatedLastSeen ? (
          `Last seen ${formatedLastSeen}`
        ) : (
          ""
        )}
      </div>
    </div>
  )
}

export default ContactInfo
