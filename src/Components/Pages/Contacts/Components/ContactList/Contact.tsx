import classNames from "classnames"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import React, { useContext, useEffect, useState } from "react"
import { ContactInfoInterface, MessagesInterface } from "../../Types"
import { ContactsContext } from "../Context/ContactsContext"
import { ActionTypes } from "../Context/_reducerConfig"

type Props = {
  contactInfo: ContactInfoInterface
}

const Contact: React.FC<Props> = ({ contactInfo }) => {
  const firebase = useContext(FirebaseContext)
  const { authUser } = useContext(AppContext)

  const context = useContext(ContactsContext)

  const [newActivity, setNewActivity] = useState<boolean | null>(null)
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
    console.log({ payload })
    context?.dispatch({ type: ActionTypes.UpdateActiveChat, payload })
    context?.dispatch({ type: ActionTypes.UpdateUnreadMessages, payload: authUnreadMessages })
  }

  useEffect(() => {
    firebase
      .newContactsActivity({ uid: authUser?.uid })
      .child(`${contactInfo.key}`)
      .on("value", (snapshot: any) => setNewActivity(snapshot.val()))

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
        console.log(messageData)
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

  const timeStamp = new Date(Number(contactInfo.pinned_lastActivityTS.slice(-13))).toLocaleDateString()
  const isPinned = !!(contactInfo.pinned_lastActivityTS.slice(0, 4) === "true")
  return (
    <div
      className={classNames("contact-item", {
        "contact-item--new-activity": newActivity,
        "contact-item--active": context?.state.activeChat.contactKey === contactInfo.key
      })}
      onClick={() => setContactActive()}
    >
      <div className="contact-item__username">{contactInfo.userName}</div>
      <div className="contact-item__timestamp">{timeStamp}</div>
      <div className="contact-item__unread-messages">{authUnreadMessages! > 0 ? authUnreadMessages : null}</div>
      <div className="contact-item__is-pinned">{isPinned && "pinned"}</div>
      <div className="contact-item__last-message-text">{lastMessage?.message?.slice(0, 8)}</div>
      <div className="contact-item__last-message-status">{contactUnreadMessages! > 0 ? "one mark" : "two marks"}</div>
    </div>
  )
}

export default Contact
