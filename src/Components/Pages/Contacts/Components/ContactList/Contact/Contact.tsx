import classNames from "classnames"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import React, { useContext, useEffect, useRef, useState } from "react"
import useTimestampFormater from "../../../Hooks/UseTimestampFormater"
import { ContactInfoInterface, MessageInterface } from "../../../Types"
import { ContactsContext } from "../../Context/ContactsContext"
import ContactPopup from "./ContactPopup"
import "./Contact.scss"

type Props = {
  contactInfo: ContactInfoInterface
}

const Contact: React.FC<Props> = React.memo(({ contactInfo }) => {
  const firebase = useContext(FirebaseContext)
  const { authUser } = useContext(AppContext)

  const context = useContext(ContactsContext)
  const { contactPopup, activeChat, authUserUnreadMessages } = context?.state!

  const formatedDate = useTimestampFormater({ timeStamp: contactInfo.pinned_lastActivityTS?.slice(-13) })

  const [newActivity, setNewActivity] = useState<boolean | null | undefined>(contactInfo.newContactsActivity)
  const [newContactsRequests, setNewContactRequests] = useState<boolean | null>(contactInfo.newContactsRequests)

  const [authUnreadMessages, setAuthUnreadMessages] = useState<number | null>(contactInfo.unreadMessagesAuth)
  const [contactUnreadMessages, setContactUnreadMessages] = useState<number | null>(contactInfo.unreadMessagesContact)
  const [lastMessage, setLastMessage] = useState<MessageInterface>(contactInfo.lastMessage)

  const contactOptionsRef = useRef<HTMLDivElement>(null!)

  const chatKey =
    contactInfo.key < authUser?.uid! ? `${contactInfo.key}_${authUser?.uid}` : `${authUser?.uid}_${contactInfo.key}`

  const setContactActive = () => {
    if (activeChat.chatKey === chatKey) return
    context?.dispatch({ type: "updateActiveChat", payload: { chatKey, contactKey: contactInfo.key } })
    // context?.dispatch({ type: "updateAuthUserUnreadMessages", payload: authUnreadMessages })
  }

  useEffect(() => {
    firebase
      .newContactsActivity({ uid: authUser?.uid! })
      .child(`${contactInfo.key}`)
      .on("value", (snapshot: any) => setNewActivity(snapshot.val()))

    firebase
      .newContactsRequests({ uid: authUser?.uid! })
      .child(`${contactInfo.key}`)
      .on("value", (snapshot: any) => setNewContactRequests(snapshot.val()))

    firebase.unreadMessages({ uid: authUser?.uid!, chatKey }).on("value", (snapshot: any) => {
      setAuthUnreadMessages(snapshot.numChildren())
    })
    firebase
      .unreadMessages({ uid: contactInfo.key, chatKey })
      .orderByKey()
      .limitToFirst(1)
      .on("value", (snapshot: any) => {
        setContactUnreadMessages(snapshot.numChildren())
      })

    const lastMessageListener = firebase
      .messages({ chatKey })
      .orderByChild("timeStamp")
      .limitToLast(1)
      .on("value", (snapshot: { val: () => MessageInterface }) => {
        if (snapshot.val() === null) return
        const messageData = Object.values(snapshot.val())[0]
        setLastMessage(messageData)
      })
    return () => {
      firebase.newContactsActivity({ uid: authUser?.uid }).child(`${contactInfo.key}`).off()
      firebase.newContactsRequests({ uid: authUser?.uid! }).child(`${contactInfo.key}`).off()
      firebase.unreadMessages({ uid: authUser?.uid!, chatKey }).off()
      firebase.unreadMessages({ uid: contactInfo.key, chatKey }).off()
      firebase.messages({ chatKey }).off("value", lastMessageListener)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (authUnreadMessages === null) return
    if (authUnreadMessages === authUserUnreadMessages[chatKey]) return

    console.log("unreadMessagesUpdatedContext")
    context?.dispatch({
      type: "updateAuthUserUnreadMessages",
      payload: { chatKey, unreadMessages: authUnreadMessages }
    })
  }, [authUnreadMessages, authUserUnreadMessages[chatKey]]) // eslint-disable-line react-hooks/exhaustive-deps

  const isPinned = !!(contactInfo.pinned_lastActivityTS?.slice(0, 4) === "true")
  const userNameCutLength = contactInfo.userName
  const userNameFormated =
    userNameCutLength[userNameCutLength?.length - 1] === " " ? userNameCutLength?.slice(0, -1) : userNameCutLength

  const chatActive = context?.state.activeChat.contactKey === contactInfo.key
  return (
    <div
      className={classNames("contact-item", {
        "contact-item--active": chatActive,
        "contact-item--auth-last-message-not-pinned": !!(lastMessage?.sender === authUser?.uid && !isPinned),
        "contact-item--contact-last-message": !!(lastMessage?.sender !== authUser?.uid),
        "contact-item--not-pinned-no-activity": !!(!isPinned && !newActivity && !newContactsRequests)
      })}
      onClick={() => setContactActive()}
    >
      <div className="contact-item__row contact-item__row--top">
        <div className="contact-item__username">
          {contactInfo.userName?.length > 25 ? `${userNameFormated}...` : contactInfo.userName}
        </div>
        {lastMessage?.sender === authUser?.uid && (
          <div
            className={classNames("contact-item__last-message-status", {
              "contact-item__last-message-status--unread": !!(contactUnreadMessages! > 0)
            })}
          ></div>
        )}

        <div className="contact-item__timestamp">{formatedDate}</div>
      </div>

      <div className="contact-item__row contact-item__row--bottom">
        <div className="contact-item__last-message-text">
          {newContactsRequests ? (
            "Wants to connect"
          ) : (
            <>
              {lastMessage?.sender === authUser?.uid && <span>You: </span>} {lastMessage?.message?.slice(0, 30)}
            </>
          )}
        </div>
        <div ref={contactOptionsRef} className="contact-item__options">
          <button
            type="button"
            className={classNames("contact-item__open-popup-btn", {
              "contact-item__open-popup-btn--open": contactPopup === contactInfo.key
            })}
            onClick={(e) => {
              e.stopPropagation()
              context?.dispatch({ type: "updateContactPopup", payload: contactInfo.key })
            }}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {contactPopup === contactInfo.key && (
            <ContactPopup contactOptionsRef={contactOptionsRef.current} contactInfo={contactInfo} />
          )}
        </div>
        {newActivity || newContactsRequests ? (
          <div
            className={classNames("contact-item__unread-messages", {
              "contact-item__unread-messages--active": chatActive
            })}
          >
            <span>{newActivity ? authUnreadMessages : newContactsRequests ? 1 : null}</span>
            {/* <span>{newActivity ? authUserUnreadMessages[chatKey] : newContactsRequests ? 1 : null}</span> */}
          </div>
        ) : (
          isPinned && <div className="contact-item__pinned"></div>
        )}
      </div>
    </div>
  )
})

export default Contact
