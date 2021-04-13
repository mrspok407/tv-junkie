import { FirebaseContext } from "Components/Firebase"
import React, { useEffect, useContext, useState } from "react"
import { MessagesInterface } from "../Types"
import { ContactsContext } from "./Context/ContactsContext"

type Props = {}

// export interface MessagesInterface {
//   message: string
//   sender: string
//   timeStamp: number
//   key: string
// }

const ChatWindow: React.FC<Props> = () => {
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)

  const [messages, setMessages] = useState<MessagesInterface[]>()

  useEffect(() => {
    firebase
      .messages({ chatKey: context?.state.activeChat.chatKey })
      .orderByChild("timeStamp")
      .once("value", (snapshot: any) => {
        let messagesData: MessagesInterface[] = []
        snapshot.forEach((message: { val: () => MessagesInterface; key: string }) => {
          messagesData.push({ ...message.val(), key: message.key })
        })
        console.log({ messagesData })
        setMessages(messagesData)
      })
  }, [context, firebase])

  console.log({ activeChat: context?.state.activeChat })

  return (
    <div className="chat-window-container">
      <div className="chat-window__unread-messages">{context?.state.unreadMessages}</div>

      <div className="chat-window__messages-list">
        {messages?.map((messageData) => (
          <div key={messageData.key} className="chat-window__message">
            {messageData.message}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChatWindow
