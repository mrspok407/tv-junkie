import classNames from "classnames"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { ContactsContext } from "../Context/ContactsContext"
import useElementScrolledDown from "Components/Pages/Movies/useElementScrolledDown"
// import useRecipientNotified from "Components/Pages/UserProfile/Hooks/UseRecipientNotified"
import useResponseContactRequest from "Components/Pages/UserProfile/Hooks/UseResponseContactRequest"
import React, { useEffect, useContext, useState, useRef, useCallback, useLayoutEffect } from "react"
import { isUnexpectedObject } from "Utils"
import { CONTACT_INFO_INITIAL_DATA, MessageInterface, MESSAGE_INITIAL_DATA } from "../../Types"
import ContactPopup from "../ContactList/Contact/ContactPopup"
import MessageInfo from "./Components/MessageInfo"
import "./ChatWindow.scss"
import useGetInitialMessages from "./FirebaseHelpers/UseGetInitialMessages"
import { MESSAGES_TO_RENDER } from "../Context/Constants"
import { throttle } from "throttle-debounce"
import debounce from "debounce"

type Props = {}

const ChatWindow: React.FC<Props> = () => {
  const { authUser, newContactsActivity, errors } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)

  const { activeChat, messages, contacts, renderedMessages, contactsUnreadMessages, lastScrollTop } = context?.state!
  const contactInfo = contacts[activeChat.contactKey] || {}

  const { handleContactRequest } = useResponseContactRequest({ userUid: activeChat.contactKey })

  const contactOptionsRef = useRef<HTMLDivElement>(null!)
  const chatContainerRef = useRef<HTMLDivElement>(null!)

  const [popupOpen, setPopupOpen] = useState(false)

  useGetInitialMessages()

  const handleScroll = useCallback(
    throttle(200, () => {
      const height = chatContainerRef.current.getBoundingClientRect().height
      const scrollHeight = chatContainerRef.current.scrollHeight
      const scrollTop = chatContainerRef.current.scrollTop

      if (scrollHeight <= height) return
      if (scrollHeight <= scrollTop + height + 300) {
        context?.dispatch({ type: "updateRenderedMessages", payload: { messagesToRender: MESSAGES_TO_RENDER } })
      }
    }),
    [chatContainerRef, activeChat]
  )

  const handleScrollDeb = useCallback(
    debounce(() => {
      if (!chatContainerRef.current) return
      const scrollTop = chatContainerRef.current.scrollTop

      console.log({ scrollTop })

      context?.dispatch({ type: "updateLastScrollTop", payload: { scrollTop, chatKey: activeChat.chatKey } })
    }, 500),
    [chatContainerRef, activeChat]
  )

  useEffect(() => {
    // if (lastScrollTop[activeChat.chatKey] === undefined) return
    if (!messages[activeChat.chatKey]) return
    // const test = document.querySelector(`.chat-window__message---MZDe48VeLkhFLT_iLmm`)
    // test?.scrollIntoView({ block: "center", inline: "start" })
    const lastMessage = messages[activeChat.chatKey][messages[activeChat.chatKey].length - 1]
    const lastMessageRef = document.querySelector(`.chat-window__message--${lastMessage.key}`)
    console.log(lastMessageRef)
    lastMessageRef?.scrollIntoView({ block: "nearest", inline: "start" })
    // chatContainerRef.current.scrollTop = lastScrollTop[activeChat.chatKey]
  }, [activeChat, messages])

  useEffect(() => {
    if (!chatContainerRef) return
    const chatContainer = chatContainerRef.current
    chatContainer.addEventListener("scroll", handleScroll)
    return () => {
      chatContainer.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll])

  useEffect(() => {
    if (!chatContainerRef) return
    const chatContainer = chatContainerRef.current
    chatContainer.addEventListener("scroll", handleScrollDeb)
    return () => {
      chatContainer.removeEventListener("scroll", handleScrollDeb)
    }
  }, [handleScrollDeb])

  useEffect(() => {
    if (contactInfo) return
    context?.dispatch({ type: "updateActiveChat", payload: { chatKey: "", contactKey: "" } })
  }, [contactInfo])

  const index = messages[activeChat.chatKey]?.findIndex((item: any) => item.key === "-MZDe48LLXcHDfAsbSpR")
  console.log({ index })
  const messagesSlice = messages[activeChat.chatKey]?.slice(-50)
  // const messagesSlice = messages[activeChat.chatKey]?.slice(index, index + 20)

  return (
    <div ref={chatContainerRef} className="chat-window-container">
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
            <div className="chat-window__loader-container">
              <span className="chat-window__loader"></span>
            </div>
          ) : (
            <>
              {/* <div className="chat-window__unread-messages">{context?.state.authUserUnreadMessages}</div> */}
              <div className="chat-window__messages-list">
                {messagesSlice?.map((messageData, index, array) => {
                  const nextMessage = array[index + 1]
                  return (
                    <div
                      key={messageData.key}
                      className={classNames(`chat-window__message chat-window__message--${messageData.key}`, {
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
