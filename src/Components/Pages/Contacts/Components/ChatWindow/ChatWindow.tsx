import classNames from "classnames"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { ContactsContext } from "../Context/ContactsContext"
import useResponseContactRequest from "Components/Pages/UserProfile/Hooks/UseResponseContactRequest"
import React, { useEffect, useContext, useState, useRef, useCallback, useLayoutEffect } from "react"
import ContactPopup from "../ContactList/Contact/ContactPopup"
import MessageInfo from "./Components/MessageInfo/MessageInfo"
import { throttle } from "throttle-debounce"
import debounce from "debounce"
import useLoadTopMessages from "./FirebaseHelpers/UseLoadTopMessages"
import useIntersectionObserver from "./Hooks/UseIntersectionObserver"
import useFirstRenderMessages from "./Hooks/UseFirstRenderMessages"
import GoDown from "./Components/GoDown/GoDown"
import "./ChatWindow.scss"

const ChatWindow: React.FC = () => {
  const { authUser, newContactsActivity, errors } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)

  const {
    activeChat,
    messages,
    contacts,
    renderedMessagesList,
    lastScrollPosition,
    authUserUnreadMessages
  } = context?.state!
  const contactInfo = contacts[activeChat.contactKey] || {}

  const { handleContactRequest } = useResponseContactRequest({ userUid: activeChat.contactKey })

  const contactOptionsRef = useRef<HTMLDivElement>(null!)
  const [chatContainer, setChatContainer] = useState<HTMLDivElement>(null!)
  // const chatContainer = useRef<HTMLDivElement>(null!)
  const authUnreadMessagesRef = useRef<string[]>([])

  const [popupContactInfoOpen, setPopupContactInfoOpen] = useState(false)

  const [initialScroll, setInitialScroll] = useState(false)

  const chatContainerRef = useCallback((node) => {
    if (node !== null) {
      setChatContainer(node)
    }
  }, [])

  // const [initialLoading] = useGetInitialMessages()
  console.log(chatContainer)
  const { loadTopMessages, loading } = useLoadTopMessages()
  useIntersectionObserver({
    chatContainerRef: chatContainer,
    authUnreadMessages: authUnreadMessagesRef.current
  })
  useFirstRenderMessages({
    messages: messages[activeChat.chatKey],
    renderedMessages: renderedMessagesList[activeChat.chatKey],
    unreadMessages: authUserUnreadMessages[activeChat.chatKey],
    chatKey: activeChat.chatKey
  })

  const getContainerRect = (): any => {
    if (!chatContainer) return
    const height = chatContainer.getBoundingClientRect().height
    const scrollHeight = chatContainer.scrollHeight
    const scrollTop = chatContainer.scrollTop

    const thresholdTopLoad = scrollHeight * 0.35
    const thresholdTopRender = scrollHeight * 0.2
    const thresholdBottomRender = scrollHeight * 0.2

    return { height, scrollHeight, scrollTop, thresholdTopLoad, thresholdTopRender, thresholdBottomRender }
  }

  const scrollPositionHandler = useCallback(
    debounce(() => {
      if (!chatContainer) return
      const { scrollTop } = getContainerRect()
      context?.dispatch({ type: "updateLastScrollPosition", payload: { scrollTop, chatKey: activeChat.chatKey } })
    }, 150),
    [activeChat]
  )

  let prevScrollTop: any
  const handleScroll = useCallback(
    throttle(200, () => {
      if (messages[activeChat.chatKey] === undefined) return
      if (!chatContainer) return
      const {
        height,
        scrollHeight,
        scrollTop,
        thresholdTopRender,
        thresholdTopLoad,
        thresholdBottomRender
      } = getContainerRect()!

      const firstRenderedMessageIndex = messages[activeChat.chatKey].findIndex(
        (item) => item.key === renderedMessagesList[activeChat.chatKey][0]?.key
      )
      const lastRenderedMessageIndex = messages[activeChat.chatKey].findIndex(
        (item) =>
          item.key ===
          renderedMessagesList[activeChat.chatKey][renderedMessagesList[activeChat.chatKey].length - 1]?.key
      )

      if (scrollHeight <= height) return
      if (scrollTop < 1 && firstRenderedMessageIndex !== 0) {
        chatContainer.scrollTop = 1
      }
      if (scrollHeight <= scrollTop + height && lastRenderedMessageIndex !== messages[activeChat.chatKey].length - 1) {
        chatContainer.scrollTop = scrollHeight - height - 1
      }

      if (scrollTop < prevScrollTop || prevScrollTop === undefined) {
        if (scrollTop <= thresholdTopRender) {
          console.log("render top")
          context?.dispatch({ type: "renderTopMessages" })
        }
        if (scrollTop <= thresholdTopLoad) {
          if (loading) return
          loadTopMessages()
        }
      } else {
        if (scrollHeight <= scrollTop + height + thresholdBottomRender) {
          context?.dispatch({ type: "renderBottomMessages" })
        }
      }
      prevScrollTop = scrollTop
    }),
    [chatContainer, activeChat, loadTopMessages]
  )

  useEffect(() => {
    const unreadMessagesListener = firebase
      .unreadMessages({ uid: authUser?.uid!, chatKey: activeChat.chatKey })
      .on("value", (snapshot: any) => {
        console.log("chatWindow unread UPDATE")
        const unreadMessagesAuth = !snapshot.val() ? [] : Object.keys(snapshot.val())
        authUnreadMessagesRef.current = unreadMessagesAuth
      })
    return () => {
      firebase.unreadMessages({ uid: authUser?.uid!, chatKey: activeChat.chatKey }).off("value", unreadMessagesListener)
      context?.dispatch({
        type: "updateAuthUserUnreadMessages",
        payload: { chatKey: activeChat.chatKey, unreadMessages: authUnreadMessagesRef.current }
      })
    }
  }, [activeChat])

  useLayoutEffect(() => {
    if (!chatContainer) return
    if (!messages[activeChat.chatKey]?.length) return
    if (contactInfo.status !== true) return
    if (initialScroll) return

    const { scrollHeight, height } = getContainerRect()
    console.log(authUserUnreadMessages[activeChat.chatKey])
    const firstUnreadMessage = authUserUnreadMessages[activeChat.chatKey][0]
    const lastMessage = messages[activeChat.chatKey][messages[activeChat.chatKey].length - 1]

    const firstUnreadMessageRef = document.querySelector(`.chat-window__message--${firstUnreadMessage}`)
    const lastMessageRef = document.querySelector(`.chat-window__message--${lastMessage.key}`)

    const isScrollBottom = !!(
      lastScrollPosition[activeChat.chatKey] === undefined ||
      scrollHeight <= lastScrollPosition[activeChat.chatKey]! + height
    )
    if (firstUnreadMessage) {
      if (isScrollBottom) {
        console.log("to first unread ChatWindow")
        firstUnreadMessageRef?.scrollIntoView({ block: "start", inline: "start" })
      } else {
        console.log("scroll previous")
        chatContainer.scrollTop = lastScrollPosition[activeChat.chatKey]!
      }
    } else {
      if (isScrollBottom) {
        console.log("scroll, no unread, scrollAtBottom")
        lastMessageRef?.scrollIntoView({ block: "start", inline: "start" })
      } else {
        console.log("scroll previous no unread")
        chatContainer.scrollTop = lastScrollPosition[activeChat.chatKey]!
      }
    }
    setInitialScroll(true)
  }, [activeChat, messages[activeChat.chatKey], initialScroll, chatContainer])

  useEffect(() => {
    if (!chatContainer) return
    const chatContainerRef = chatContainer
    chatContainerRef.addEventListener("scroll", handleScroll)
    return () => {
      chatContainerRef.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll, chatContainer])

  useEffect(() => {
    if (!chatContainer) return
    setInitialScroll(false)
    chatContainer.addEventListener("scroll", scrollPositionHandler)
    return () => {
      scrollPositionHandler.flush()
      chatContainer.removeEventListener("scroll", scrollPositionHandler)
    }
  }, [activeChat, chatContainer])

  useEffect(() => {
    if (activeChat.chatKey) return
    context?.dispatch({ type: "updateActiveChat", payload: { chatKey: "", contactKey: "" } })
  }, [activeChat])

  return (
    <div className="chat-window-container">
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
              "contact-item__open-popup-btn--open": popupContactInfoOpen
            })}
            onClick={() => setPopupContactInfoOpen(!popupContactInfoOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {popupContactInfoOpen && (
            <ContactPopup
              contactOptionsRef={contactOptionsRef.current}
              contactInfo={contactInfo}
              action={setPopupContactInfoOpen}
            />
          )}
        </div>
        <div className="contact-info__status">Online</div>
      </div>
      <div className="chat-window__messages-list-container" ref={chatContainerRef}>
        {contactInfo.status === true &&
          (messages[activeChat.chatKey] === undefined ? (
            <div className="chat-window__loader-container">
              <span className="chat-window__loader"></span>
            </div>
          ) : (
            <div className="chat-window__messages-list">
              {renderedMessagesList[activeChat.chatKey]?.map((messageData, index, array) => {
                const nextMessage = array[index + 1]
                return (
                  <div
                    key={messageData.key}
                    className={classNames(`chat-window__message chat-window__message--${messageData.key}`, {
                      "chat-window__message--send": messageData.sender === authUser?.uid,
                      "chat-window__message--receive": messageData.sender === activeChat.contactKey,
                      "chat-window__message--last-in-bunch": messageData.sender !== nextMessage?.sender
                    })}
                    data-key={messageData.key}
                  >
                    <div className="chat-window__message-text">{messageData.message}</div>

                    <MessageInfo messageData={messageData} />
                  </div>
                )
              })}
            </div>
          ))}

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
      <GoDown
        chatContainerRef={chatContainer}
        chatKey={activeChat.chatKey}
        authUnreadMessagesRef={authUnreadMessagesRef.current}
        getContainerRect={getContainerRect}
      />
    </div>
  )
}

export default ChatWindow
