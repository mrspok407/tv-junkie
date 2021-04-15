import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import useRecipientNotified from "Components/Pages/UserProfile/Hooks/UseRecipientNotified"
import useResponseContactRequest from "Components/Pages/UserProfile/Hooks/UseResponseContactRequest"
import React, { useEffect, useContext, useState } from "react"
import { MessagesInterface } from "../../Types"
import { ContactsContext } from "../Context/ContactsContext"
import { ActionTypes } from "../Context/_reducerConfig"
import "./ChatWindow.scss"

type Props = {}

const ChatWindow: React.FC<Props> = () => {
  const { authUser } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)

  const { contactInfo, activeChat } = context?.state!

  const { updateRecipientNotified } = useRecipientNotified({ userUid: activeChat.contactKey })
  const { handleContactRequest } = useResponseContactRequest({ userUid: activeChat.contactKey })

  const [messages, setMessages] = useState<MessagesInterface[]>()

  console.log({ messages })

  useEffect(() => {
    firebase
      .messages({ chatKey: activeChat.chatKey })
      .orderByChild("timeStamp")
      .once("value", (snapshot: any) => {
        let messagesData: MessagesInterface[] = []
        snapshot.forEach((message: { val: () => MessagesInterface; key: string }) => {
          messagesData.push({ ...message.val(), key: message.key })
        })
        setMessages(messagesData)
      })
  }, [context, firebase])

  useEffect(() => {
    console.log({ contactInfo })
    if (contactInfo.recipientNotified === null || contactInfo.receiver === null) return
    if (contactInfo.recipientNotified === true || contactInfo.receiver === true) return
    updateRecipientNotified()
  }, [contactInfo])

  return (
    <div className="chat-window-container">
      <button
        className="chat-window__close-chat"
        type="button"
        onClick={() =>
          context?.dispatch({ type: ActionTypes.UpdateActiveChat, payload: { chatKey: "", contactKey: "" } })
        }
      >
        Back
      </button>

      {contactInfo.status === true && (
        <>
          <div className="chat-window">
            <div className="chat-window__messages-list">
              {messages?.map((messageData) => (
                <div key={messageData.key} className="chat-window__message">
                  {messageData.message}
                </div>
              ))}
            </div>
          </div>
          {/* <div className="chat-window__unread-messages">{context?.state.unreadMessages}</div> */}
        </>
      )}

      {!contactInfo.receiver && contactInfo.status === false && (
        <div className="chat-window chat-window--request">
          <div className="new-request">
            <div className="new-request__message">
              {<span className="new-request__name">{contactInfo.userName}</span>} wants to connect
            </div>
            <div className="new-request__actions--receiver">
              <button className="button" onClick={() => handleContactRequest({ status: "accept" })}>
                Accept
              </button>
              <button
                className="button"
                onClick={() => {
                  handleContactRequest({ status: "rejected" })
                }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {contactInfo.receiver &&
        (contactInfo.status === false ? (
          <div className="new-request__message">
            The invitation to connect has been sent to{" "}
            {<span className="new-request__name">{contactInfo.userName}</span>}
          </div>
        ) : (
          contactInfo.status === "rejected" && (
            <div className="new-request__message">
              {<span className="new-request__name">{contactInfo.userName}</span>} rejected you connect request{" "}
            </div>
          )
        ))}
    </div>
  )
}

export default ChatWindow
