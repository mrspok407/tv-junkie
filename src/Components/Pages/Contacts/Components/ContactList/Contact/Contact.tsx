import classNames from "classnames"
import React, { useEffect, useRef, useState } from "react"
import useTimestampFormater from "../../../Hooks/UseTimestampFormater"
import { ContactInfoInterface } from "../../../@Types"
import ContactOptionsPopup from "../../ContactOptionsPopup/ContactOptionsPopup"
import useGetInitialMessages from "../../ChatWindow/FirebaseHelpers/UseGetInitialMessages"
import useHandleContactsStatus from "../../ChatWindow/Hooks/UseHandleContactsStatus"
import Loader from "Components/UI/Placeholders/Loader"
import striptags from "striptags"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import "./Contact.scss"

type Props = {
  contactInfo: ContactInfoInterface
  allContactsAmount: number | null
}

const Contact: React.FC<Props> = React.memo(({ contactInfo, allContactsAmount }) => {
  const { firebase, authUser, contactsState, contactsDispatch } = useFrequentVariables()
  const { optionsPopupContactList, activeChat, messages, contactsStatus, chatMembersStatus, messageDeletionProcess } =
    contactsState
  const chatMembersStatusData = chatMembersStatus[contactInfo.chatKey] || []
  const messagesData = messages[contactInfo.chatKey]

  const [newActivity, setNewActivity] = useState<boolean | null | undefined>(contactInfo.newContactsActivity)
  const [newContactsRequest, setNewContactRequest] = useState<boolean | null>(contactInfo.newContactsRequests)

  const [authUnreadMessages, setAuthUnreadMessages] = useState<string[]>(contactInfo.unreadMessages)
  const [contactUnreadMessages, setContactUnreadMessages] = useState<string[]>(contactInfo.unreadMessagesContact)
  const [contactUnreadMessageData, setContactUnreadMessageData] = useState<string[] | null>(null)
  const lastMessage =
    messagesData === undefined ? contactInfo.lastMessage : messagesData[messagesData?.length - 1] || {}

  const formatedDate = useTimestampFormater({ timeStamp: lastMessage?.timeStamp! })
  const contactOptionsRef = useRef<HTMLDivElement>(null!)

  const chatKey = contactInfo.chatKey

  useGetInitialMessages({ chatKey, isGroupChat: contactInfo.isGroupChat })
  useHandleContactsStatus({ chatKey, isGroupChat: contactInfo.isGroupChat, contactKey: contactInfo.key })

  const setContactActive = () => {
    if (activeChat.chatKey === chatKey) return
    contactsDispatch({ type: "updateActiveChat", payload: { chatKey, contactKey: contactInfo.key } })
    firebase.newContactsActivity({ uid: authUser?.uid }).child(`${contactInfo.key}`).set(null)
  }

  useEffect(() => {
    if (messageDeletionProcess) return
    setContactUnreadMessageData(contactUnreadMessages)
  }, [contactUnreadMessages, messageDeletionProcess])

  useEffect(() => {
    firebase
      .newContactsActivity({ uid: authUser?.uid! })
      .child(`${contactInfo.key}`)
      .on("value", (snapshot: any) => setNewActivity(snapshot.val()))

    firebase
      .newContactsRequests({ uid: authUser?.uid! })
      .child(`${contactInfo.key}`)
      .on("value", (snapshot: any) => setNewContactRequest(snapshot.val()))

    firebase
      .unreadMessages({ uid: authUser?.uid!, chatKey, isGroupChat: contactInfo.isGroupChat })
      .on("value", (snapshot: any) => {
        const unreadMessagesAuth = !snapshot.val() ? [] : Object.keys(snapshot.val())
        setAuthUnreadMessages(unreadMessagesAuth)
      })

    const unreadMessagesListenerContact = firebase
      .unreadMessages({ uid: contactInfo.key, chatKey, isGroupChat: contactInfo.isGroupChat })
      .limitToFirst(1)
      .on("value", (snapshot: any) => {
        const unreadMessagesContact = !snapshot.val() ? [] : Object.keys(snapshot.val())
        setContactUnreadMessages(unreadMessagesContact)
      })

    if (!contactInfo.isGroupChat) {
      firebase
        .privateChats()
        .child(`${chatKey}/historyDeleted`)
        .on("value", (snapshot: any) => {
          if (snapshot.val() === null) return
          contactsDispatch({ type: "removeAllMessages", payload: { chatKey } })
          firebase.privateChats().child(`${chatKey}/historyDeleted`).set(null)
        })
    }

    return () => {
      firebase.newContactsActivity({ uid: authUser?.uid }).child(`${contactInfo.key}`).off()
      firebase.newContactsRequests({ uid: authUser?.uid! }).child(`${contactInfo.key}`).off()
      firebase.unreadMessages({ uid: authUser?.uid!, chatKey, isGroupChat: contactInfo.isGroupChat }).off()
      firebase
        .unreadMessages({ uid: contactInfo.key, chatKey, isGroupChat: contactInfo.isGroupChat })
        .off("value", unreadMessagesListenerContact)
      firebase.privateChats().child(`${chatKey}/historyDeleted`).off()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isPinned = !!(contactInfo.pinned_lastActivityTS?.slice(0, 4) === "true")
  const contactNameCutLength = contactInfo.userName || contactInfo.groupName || ""
  const contactNameFormated =
    contactNameCutLength[contactNameCutLength?.length - 1] === " "
      ? contactNameCutLength?.slice(0, -1)
      : contactNameCutLength

  const chatActive = contactsState.activeChat.contactKey === contactInfo.key
  const unreadMessagesAmount = authUnreadMessages?.length === 0 ? null : authUnreadMessages?.length

  const lastMessageText = striptags(lastMessage?.message).slice(0, 30)
  const chatMembersTyping = chatMembersStatusData?.filter((member) => member.isTyping && member.key !== authUser?.uid)

  return (
    <div
      className={classNames("contact-item", {
        "contact-item--active": chatActive,
        "contact-item--auth-last-message-not-pinned": !!(lastMessage?.sender === authUser?.uid && !isPinned),
        "contact-item--contact-last-message": !!(lastMessage?.sender !== authUser?.uid),
        "contact-item--not-pinned-no-activity": !!(!isPinned && !newActivity && !newContactsRequest),
        "contact-item--popup-open-top": allContactsAmount! >= 4
      })}
      onClick={() => setContactActive()}
    >
      <div
        className={classNames("contact-item__row contact-item__row--top", {
          "contact-item__row--online": contactsStatus[contactInfo.chatKey]?.isOnline
        })}
      >
        <div className="contact-item__username">
          {contactInfo.isGroupChat
            ? contactInfo.groupName?.length > 25
              ? `${contactNameFormated}...`
              : contactInfo.groupName
            : contactInfo.userName?.length > 25
            ? `${contactNameFormated}...`
            : contactInfo.userName}
        </div>
        {lastMessage?.sender === authUser?.uid &&
          !contactInfo.isGroupChat &&
          [true, "removed"].includes(contactInfo.status) && (
            <div
              className={classNames("contact-item__last-message-status", {
                "contact-item__last-message-status--unread":
                  contactUnreadMessageData === null
                    ? !!contactInfo.unreadMessagesContact?.length
                    : !!contactUnreadMessageData?.length
              })}
            ></div>
          )}
        {lastMessage?.timeStamp && <div className="contact-item__timestamp">{formatedDate}</div>}
      </div>

      <div className="contact-item__row contact-item__row--bottom">
        {contactInfo.isGroupChat ? (
          chatMembersTyping?.length ? (
            <div className="contact-item__typing">
              {chatMembersTyping?.length === 1 ? (
                <>
                  <div>Someone typing</div> <Loader className="loader--typing" />
                </>
              ) : (
                <>
                  <div>{chatMembersTyping?.length} people typing</div> <Loader className="loader--typing" />
                </>
              )}
            </div>
          ) : (
            lastMessage?.sender && (
              <div className="contact-item__last-message-text">
                {<span>{lastMessage?.sender === authUser?.uid ? "You" : lastMessage?.userName}:</span>}{" "}
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
            {contactInfo.receiver === true &&
              ([true, "removed"].includes(contactInfo.status) ? (
                <>
                  {lastMessage?.sender === authUser?.uid && <span>You: </span>} {lastMessageText}
                </>
              ) : contactInfo.status === "rejected" ? (
                `${contactInfo.userName} rejected you connect request`
              ) : (
                "The invitation to connect has been sent"
              ))}
            {contactInfo.receiver === false &&
              (newContactsRequest
                ? "Wants to connect"
                : [true, "removed"].includes(contactInfo.status) && (
                    <>
                      {lastMessage?.sender === authUser?.uid && <span>You: </span>} {lastMessageText}
                    </>
                  ))}
          </div>
        )}

        <div ref={contactOptionsRef} className="contact-item__options">
          <button
            type="button"
            className={classNames("contact-item__open-popup-btn", {
              "contact-item__open-popup-btn--open": optionsPopupContactList === contactInfo.key
            })}
            onClick={(e) => {
              e.stopPropagation()
              contactsDispatch({ type: "updateOptionsPopupContactList", payload: contactInfo.key })
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
        {newActivity || newContactsRequest || unreadMessagesAmount ? (
          <div
            className={classNames("contact-item__unread-messages", {
              "contact-item__unread-messages--active": chatActive,
              "contact-item__unread-messages--active-no-unread": chatActive && !unreadMessagesAmount
            })}
          >
            {contactInfo.isGroupChat ? (
              <span>{unreadMessagesAmount}</span>
            ) : (
              <span>
                {unreadMessagesAmount && [true, "removed"].includes(contactInfo.status) ? unreadMessagesAmount : null}
              </span>
            )}
          </div>
        ) : (
          isPinned && <div className="contact-item__pinned"></div>
        )}
      </div>
    </div>
  )
})

export default Contact
