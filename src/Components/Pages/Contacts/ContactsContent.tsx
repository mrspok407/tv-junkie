import React, { useContext } from "react"
import ChatWindow from "./Components/ChatWindow/ChatWindow"
import ContactList from "./Components/ContactList/ContactList"
import { ContactsContext } from "./Components/Context/ContactsContext"

type Props = {}

const ContactsContent: React.FC<Props> = () => {
  const context = useContext(ContactsContext)
  return (
    <div className="chat-container">
      <ContactList />
      {context?.state.activeChat.chatKey === "" ? (
        <div className="chat-window-container chat-window-container--no-active-chat">
          <div className="chat-window">Select a chat to start messaging</div>
        </div>
      ) : (
        <ChatWindow />
      )}
    </div>
  )
}

export default ContactsContent
