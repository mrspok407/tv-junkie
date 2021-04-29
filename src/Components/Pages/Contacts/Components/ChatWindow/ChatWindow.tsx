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
import { MESSAGES_TO_RENDER, UNREAD_MESSAGES_TO_RENDER } from "../Context/Constants"
import { throttle } from "throttle-debounce"
import debounce from "debounce"
import useLoadTopMessages from "./FirebaseHelpers/UseLoadTopMessages"
import { LoremIpsum } from "lorem-ipsum"

type Props = {}

const ChatWindow: React.FC<Props> = () => {
  const { authUser, newContactsActivity, errors } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)

  const {
    activeChat,
    messages,
    contacts,
    renderedMessages,
    renderedMessagesList,
    authUserUnreadMessages
  } = context?.state!
  const contactInfo = contacts[activeChat.contactKey] || {}

  const { handleContactRequest } = useResponseContactRequest({ userUid: activeChat.contactKey })

  const loadTopMessages = useLoadTopMessages()

  const contactOptionsRef = useRef<HTMLDivElement>(null!)
  const chatContainerRef = useRef<HTMLDivElement>(null!)
  const dummyRef = useRef<HTMLDivElement>(null!)

  const [popupOpen, setPopupOpen] = useState(false)

  const [scrolledToBottom, setScrolledToBottom] = useState(false)

  useGetInitialMessages()

  let prevScrollTop: any

  const getContainerRect = () => {
    const height = chatContainerRef.current.getBoundingClientRect().height
    const scrollHeight = chatContainerRef.current.scrollHeight
    const scrollTop = chatContainerRef.current.scrollTop

    const thresholdTopLoad = scrollHeight * 0.2
    const thresholdTopRender = scrollHeight * 0.2
    const thresholdBottomRender = scrollHeight * 0.1

    return { height, scrollHeight, scrollTop, thresholdTopLoad, thresholdTopRender, thresholdBottomRender }
  }

  const [scrolledUp, setScrolledUp] = useState(false)

  const handleScrollDebounce = useCallback(
    throttle(200, () => {
      const { height, scrollHeight, scrollTop, thresholdTopLoad } = getContainerRect()

      if (scrollHeight <= height) return
      if (scrollTop > prevScrollTop) return

      if (scrollTop <= thresholdTopLoad) {
        setScrolledUp(true)
        console.log("true ScrolledUp")
      } else {
        console.log("false ScrolledUp")
        setScrolledUp(false)
      }
    }),
    [chatContainerRef, activeChat]
  )

  useEffect(() => {
    if (!scrolledUp) return

    loadTopMessages()
  }, [scrolledUp, loadTopMessages])

  const handleScrollThrottle = useCallback(
    throttle(200, () => {
      const { height, scrollHeight, scrollTop, thresholdTopRender, thresholdBottomRender } = getContainerRect()

      if (scrollHeight <= height) return
      if (scrollTop < 1) {
        chatContainerRef.current.scrollTop = 1
        console.log("scroll top less 1")
      }

      if (scrollTop < prevScrollTop) {
        if (scrollTop <= thresholdTopRender) context?.dispatch({ type: "renderTopMessages" })
      } else {
        if (scrollHeight <= scrollTop + height + thresholdBottomRender) {
          // context?.dispatch({ type: "updateRenderedMessages", payload: { messagesToRender: MESSAGES_TO_RENDER } })
        }
      }
      prevScrollTop = scrollTop
    }),
    [chatContainerRef, activeChat]
  )

  useEffect(() => {
    if (messages[activeChat.chatKey] === undefined) return
    if (
      messages[activeChat.chatKey][messages[activeChat.chatKey].length - 1].key !==
      renderedMessagesList[activeChat.chatKey][renderedMessagesList[activeChat.chatKey].length - 1].key
    ) {
      return
    }

    let startIndexRender: number = 0
    let endIndexRender: number = 0

    if (messages[activeChat.chatKey].length <= MESSAGES_TO_RENDER) {
      startIndexRender = 0
      endIndexRender = messages[activeChat.chatKey].length
    } else {
      if (authUserUnreadMessages[activeChat.chatKey]! <= UNREAD_MESSAGES_TO_RENDER) {
        console.log("unreadMsg less than max")
        startIndexRender = Math.max(messages[activeChat.chatKey].length - MESSAGES_TO_RENDER, 0)
        endIndexRender = messages[activeChat.chatKey].length
      } else {
        console.log("unreadMsg more than max")
        endIndexRender =
          messages[activeChat.chatKey].length -
          (authUserUnreadMessages[activeChat.chatKey]! - UNREAD_MESSAGES_TO_RENDER)
        startIndexRender = Math.max(endIndexRender - MESSAGES_TO_RENDER, 0)
      }
    }

    context?.dispatch({
      type: "updateRenderedMessages",
      payload: {
        startIndex: startIndexRender,
        endIndex: endIndexRender,
        chatKey: activeChat.chatKey
      }
    })
  }, [messages, activeChat])

  useEffect(() => {
    // if (lastScrollTop[activeChat.chatKey] === undefined) return
    if (!messages[activeChat.chatKey] || scrolledToBottom) return
    // const test = document.querySelector(`.chat-window__message---MZDe48VeLkhFLT_iLmm`)
    // test?.scrollIntoView({ block: "center", inline: "start" })

    const height = chatContainerRef.current.getBoundingClientRect().height
    const scrollHeight = chatContainerRef.current.scrollHeight
    const scrollTop = height + scrollHeight

    const lastMessage = messages[activeChat.chatKey][messages[activeChat.chatKey].length - 1]
    const lastMessageRef = document.querySelector(`.chat-window__message--${lastMessage.key}`)
    // lastMessageRef?.scrollIntoView({ block: "nearest", inline: "start" })
    // dummyRef.current?.scrollIntoView()
    chatContainerRef.current.scrollTop = 1500
    setScrolledToBottom(true)
  }, [activeChat, messages])

  useEffect(() => {
    if (!chatContainerRef) return
    const chatContainer = chatContainerRef.current
    chatContainer.addEventListener("scroll", handleScrollThrottle)
    chatContainer.addEventListener("scroll", handleScrollDebounce)
    return () => {
      chatContainer.removeEventListener("scroll", handleScrollThrottle)
      chatContainer.removeEventListener("scroll", handleScrollDebounce)
    }
  }, [handleScrollThrottle, handleScrollDebounce])

  useEffect(() => {
    if (contactInfo) return
    context?.dispatch({ type: "updateActiveChat", payload: { chatKey: "", contactKey: "" } })
  }, [contactInfo])

  // const messagesSlice = messages[activeChat.chatKey]?.slice(0, renderedMessages[activeChat.chatKey])
  const messagesSlice = renderedMessagesList[activeChat.chatKey]
  console.log({ messagesSlice })
  console.log({ messages })

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
              <div
                className={classNames("chat-window__messages-list", {
                  "messages-list--show": scrolledToBottom
                })}
              >
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
                <div ref={dummyRef} className="chat-window__dummy"></div>
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
