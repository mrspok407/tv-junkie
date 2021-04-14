import { FirebaseContext } from "Components/Firebase"
import React, { useEffect, useContext, useState } from "react"
import { MessagesInterface } from "../Types"
import { ContactsContext } from "./Context/ContactsContext"
import { ActionTypes } from "./Context/_reducerConfig"

type Props = {}

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
        setMessages(messagesData)
      })
  }, [context, firebase])

  return (
    <div className="chat-window-container">
      <button
        className="chat-window__close-chat"
        type="button"
        onClick={() =>
          context?.dispatch({ type: ActionTypes.UpdateActiveChat, payload: { chatKey: null, contactKey: null } })
        }
      >
        Back
      </button>
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
