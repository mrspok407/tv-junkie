import React, { useContext } from "react"
import ChatWindow from "./Components/ChatWindow"
import ContactList from "./Components/ContactList/ContactList"
import { ContactsContext } from "./Components/Context/ContactsContext"

type Props = {}

const ContactsContent: React.FC<Props> = () => {
  const context = useContext(ContactsContext)
  return (
    <div className="chat-container">
      <ContactList />
      {context?.state.activeChat.chatKey === null ? (
        // <ChatWindowPlaceHolder />
        ""
      ) : (
        <ChatWindow />
      )}
    </div>
  )
}

export default ContactsContent
