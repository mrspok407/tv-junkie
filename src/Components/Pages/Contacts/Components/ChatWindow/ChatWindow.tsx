import classNames from "classnames"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import useElementScrolledDown from "Components/Pages/Movies/useElementScrolledDown"
import useRecipientNotified from "Components/Pages/UserProfile/Hooks/UseRecipientNotified"
import useResponseContactRequest from "Components/Pages/UserProfile/Hooks/UseResponseContactRequest"
import React, { useEffect, useContext, useState, useRef } from "react"
import { isUnexpectedObject } from "Utils"
import { MessageInterface, MESSAGE_INITIAL_DATA } from "../../Types"
import { ContactsContext } from "../Context/ContactsContext"
// import { ActionTypes } from "../Context/_reducerConfig"
import "./ChatWindow.scss"

type Props = {}

const ChatWindow: React.FC<Props> = () => {
  const { authUser, errors } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)

  const { activeChat, messages, contacts, contactsUnreadMessages } = context?.state!
  const contactInfo = contacts[activeChat.contactKey]

  const { updateRecipientNotified } = useRecipientNotified({ userUid: activeChat.contactKey })
  const { handleContactRequest } = useResponseContactRequest({ userUid: activeChat.contactKey })

  const chatContainer = useRef<HTMLDivElement>(null!)

  const scrolldown = useElementScrolledDown({ element: chatContainer.current })

  // const [messages, setMessages] = useState<MessagesInterface[]>()

  console.log(messages)

  useEffect(() => {
    if (!messages[activeChat.chatKey]?.length) return

    const height = chatContainer.current.getBoundingClientRect().height
    const scrollHeight = chatContainer.current.scrollHeight
    const scrollTop = chatContainer.current.scrollTop

    console.log({ height, scrollHeight, scrollTop })
    chatContainer.current.scrollTo(0, 0)
  }, [activeChat, messages])

  useEffect(() => {
    firebase
      .messages({ chatKey: activeChat.chatKey })
      .orderByChild("timeStamp")
      .on("value", (snapshot: any) => {
        let messagesData: MessageInterface[] = []
        snapshot.forEach((message: { val: () => MessageInterface; key: string }) => {
          if (isUnexpectedObject({ exampleObject: MESSAGE_INITIAL_DATA, targetObject: message.val() })) {
            errors.handleError({
              message: "Some of the messages were hidden, because of the unexpected error."
            })
            return
          }

          messagesData.push({ ...message.val(), key: message.key })
        })

        context?.dispatch({ type: "updateMessages", payload: messagesData })
      })

    firebase
      .unreadMessages({ uid: activeChat.contactKey, chatKey: activeChat.chatKey })
      .on("value", (snapshot: any) => {
        if (!snapshot.exists()) return
        context?.dispatch({ type: "updateContactUnreadMessages", payload: Object.keys(snapshot.val()) })
      })
  }, [activeChat, firebase])

  useEffect(() => {
    console.log(context?.state.contactsUnreadMessages)
  }, [context?.state.contactsUnreadMessages])

  useEffect(() => {
    if (contactInfo.recipientNotified === null || contactInfo.receiver === null) return
    if (contactInfo.recipientNotified === true || contactInfo.receiver === true) return
    updateRecipientNotified()
  }, [activeChat])

  useEffect(() => {
    if (contactInfo) return
    context?.dispatch({ type: "updateActiveChat", payload: { chatKey: "", contactKey: "" } })
  }, [contactInfo])

  return (
    <div ref={chatContainer} className="chat-window-container">
      <button
        className="chat-window__close-chat"
        type="button"
        onClick={() => context?.dispatch({ type: "updateActiveChat", payload: { chatKey: "", contactKey: "" } })}
      >
        Back
      </button>

      {contactInfo.status === true && (
        <>
          <div className="chat-window__unread-messages">{context?.state.authUserUnreadMessages}</div>
          <div className="chat-window">
            <div className="chat-window__messages-list">
              {messages[activeChat.chatKey]?.map((messageData) => (
                <div
                  key={messageData.key}
                  className={classNames("chat-window__message", {
                    "chat-window__message--send": messageData.sender === authUser?.uid,
                    "chat-window__message--receive": messageData.sender === contactInfo.key
                  })}
                >
                  <div className="chat-window__message-text">{messageData.message}</div>

                  <div className="chat-window__message-info">
                    {messageData.sender === authUser?.uid && (
                      <div
                        className={classNames("chat-window__message-status", {
                          "chat-window__message-status--unread": contactsUnreadMessages[activeChat.chatKey]?.includes(
                            messageData.key
                          )
                        })}
                      ></div>
                    )}
                    <div className="chat-window__message-timestamp">
                      {new Date(Number(messageData.timeStamp)).toLocaleTimeString().slice(0, -3)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
