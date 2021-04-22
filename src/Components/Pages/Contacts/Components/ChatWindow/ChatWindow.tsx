import classNames from "classnames"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import useElementScrolledDown from "Components/Pages/Movies/useElementScrolledDown"
import useRecipientNotified from "Components/Pages/UserProfile/Hooks/UseRecipientNotified"
import useResponseContactRequest from "Components/Pages/UserProfile/Hooks/UseResponseContactRequest"
import React, { useEffect, useContext, useState, useRef, useCallback } from "react"
import { isUnexpectedObject } from "Utils"
import { CONTACT_INFO_INITIAL_DATA, MessageInterface, MESSAGE_INITIAL_DATA } from "../../Types"
import ContactPopup from "../ContactList/Contact/ContactPopup"
import { ContactsContext } from "../Context/ContactsContext"
import MessageInfo from "./Components/MessageInfo"
import "./ChatWindow.scss"

type Props = {}

const ChatWindow: React.FC<Props> = () => {
  const { authUser, errors } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)

  const { activeChat, messages, contacts, contactsUnreadMessages } = context?.state!
  const contactInfo = contacts[activeChat.contactKey] || {}

  const { updateRecipientNotified } = useRecipientNotified({ userUid: activeChat.contactKey })
  const { handleContactRequest } = useResponseContactRequest({ userUid: activeChat.contactKey })

  const contactOptionsRef = useRef<HTMLDivElement>(null!)
  const chatContainer = useRef<HTMLDivElement>(null!)

  const [popupOpen, setPopupOpen] = useState(false)

  const scrolldown = useElementScrolledDown({ element: chatContainer.current })

  // useEffect(() => {
  //   if (!messages[activeChat.chatKey]?.length) return

  //   const height = chatContainer.current.getBoundingClientRect().height
  //   const scrollHeight = chatContainer.current.scrollHeight
  //   const scrollTop = chatContainer.current.scrollTop

  //   console.log({ height, scrollHeight, scrollTop })
  //   chatContainer.current.scrollTo(0, 0)
  // }, [activeChat, messages])

  useEffect(() => {
    if (context?.state.messages[activeChat.chatKey] !== undefined) return

    console.log("test")
    firebase
      .messages({ chatKey: activeChat.chatKey })
      .orderByChild("timeStamp")
      .limitToLast(50)
      .on("value", (snapshot: any) => {
        console.log("on listener")
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
      <div className="chat-window__contact-info">
        <div className="contact-info__close-chat">
          <button
            className="contact-info__close-chat-btn"
            type="button"
            onClick={() => context?.dispatch({ type: "updateActiveChat", payload: { chatKey: "", contactKey: "" } })}
          ></button>
        </div>
        <div className="contact-info__username">{contactInfo.userName}</div>
        <div ref={contactOptionsRef} className="contact-item__options contact-info__options">
          <button
            type="button"
            className={classNames("contact-item__open-popup-btn", {
              "contact-item__open-popup-btn--open": popupOpen
            })}
            onClick={(e) => setPopupOpen(!popupOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {popupOpen && (
            <ContactPopup
              contactOptionsRef={contactOptionsRef.current}
              contactInfo={contactInfo}
              action={setPopupOpen}
            />
          )}
        </div>
        <div className="contact-info__status">Online</div>
      </div>
      {contactInfo.status === true && (
        <>
          {/* <div className="chat-window__unread-messages">{context?.state.authUserUnreadMessages}</div> */}
          <div className="chat-window__messages-list">
            {messages[activeChat.chatKey]?.map((messageData, index, array) => {
              const nextMessage = array[index + 1]
              return (
                <div
                  key={messageData.key}
                  className={classNames("chat-window__message", {
                    "chat-window__message--send": messageData.sender === authUser?.uid,
                    "chat-window__message--receive": messageData.sender === activeChat.contactKey,
                    "chat-window__message--last-in-bunch": messageData.sender !== nextMessage?.sender
                  })}
                >
                  <div className="chat-window__message-text">{messageData.message}</div>

                  <MessageInfo messageData={messageData} />
                </div>
              )
            })}
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
                  context?.dispatch({ type: "updateActiveChat", payload: { chatKey: "", contactKey: "" } })
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
