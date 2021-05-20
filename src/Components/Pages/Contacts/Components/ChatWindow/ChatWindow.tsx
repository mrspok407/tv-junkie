import classNames from "classnames"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { ContactsContext } from "../@Context/ContactsContext"
import useResponseContactRequest from "Components/Pages/UserProfile/Hooks/UseResponseContactRequest"
import React, { useEffect, useContext, useState, useRef, useCallback, useLayoutEffect } from "react"
import ContactPopup from "../OptionsPopup/OptionsPopup"
import MessageInfo from "./Components/MessageInfo/MessageInfo"
import { throttle } from "throttle-debounce"
import debounce from "debounce"
import useLoadTopMessages from "./FirebaseHelpers/UseLoadTopMessages"
import useIntersectionObserver from "./Hooks/UseIntersectionObserver"
import useFirstRenderMessages from "./Hooks/UseFirstRenderMessages"
import GoDown from "./Components/GoDown/GoDown"
import useResizeObserver from "./Hooks/UseResizeObserver"
import { MessageInterface } from "../../Types"
import { convertTimeStampToDate } from "Utils"
import useShowFloatDate from "./Hooks/UseShowFloatDate"
import usePageFocusHandler from "./Hooks/UsePageFocusHandler"
import "./ChatWindow.scss"
import useTimestampFormater from "../../Hooks/UseTimestampFormater"

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
    authUserUnreadMessages,
    contactsStatus,
    optionsPopupChatWindow
  } = context?.state!
  const messagesData = messages[activeChat.chatKey]
  const renderedMessages = renderedMessagesList[activeChat.chatKey] || []
  const unreadMessagesAuth = authUserUnreadMessages[activeChat.chatKey] || []
  const contactInfo = contacts[activeChat.contactKey] || {}

  const [chatContainerRef, setChatContainerRef] = useState<HTMLDivElement>(null!)
  const contactOptionsRef = useRef<HTMLDivElement>(null!)
  const unreadMessagesAuthRef = useRef<string[]>([])

  const [contactUnreadMessages, setContactUnreadMessages] = useState<string[] | null>(null)
  const formatedDate = useTimestampFormater({ timeStamp: contactsStatus[activeChat.chatKey]?.lastSeen! })

  const isScrolledFirstRenderRef = useRef(false)
  const isScrollBottomRef = useRef(false)
  const { pageInFocus } = usePageFocusHandler({ activeChat })

  // const [firstMessage, setFirstMessage] = useState<string>()
  const { floatDate, isScrollingTop } = useShowFloatDate({ activeChat, chatContainerRef, renderedMessages })

  const chatContainerCallback = useCallback((node) => {
    if (node !== null) {
      setChatContainerRef(node)
    }
  }, [])

  useEffect(() => {
    const listener = firebase
      .unreadMessages({ uid: activeChat.contactKey, chatKey: activeChat.chatKey })
      .on("value", (snapshot: any) => {
        setContactUnreadMessages(Object.keys(snapshot.val() || {}))
      })
    return () => {
      // setContactUnreadMessages(null)
      // firebase.unreadMessages({ uid: activeChat.contactKey, chatKey: activeChat.chatKey }).off("value", listener)
    }
  }, [firebase, activeChat])

  const { loadTopMessages, loading } = useLoadTopMessages()
  const { handleContactRequest } = useResponseContactRequest({ userUid: activeChat.contactKey })
  const { onMouseEnter } = useIntersectionObserver({
    chatContainerRef: chatContainerRef,
    unreadMessagesAuth: unreadMessagesAuthRef.current,
    pageInFocus
  })
  useResizeObserver({ chatContainerRef: chatContainerRef, isScrollBottomRef: isScrollBottomRef.current })
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
    const top = chatContainerRef.getBoundingClientRect().top

    const thresholdTopLoad = scrollHeight * 0.35
    const thresholdTopRender = scrollHeight * 0.3
    const thresholdBottomRender = scrollHeight * 0.2

    return { height, scrollHeight, scrollTop, thresholdTopLoad, thresholdTopRender, thresholdBottomRender, top }
  }

  const messagesRef = useRef<MessageInterface[]>([])
  const renderedMessagesRef = useRef<MessageInterface[]>([])
  const loadingRef = useRef<boolean>()

  useEffect(() => {
    messagesRef.current = messagesData
    renderedMessagesRef.current = renderedMessages
    loadingRef.current = loading
  }, [messagesData, renderedMessages, activeChat, loading])

  const scrollPositionHandler = useCallback(
    debounce(() => {
      if (!chatContainerRef) return
      const { scrollTop, scrollHeight, height } = getContainerRect()
      console.log({ scrollTop })
      if (scrollHeight <= height) return

      const firstRenderedMessageIndex = messagesRef?.current.findIndex(
        (item) => item.key === renderedMessagesRef?.current[0]?.key
      )
      const lastRenderedMessageIndex = messagesRef.current.findIndex(
        (item) => item.key === renderedMessagesRef.current[renderedMessagesRef.current.length - 1]?.key
      )

      if (scrollTop < 1) {
        if (firstRenderedMessageIndex === 0) {
          if (loadingRef.current) {
            chatContainerRef.scrollTop = 1
          }
        } else {
          chatContainerRef.scrollTop = 1
        }
      }
      if (scrollHeight <= scrollTop + height && lastRenderedMessageIndex !== messagesRef.current.length - 1) {
        chatContainerRef.scrollTop = scrollHeight - height - 1
      }

      if (scrollHeight <= scrollTop + height) {
        isScrollBottomRef.current = true
        context?.dispatch({
          type: "updateAuthUserUnreadMessages",
          payload: { chatKey: activeChat.chatKey, unreadMessages: [] }
        })
        console.log("bottom")
        firebase
          .chatMemberStatus({ chatKey: activeChat.chatKey, memberKey: authUser?.uid! })
          .update({ chatBottom: true })
      } else {
        console.log("not bottom")
        isScrollBottomRef.current = false
        firebase
          .chatMemberStatus({ chatKey: activeChat.chatKey, memberKey: authUser?.uid! })
          .update({ chatBottom: false })
      }

      context?.dispatch({ type: "updateLastScrollPosition", payload: { scrollTop, chatKey: activeChat.chatKey } })
    }, 150),
    [activeChat, chatContainerRef]
  )

  let prevScrollTop: any
  const handleScroll = useCallback(
    throttle(150, () => {
      if (messagesData === undefined) return
      if (!chatContainerRef) return
      const { height, scrollHeight, scrollTop, thresholdTopRender, thresholdTopLoad, thresholdBottomRender } =
        getContainerRect()

      if (scrollHeight <= height) return
      if (scrollTop < prevScrollTop || prevScrollTop === undefined) {
        if (scrollTop <= thresholdTopRender) {
          console.log("renderTopMessages")
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
    [chatContainerRef, activeChat, loadTopMessages, loading]
  )

  useEffect(() => {
    const unreadMessagesListener = firebase
      .unreadMessages({ uid: authUser?.uid!, chatKey: activeChat.chatKey })
      .on("value", (snapshot: any) => {
        const unreadMessagesData = !snapshot.val() ? [] : Object.keys(snapshot.val())
        console.log(unreadMessagesData)
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

  useLayoutEffect(() => {
    if (!chatContainerRef) return
    if (!renderedMessages?.length || !messagesData?.length) return
    if (messagesData[messagesData.length - 1].key !== renderedMessages[renderedMessages.length - 1].key) return

    if (!isScrolledFirstRenderRef.current) return
    if (!isScrollBottomRef.current) return
    if (!pageInFocus) return

    const lastMessage = renderedMessages[renderedMessages.length - 1]
    const lastMessageRef = document.querySelector(`.chat-window__message--${lastMessage.key}`)

    lastMessageRef?.scrollIntoView({ block: "start", inline: "start" })
  }, [activeChat, renderedMessages, messagesData, chatContainerRef])

  useLayoutEffect(() => {
    if (!chatContainerRef) return
    if (!messagesData?.length || !unreadMessagesAuth) return
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
        firebase
          .chatMemberStatus({ chatKey: activeChat.chatKey, memberKey: authUser?.uid! })
          .update({ chatBottom: true })
      } else {
        console.log("scroll previous no unread")
        console.log(lastScrollPosition[activeChat.chatKey])
        chatContainerRef.scrollTop = lastScrollPosition[activeChat.chatKey]!
      }
    }
    isScrolledFirstRenderRef.current = true
  }, [activeChat, messagesData, chatContainerRef, contactInfo])

  useLayoutEffect(() => {
    if (!chatContainerRef) return
    const { scrollHeight, height } = getContainerRect()
    if (scrollHeight <= height) {
      isScrollBottomRef.current = true
      firebase.chatMemberStatus({ chatKey: activeChat.chatKey, memberKey: authUser?.uid! }).update({ chatBottom: true })
    }
    return () => {
      isScrollBottomRef.current = false
      isScrolledFirstRenderRef.current = false
    }
  }, [activeChat, chatContainerRef])

  useEffect(() => {
    if (!chatContainerRef) return
    chatContainerRef.addEventListener("scroll", handleScroll)
    return () => {
      // console.log("remove handleScroll")
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
    firebase.chatMemberStatus({ chatKey: activeChat.chatKey, memberKey: authUser?.uid! }).update({ isOnline: true })
    return () => {
      firebase.chatMemberStatus({ chatKey: activeChat.chatKey, memberKey: authUser?.uid! }).update({ isOnline: null })
    }
  }, [activeChat])

  useEffect(() => {
    if (!chatContainerRef) return
    // if (contactInfo.status !== "rejected") return
    console.log("test")
    firebase.newContactsActivity({ uid: authUser?.uid }).child(`${contactInfo.key}`).set(null)
  }, [activeChat, contactInfo, chatContainerRef])

  return (
    <div className="chat-window-container" onMouseEnter={onMouseEnter}>
      <div
        className={classNames("chat-window__date chat-window__date--float", {
          "chat-window__date--float-fadein": isScrollingTop
        })}
      >
        {convertTimeStampToDate({ timeStamp: floatDate })}
      </div>
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
              "contact-item__open-popup-btn--open": optionsPopupChatWindow
            })}
            onClick={() => context?.dispatch({ type: "updateOptionsPopupChatWindow", payload: activeChat.contactKey })}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {optionsPopupChatWindow && (
            <ContactPopup contactOptionsRef={contactOptionsRef.current} contactInfo={contactInfo} />
          )}
        </div>
        <div className="contact-info__status">
          {contactsStatus[activeChat.chatKey]?.isOnline ? "Online" : formatedDate ? `Last seen ${formatedDate}` : ""}
        </div>
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
          ) : !messagesData.length ? (
            <div className="chat-window__no-messages">
              The chat is very empty, <span>so sad</span>.
            </div>
          ) : (
            <div className="chat-window__messages-list">
              {renderedMessages?.map((renderedMessage, index, array) => {
                const nextMessage = array[index + 1]
                const prevMessage = array[Math.max(index - 1, 0)]

                const date = convertTimeStampToDate({ timeStamp: renderedMessage?.timeStamp })

                const currentMessageDate = new Date(renderedMessage?.timeStamp).toDateString()
                const prevMessageDate = new Date(prevMessage?.timeStamp).toDateString()

                return (
                  <React.Fragment key={renderedMessage.key}>
                    {currentMessageDate !== prevMessageDate || renderedMessage.timeStamp === prevMessage.timeStamp ? (
                      <div
                        key={renderedMessage.timeStamp}
                        className={classNames("chat-window__date", {
                          "chat-window__date--top": renderedMessage.timeStamp === prevMessage.timeStamp
                        })}
                        data-timestamp={renderedMessage.timeStamp}
                      >
                        {date}
                      </div>
                    ) : (
                      ""
                    )}
                    <div
                      className={classNames(`chat-window__message chat-window__message--${renderedMessage.key}`, {
                        "chat-window__message--send": renderedMessage.sender === authUser?.uid,
                        "chat-window__message--receive": renderedMessage.sender === activeChat.contactKey,
                        "chat-window__message--last-in-bunch": renderedMessage.sender !== nextMessage?.sender
                      })}
                      data-key={renderedMessage.key}
                    >
                      <div className="chat-window__message-text">{renderedMessage.message}</div>

                      <MessageInfo messageData={renderedMessage} contactUnreadMessages={contactUnreadMessages} />
                    </div>
                  </React.Fragment>
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
