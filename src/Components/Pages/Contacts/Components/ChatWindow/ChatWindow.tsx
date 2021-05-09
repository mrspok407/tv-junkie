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
  const messagesData = messages[activeChat.chatKey]
  const renderedMessages = renderedMessagesList[activeChat.chatKey]
  const unreadMessagesAuth = authUserUnreadMessages[activeChat.chatKey]
  const contactInfo = contacts[activeChat.contactKey] || {}

  const [chatContainerRef, setChatContainerRef] = useState<HTMLDivElement>(null!)
  const contactOptionsRef = useRef<HTMLDivElement>(null!)
  const unreadMessagesAuthRef = useRef<string[]>([])

  const [popupContactInfoOpen, setPopupContactInfoOpen] = useState(false)

  const isScrolledFirstRenderRef = useRef(false)
  const isScrollBottomRef = useRef(false)

  const chatContainerCallback = useCallback((node) => {
    if (node !== null) {
      setChatContainerRef(node)
    }
  }, [])

  const { loadTopMessages, loading } = useLoadTopMessages()
  const { handleContactRequest } = useResponseContactRequest({ userUid: activeChat.contactKey })
  useIntersectionObserver({
    chatContainerRef: chatContainerRef,
    unreadMessagesAuth: unreadMessagesAuthRef.current
  })
  useFirstRenderMessages({
    messages: messagesData,
    renderedMessages: renderedMessages,
    unreadMessages: unreadMessagesAuth,
    chatKey: activeChat.chatKey
  })

  const getContainerRect = () => {
    const height = chatContainerRef.getBoundingClientRect().height
    const scrollHeight = chatContainerRef.scrollHeight
    const scrollTop = chatContainerRef.scrollTop

    const thresholdTopLoad = scrollHeight * 0.35
    const thresholdTopRender = scrollHeight * 0.3
    const thresholdBottomRender = scrollHeight * 0.2

    return { height, scrollHeight, scrollTop, thresholdTopLoad, thresholdTopRender, thresholdBottomRender }
  }

  const scrollPositionHandler = useCallback(
    debounce(() => {
      if (!chatContainerRef) return
      const { scrollTop } = getContainerRect()
      console.log({ scrollTop })
      context?.dispatch({ type: "updateLastScrollPosition", payload: { scrollTop, chatKey: activeChat.chatKey } })
    }, 150),
    [activeChat, chatContainerRef]
  )

  let prevScrollTop: any
  const handleScroll = useCallback(
    throttle(200, () => {
      if (messagesData === undefined) return
      if (!chatContainerRef) return
      const {
        height,
        scrollHeight,
        scrollTop,
        thresholdTopRender,
        thresholdTopLoad,
        thresholdBottomRender
      } = getContainerRect()

      const firstRenderedMessageIndex = messagesData.findIndex((item) => item.key === renderedMessages[0]?.key)
      const lastRenderedMessageIndex = messagesData.findIndex(
        (item) => item.key === renderedMessages[renderedMessages.length - 1]?.key
      )
      console.log({ loading })

      if (scrollHeight <= height) return
      if (scrollTop < 1) {
        if (firstRenderedMessageIndex === 0) {
          if (loading) {
            chatContainerRef.scrollTop = 1
          }
        } else {
          chatContainerRef.scrollTop = 1
        }
      }

      if (scrollHeight <= scrollTop + height && lastRenderedMessageIndex !== messagesData.length - 1) {
        chatContainerRef.scrollTop = scrollHeight - height - 1
      }
      console.log({ scrollTop })
      console.log({ prevScrollTop })
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
      if (scrollHeight <= scrollTop + height) {
        console.log("set bottom TRUE")
        isScrollBottomRef.current = true
        context?.dispatch({
          type: "updateAuthUserUnreadMessages",
          payload: { chatKey: activeChat.chatKey, unreadMessages: [] }
        })
      } else {
        console.log("set bottom FALSE")
        isScrollBottomRef.current = false
      }
      prevScrollTop = scrollTop
    }),
    [chatContainerRef, activeChat, loadTopMessages, loading]
  )

  useEffect(() => {
    const unreadMessagesListener = firebase
      .unreadMessages({ uid: authUser?.uid!, chatKey: activeChat.chatKey })
      .on("value", (snapshot: any) => {
        console.log("chatWindow unread UPDATE")
        const unreadMessagesData = !snapshot.val() ? [] : Object.keys(snapshot.val())
        unreadMessagesAuthRef.current = unreadMessagesData
      })
    return () => {
      firebase.unreadMessages({ uid: authUser?.uid!, chatKey: activeChat.chatKey }).off("value", unreadMessagesListener)
      context?.dispatch({
        type: "updateAuthUserUnreadMessages",
        payload: { chatKey: activeChat.chatKey, unreadMessages: unreadMessagesAuthRef.current }
      })
    }
  }, [activeChat])

  useEffect(() => {
    if (!chatContainerRef) return
    if (!renderedMessages?.length || !messagesData?.length) return

    console.log(messagesData[messagesData.length - 1].key !== renderedMessages[renderedMessages.length - 1].key)
    console.log(isScrolledFirstRenderRef.current)
    console.log(isScrollBottomRef.current)
    if (messagesData[messagesData.length - 1].key !== renderedMessages[renderedMessages.length - 1].key) return

    if (!isScrolledFirstRenderRef.current) return
    if (!isScrollBottomRef.current) return

    console.log("scroll into last msg")
    const lastMessage = renderedMessages[renderedMessages.length - 1]
    const lastMessageRef = document.querySelector(`.chat-window__message--${lastMessage.key}`)

    lastMessageRef?.scrollIntoView({ block: "start", inline: "start" })
  }, [activeChat, renderedMessages, messagesData, chatContainerRef])

  useLayoutEffect(() => {
    if (!chatContainerRef) return
    if (!messagesData?.length) return
    if (contactInfo.status !== true) return
    if (isScrolledFirstRenderRef.current) return

    const { scrollHeight, height } = getContainerRect()
    const firstUnreadMessageRef = document.querySelector(`.chat-window__message--${unreadMessagesAuth[0]}`)
    const lastMessageRef = document.querySelector(`.chat-window__message--${messagesData[messagesData.length - 1].key}`)

    const isScrollBottom = !!(
      lastScrollPosition[activeChat.chatKey] === undefined ||
      scrollHeight <= lastScrollPosition[activeChat.chatKey]! + height
    )

    if (firstUnreadMessageRef) {
      if (isScrollBottom) {
        console.log("to first unread ChatWindow")
        firstUnreadMessageRef?.scrollIntoView({ block: "start", inline: "start" })
      } else {
        console.log("scroll previous")
        chatContainerRef.scrollTop = lastScrollPosition[activeChat.chatKey]!
      }
    } else {
      if (isScrollBottom) {
        console.log("scroll, no unread, scrollAtBottom")
        lastMessageRef?.scrollIntoView({ block: "start", inline: "start" })
        isScrollBottomRef.current = true
      } else {
        console.log("scroll previous no unread")
        chatContainerRef.scrollTop = lastScrollPosition[activeChat.chatKey]!
      }
    }
    isScrolledFirstRenderRef.current = true
  }, [activeChat, messagesData, chatContainerRef])

  useLayoutEffect(() => {
    return () => {
      isScrollBottomRef.current = false
      isScrolledFirstRenderRef.current = false
    }
  }, [activeChat, chatContainerRef])

  useEffect(() => {
    if (!chatContainerRef) return
    chatContainerRef.addEventListener("scroll", handleScroll)
    return () => {
      console.log("remove handleScroll")
      chatContainerRef.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll, chatContainerRef])

  useEffect(() => {
    if (!chatContainerRef) return
    chatContainerRef.addEventListener("scroll", scrollPositionHandler)
    return () => {
      scrollPositionHandler.flush()
      chatContainerRef.removeEventListener("scroll", scrollPositionHandler)
    }
  }, [activeChat, chatContainerRef])

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
      <div
        className={classNames("chat-window__messages-list-container", {
          "chat-window__messages-list-container--loading": messagesData === undefined
        })}
        ref={chatContainerCallback}
      >
        {contactInfo.status === true &&
          (messagesData === undefined ? (
            <div className="chat-window__loader-container">
              <span className="chat-window__loader"></span>
            </div>
          ) : (
            <div className="chat-window__messages-list">
              {renderedMessages?.map((messageData, index, array) => {
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
        chatContainerRef={chatContainerRef}
        chatKey={activeChat.chatKey}
        unreadMessagesAuthRef={unreadMessagesAuthRef.current}
        getContainerRect={getContainerRect}
      />
    </div>
  )
}

export default ChatWindow
