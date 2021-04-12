import React from "react"
import ChatWindow from "./Components/ChatWindow"
import ContactList from "./Components/ContactList/ContactList"

type Props = {}

const ContactsContent: React.FC<Props> = () => {
  return (
    <div className="chat-container">
      <ContactList />
      <ChatWindow />
    </div>
  )
}

export default ContactsContent
