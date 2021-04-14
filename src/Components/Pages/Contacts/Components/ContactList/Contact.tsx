import classNames from "classnames"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import React, { useContext, useEffect, useState } from "react"
import useTimestampFormater from "../../Hooks/UseTimestampFormater"
import { ContactInfoInterface, MessagesInterface } from "../../Types"
import { ContactsContext } from "../Context/ContactsContext"
import { ActionTypes } from "../Context/_reducerConfig"

type Props = {
  contactInfo: ContactInfoInterface
}

const Contact: React.FC<Props> = React.memo(({ contactInfo }) => {
  const firebase = useContext(FirebaseContext)
  const { authUser } = useContext(AppContext)

  const context = useContext(ContactsContext)

  const formatedDate = useTimestampFormater({ timeStamp: contactInfo.pinned_lastActivityTS.slice(-13) })

  const [newActivity, setNewActivity] = useState<boolean | null>(null)
  const [newContactRequest, setNewContactRequest] = useState<boolean | null>(null)

  const [authUnreadMessages, setAuthUnreadMessages] = useState<number | null>(null)
  const [contactUnreadMessages, setContactUnreadMessages] = useState<number | null>(null)
  const [lastMessage, setLastMessage] = useState<MessagesInterface>()

  const chatKey =
    contactInfo.key < authUser?.uid! ? `${contactInfo.key}_${authUser?.uid}` : `${authUser?.uid}_${contactInfo.key}`

  const setContactActive = () => {
    const payload = {
      contactKey: contactInfo.key,
      chatKey
    }

    context?.dispatch({ type: ActionTypes.UpdateActiveChat, payload })
    context?.dispatch({ type: ActionTypes.UpdateUnreadMessages, payload: authUnreadMessages })
  }

  useEffect(() => {
    firebase
      .newContactsActivity({ uid: authUser?.uid })
      .child(`${contactInfo.key}`)
      .on("value", (snapshot: any) => setNewActivity(snapshot.val()))

    firebase
      .newContactsRequests({ uid: authUser?.uid })
      .child(`${contactInfo.key}`)
      .on("value", (snapshot: any) => setNewContactRequest(snapshot.val()))

    firebase.unreadMessages({ uid: authUser?.uid, chatKey }).on("value", (snapshot: any) => {
      setAuthUnreadMessages(snapshot.numChildren())
    })
    firebase.unreadMessages({ uid: contactInfo.key, chatKey }).on("value", (snapshot: any) => {
      setContactUnreadMessages(snapshot.numChildren())
    })

    const lastMessageListener = firebase
      .messages({ chatKey })
      .orderByChild("timeStamp")
      .limitToLast(1)
      .on("value", (snapshot: { val: () => MessagesInterface }) => {
        if (snapshot.val() === null) return
        const messageData = Object.values(snapshot.val())[0]
        setLastMessage(messageData)
      })
    return () => {
      firebase.newContactsActivity({ uid: authUser?.uid }).child(`${contactInfo.key}`).off()
      firebase.unreadMessages({ uid: authUser?.uid, chatKey }).off()
      firebase.unreadMessages({ uid: contactInfo.key, chatKey }).off()
      firebase.messages({ chatKey }).off("value", lastMessageListener)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    context?.dispatch({ type: ActionTypes.UpdateUnreadMessages, payload: authUnreadMessages })
  }, [authUnreadMessages]) // eslint-disable-line react-hooks/exhaustive-deps

  const isPinned = !!(contactInfo.pinned_lastActivityTS.slice(0, 4) === "true")
  const userNameCutLength = contactInfo.userName
  const userNameFormated =
    userNameCutLength[userNameCutLength.length - 1] === " " ? userNameCutLength.slice(0, -1) : userNameCutLength

  const chatActive = context?.state.activeChat.contactKey === contactInfo.key
  return (
    <div
      className={classNames("contact-item", {
        "contact-item--active": chatActive
      })}
      onClick={() => setContactActive()}
    >
      <div className="contact-item__username">
        {contactInfo.userName.length > 25 ? `${userNameFormated}...` : contactInfo.userName}
      </div>
      <div
        className={classNames("contact-item__last-message-status", {
          "contact-item__last-message-status--unread": !!(contactUnreadMessages! > 0)
        })}
      ></div>
      <div className="contact-item__timestamp">{formatedDate}</div>
      <div className="contact-item__last-message-text">
        {lastMessage?.sender === authUser?.uid && <span>You: </span>} {lastMessage?.message?.slice(0, 8)}
      </div>
      {authUnreadMessages! > 0 || newContactRequest ? (
        <div
          className={classNames("contact-item__unread-messages", {
            "contact-item__unread-messages--active": chatActive
          })}
        >
          <span>{authUnreadMessages! > 0 ? authUnreadMessages : newContactRequest ? 1 : null}</span>
        </div>
      ) : (
        isPinned && <div className="contact-item__pinned"></div>
      )}
    </div>
  )
})

export default Contact
