import classNames from "classnames"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import React, { useContext, useEffect, useRef, useState } from "react"
import useTimestampFormater from "../../../Hooks/UseTimestampFormater"
import { ContactInfoInterface, MessageInterface } from "../../../@Types"
import { ContactsContext } from "../../@Context/ContactsContext"
import ContactOptionsPopup from "../../ContactOptionsPopup/ContactOptionsPopup"
import useGetInitialMessages from "../../ChatWindow/FirebaseHelpers/UseGetInitialMessages"
import useHandleContactsStatus from "../../ChatWindow/Hooks/UseHandleContactsStatus"
import Loader from "Components/UI/Placeholders/Loader"
import striptags from "striptags"
import "../Contact/Contact.scss"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"

type Props = {
  contactInfo: ContactInfoInterface
  allContactsAmount: number | null
}

const Contact: React.FC<Props> = React.memo(({ contactInfo, allContactsAmount }) => {
  const { firebase, authUser, contactsContext, contactsState } = useFrequentVariables()
  const { optionsPopupContactList, activeChat, messages, contactsStatus, chatMembersStatus, contacts } = contactsState
  const chatMembersStatusData = chatMembersStatus[contactInfo.chatKey] || []
  const messagesData = messages[contactInfo.chatKey]

  //   const [newActivity, setNewActivity] = useState<boolean | null | undefined>(contactInfo.newContactsActivity)
  //   const [newContactsRequest, setNewContactRequest] = useState<boolean | null>(contactInfo.newContactsRequests)

  //   const [authUnreadMessages, setAuthUnreadMessages] = useState<string[]>(contactInfo.unreadMessages)
  //   const [contactUnreadMessages, setContactUnreadMessages] = useState<string[]>(contactInfo.unreadMessagesContact)
  const lastMessage =
    messagesData === undefined ? contactInfo.lastMessage : messagesData[messagesData?.length - 1] || {}

  const formatedDate = useTimestampFormater({ timeStamp: lastMessage?.timeStamp! })
  const contactOptionsRef = useRef<HTMLDivElement>(null!)

  const chatKey = contactInfo.chatKey

  //   useGetInitialMessages({ chatKey, isGroupChat: contactInfo.isGroupChat })
  //   useHandleContactsStatus({ chatKey, isGroupChat: contactInfo.isGroupChat, contactKey: contactInfo.key })

  const setContactActive = () => {
    if (activeChat.chatKey === chatKey) return
    contactsContext?.dispatch({ type: "updateActiveChat", payload: { chatKey, contactKey: contactInfo.key } })
  }

  const isPinned = !!(contactInfo.pinned_lastActivityTS?.slice(0, 4) === "true")
  const contactNameCutLength = contactInfo.userName || contactInfo.groupName || ""
  const contactNameFormated =
    contactNameCutLength[contactNameCutLength?.length - 1] === " "
      ? contactNameCutLength?.slice(0, -1)
      : contactNameCutLength

  const chatActive = activeChat.contactKey === contactInfo.key
  return (
    <div
      className={classNames("contact-item", {
        "contact-item--active": chatActive
        // "contact-item--auth-last-message-not-pinned": !!(lastMessage?.sender === authUser?.uid && !isPinned),
        // "contact-item--contact-last-message": !!(lastMessage?.sender !== authUser?.uid),
        // "contact-item--not-pinned-no-activity": !!(!isPinned && !newActivity && !newContactsRequest),
        // "contact-item--popup-open-top": allContactsAmount! >= 4
      })}
      onClick={() => setContactActive()}
    >
      <div className="contact-item__row contact-item__row--top">
        <div className="contact-item__username">
          {contactInfo.isGroupChat
            ? contactInfo.groupName?.length > 25
              ? `${contactNameFormated}...`
              : contactInfo.groupName
            : contactInfo.userName?.length > 25
            ? `${contactNameFormated}...`
            : contactInfo.userName}
        </div>
        {/* {lastMessage?.sender === authUser?.uid && !contactInfo.isGroupChat && (
          <div
            className={classNames("contact-item__last-message-status", {
              "contact-item__last-message-status--unread": contactUnreadMessages?.length
            })}
          ></div>
        )}
        {lastMessage?.timeStamp && <div className="contact-item__timestamp">{formatedDate}</div>} */}
      </div>

      <div className="contact-item__row contact-item__row--bottom">
        {/* {contactInfo.isGroupChat ? (
          chatMembersTyping.length ? (
            <div className="contact-item__typing">
              {chatMembersTyping.length === 1 ? (
                <>
                  <div>Someone typing</div> <Loader className="loader--typing" />
                </>
              ) : (
                <>
                  <div>{chatMembersTyping.length} people typing</div> <Loader className="loader--typing" />
                </>
              )}
            </div>
          ) : (
            lastMessage?.sender && (
              <div className="contact-item__last-message-text">
                {<span>{lastMessage?.sender === authUser?.uid ? "You" : lastMessage?.username}:</span>}{" "}
                {lastMessageText}
              </div>
            )
          )
        ) : contactsStatus[contactInfo.chatKey]?.isTyping ? (
          <div className="contact-item__typing">
            <div>Typing</div> <Loader className="loader--typing" />
          </div>
        ) : (
          <div className="contact-item__last-message-text">
            {newContactsRequest ? (
              "Wants to connect"
            ) : (
              <>
                {lastMessage?.sender === authUser?.uid && <span>You: </span>} {lastMessageText}
              </>
            )}
          </div>
        )} */}

        <div ref={contactOptionsRef} className="contact-item__options">
          <button
            type="button"
            className={classNames("contact-item__open-popup-btn", {
              "contact-item__open-popup-btn--open": optionsPopupContactList === contactInfo.key
            })}
            onClick={(e) => {
              e.stopPropagation()
              contactsContext?.dispatch({ type: "updateOptionsPopupContactList", payload: contactInfo.key })
            }}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {optionsPopupContactList === contactInfo.key && (
            <ContactOptionsPopup contactOptionsRef={contactOptionsRef.current} contactInfo={contactInfo} />
          )}
        </div>
        {contactInfo.isGroupChat && <div className="contact-item__group-chat-icon"></div>}
        {isPinned && <div className="contact-item__pinned"></div>}
      </div>
    </div>
  )
})

export default Contact
