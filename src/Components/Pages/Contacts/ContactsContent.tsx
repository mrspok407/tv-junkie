import classNames from "classnames"
import { FirebaseContext } from "Components/Firebase"
import React, { useContext, useEffect, useRef } from "react"
import ChatWindow from "./Components/ChatWindow/ChatWindow"
import ContactList from "./Components/ContactList/ContactList"
import ContactsContextHOC, { ContactsContext } from "./Components/Context/ContactsContext"
import { MessageInterface } from "./Types"

type Props = {}

const ContactsContent: React.FC<Props> = () => {
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)
  const { activeChat, contacts, messages } = context?.state!

  const messagesRef = useRef<{ [key: string]: MessageInterface[] }>()

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    return () => {
      console.log(messagesRef.current)
      if (!messagesRef.current) return
      Object.keys(messagesRef.current).forEach((chatKey) => {
        console.log(chatKey)
        firebase.messages({ chatKey }).off()
      })
    }
  }, [])

  return (
    <div className="chat-container">
      <ContactList />

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
    </div>
  )
}

export default ContactsContextHOC(ContactsContent)
