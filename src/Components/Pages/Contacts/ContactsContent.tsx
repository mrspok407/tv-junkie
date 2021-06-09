import classNames from "classnames"
import { FirebaseContext } from "Components/Firebase"
import React, { useContext, useEffect, useRef } from "react"
import ChatWindow from "./Components/ChatWindow/ChatWindow"
import ContactList from "./Components/ContactList/ContactList"
import ContactsContextHOC, { ContactsContext } from "./Components/@Context/ContactsContext"
import { MessageInterface } from "./@Types"
import { LoremIpsum } from "lorem-ipsum"
import { AppContext } from "Components/AppContext/AppContextHOC"
import ConfirmModal from "./Components/ChatWindow/Components/ConfirmModal/ConfirmModal"
import useContactOptions from "./Components/ContactList/Hooks/UseContactOptions"
import useSelectOptions from "./Components/ChatWindow/Components/SelectOptions/Hooks/UseSelectOptions"
import HandleNewGroup from "./Components/GroupChat/HandleNewGroup/HandleNewGroup"
import GroupCreation from "./Components/GroupChat/GroupCreation/GroupCreation"
import "./Components/ContactList/ContactList.scss"

type Props = {}

const ContactsContent: React.FC<Props> = () => {
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)
  const { authUser } = useContext(AppContext)
  const { activeChat, contacts, messages, confirmModal, groupCreation } = context?.state!

  const contactListWrapperRef = useRef<HTMLDivElement>(null!)

  const messagesRef = useRef<{ [key: string]: MessageInterface[] }>()
  const confirmModalFunctions = { ...useContactOptions({}), ...useSelectOptions() }

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    return () => {
      console.log(messagesRef.current)
      if (!messagesRef.current) return
      Object.keys(messagesRef.current).forEach((chatKey) => {
        let otherMemberKey: string
        if (authUser?.uid === chatKey.slice(0, authUser?.uid.length)) {
          otherMemberKey = chatKey.slice(authUser?.uid.length + 1)
        } else {
          otherMemberKey = chatKey.slice(0, -authUser?.uid.length! - 1)
        }

        firebase.messages({ chatKey }).off()
        firebase.unreadMessages({ uid: otherMemberKey, chatKey }).off()
        firebase.contactsDatabase({ uid: otherMemberKey }).child("pageIsOpen").off()
        firebase.chatMemberStatus({ chatKey, memberKey: otherMemberKey }).off()
      })
    }
  }, [authUser, firebase])

  useEffect(() => {
    firebase.contactsDatabase({ uid: authUser?.uid }).update({ pageIsOpen: true })
    firebase.contactsDatabase({ uid: authUser?.uid }).onDisconnect().update({ pageIsOpen: null })
    return () => {
      firebase.contactsDatabase({ uid: authUser?.uid }).update({ pageIsOpen: null })
    }
  }, [])

  const addNewMessageCurrent = async (authIsSender: any) => {
    // const contactsList = await firebase.contactsList({ uid: authUser?.uid }).once("value")
    // const contactsLastActivity = Object.entries(contactsList.val()).reduce((acc: any, [key, value]: [any, any]) => {
    //   acc = { ...acc, [key]: value.timeStamp }
    //   return acc
    // }, {})

    // Object.keys(contactsList.val()).forEach((key) => {
    //   firebase.contact({ authUid: authUser?.uid, contactUid: key }).update({ timeStamp: null })
    // })

    // firebase.contactsLastActivity({ uid: authUser?.uid }).set(contactsLastActivity)

    const lorem = new LoremIpsum({
      sentencesPerParagraph: {
        max: 8,
        min: 4
      },
      wordsPerSentence: {
        max: 8,
        min: 4
      }
    })

    for (let i = 1; i <= 1; i++) {
      const userKey = authIsSender ? activeChat.contactKey : authUser?.uid!
      const authUid = authIsSender ? authUser?.uid! : activeChat.contactKey
      const chatKey = userKey < authUid! ? `${userKey}_${authUid}` : `${authUid}_${userKey}`

      const randomMessage = lorem.generateSentences(1)
      const timeStampEpoch = new Date().getTime()

      const contactStatus = await firebase.chatMemberStatus({ chatKey, memberKey: userKey }).once("value")

      const messageRef = firebase.privateChats().child(`${chatKey}/messages`).push()
      const messageKey = messageRef.key

      const updateData = {
        [`messages/${messageKey}`]: {
          sender: authUid,
          // sender: Math.random() > 0.5 ? userKey : authUser?.uid,
          message: randomMessage,
          timeStamp: timeStampEpoch * 2
        },
        [`members/${userKey}/unreadMessages/${messageKey}`]:
          !contactStatus.val()?.isOnline || !contactStatus.val()?.chatBottom || !contactStatus.val()?.pageInFocus
            ? true
            : null
      }

      firebase.privateChats().child(chatKey).update(updateData)
    }
  }

  const addNewMessageTopContact = async () => {
    const lorem = new LoremIpsum({
      sentencesPerParagraph: {
        max: 8,
        min: 4
      },
      wordsPerSentence: {
        max: 8,
        min: 4
      }
    })
    console.log({ contacts })
    console.log(Object.keys(contacts))

    for (let i = 1; i <= 10; i++) {
      const userKey = Object.keys(contacts)[0]
      const chatKey = userKey < authUser?.uid! ? `${userKey}_${authUser?.uid}` : `${authUser?.uid}_${userKey}`

      const randomMessage = lorem.generateSentences(1)
      const timeStampEpoch = new Date().getTime()

      const pushNewMessage = await firebase
        .privateChats()
        .child(`${chatKey}/messages`)
        .push({
          sender: userKey,
          // sender: Math.random() > 0.5 ? userKey : authUser?.uid,
          message: randomMessage,
          timeStamp: timeStampEpoch * 2
        })

      const contactStatus = await firebase.chatMemberStatus({ chatKey, memberKey: authUser?.uid! }).once("value")

      console.log(contactStatus.val())

      if (!contactStatus.val()?.isOnline || !contactStatus.val()?.chatBottom) {
        firebase
          .privateChats()
          .child(`${chatKey}/members/${authUser?.uid}/unreadMessages/${pushNewMessage.key}`)
          .set(true)
      }
    }
  }

  return (
    <>
      {/* <button
        style={{ width: "400px", maxWidth: "100%" }}
        type="button"
        className="button"
        onClick={() => addNewMessageCurrent(false)}
      >
        Add msg current
      </button> */}
      {/* <button style={{ width: "400px" }} type="button" className="button" onClick={() => addNewMessageCurrent(false)}>
        Add NM current contactSender
      </button> */}
      {/* <button style={{ width: "400px" }} type="button" className="button" onClick={() => addNewMessageTopContact()}>
        Add new message top
      </button> */}
      <div className="chat-container">
        <div
          className={classNames("contact-list-wrapper", {
            "contact-list-wrapper--hide-mobile": context?.state.activeChat.chatKey,
            "contact-list-wrapper--group-creation-active": groupCreation.isActive
          })}
          ref={contactListWrapperRef}
        >
          <ContactList contactListWrapperRef={contactListWrapperRef.current} />
          {groupCreation.isActive && <GroupCreation contactListWrapperRef={contactListWrapperRef.current} />}
        </div>
        <HandleNewGroup />
        {activeChat.chatKey === "" || !contacts[activeChat.contactKey] ? (
          !Object.keys(contacts)?.length ? (
            ""
          ) : (
            <div className="chat-window-container chat-window-container--no-active-chat">
              <div className="chat-window">Select a chat to start messaging</div>
            </div>
          )
        ) : (
          <ChatWindow />
        )}
        {confirmModal.isActive && <ConfirmModal confirmFunctions={confirmModalFunctions} />}
      </div>
    </>
  )
}

export default ContactsContextHOC(ContactsContent)
