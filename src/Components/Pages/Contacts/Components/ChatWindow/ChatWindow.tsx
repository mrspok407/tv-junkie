import classNames from "classnames"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { ContactsContext } from "../Context/ContactsContext"
import useElementScrolledDown from "Components/Pages/Movies/useElementScrolledDown"
// import useRecipientNotified from "Components/Pages/UserProfile/Hooks/UseRecipientNotified"
import useResponseContactRequest from "Components/Pages/UserProfile/Hooks/UseResponseContactRequest"
import React, { useEffect, useContext, useState, useRef, useCallback } from "react"
import { isUnexpectedObject } from "Utils"
import { CONTACT_INFO_INITIAL_DATA, MessageInterface, MESSAGE_INITIAL_DATA } from "../../Types"
import ContactPopup from "../ContactList/Contact/ContactPopup"
import MessageInfo from "./Components/MessageInfo"
import "./ChatWindow.scss"
import useGetInitialMessages from "./FirebaseHelpers/UseGetInitialMessages"

type Props = {}

const ChatWindow: React.FC<Props> = () => {
  const { authUser, newContactsActivity, errors } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)

  const { activeChat, messages, contacts, renderedMessages, contactsUnreadMessages } = context?.state!
  const contactInfo = contacts[activeChat.contactKey] || {}

  // const { updateRecipientNotified } = useRecipientNotified({ userUid: activeChat.contactKey })
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

  useGetInitialMessages()

  useEffect(() => {
    if (contactInfo) return
    context?.dispatch({ type: "updateActiveChat", payload: { chatKey: "", contactKey: "" } })
  }, [contactInfo])

  const messagesSlice = messages[activeChat.chatKey]?.slice(0, renderedMessages[activeChat.chatKey])

  return (
    <div ref={chatContainer} className="chat-window-container">
      <div className="chat-window__contact-info">
        <div
          className={classNames("contact-info__close-chat", {
            "contact-info__close-chat--new-activity": newContactsActivity
          })}
        >
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
          {messages[activeChat.chatKey] === undefined ? (
            <span className="chat-window__loader"></span>
          ) : (
            <>
              {/* <div className="chat-window__unread-messages">{context?.state.authUserUnreadMessages}</div> */}
              <div className="chat-window__messages-list">
                {messagesSlice?.map((messageData, index, array) => {
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
