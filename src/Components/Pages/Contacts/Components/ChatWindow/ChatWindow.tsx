/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef, useCallback, useLayoutEffect, useMemo } from "react"
import classNames from "classnames"
import MessageInfo from "./Components/MessageInfo/MessageInfo"
import { throttle, debounce } from "throttle-debounce"
import { debounce as debounceWithFlush } from "debounce"
import useLoadTopMessages from "./FirebaseHelpers/UseLoadTopMessages"
import useIntersectionObserver from "./Hooks/UseIntersectionObserver"
import useFirstRenderMessages from "./Hooks/UseFirstRenderMessages"
import useResizeObserver from "./Hooks/UseResizeObserver"
import { MessageInterface } from "../../@Types"
import { convertTimeStampToDate } from "Utils"
import useShowFloatDate from "./Hooks/UseShowFloatDate"
import usePageFocusHandler from "./Hooks/UsePageFocusHandler"
import MessageInput from "./Components/Input/MessageInput"
import useContactListeners from "./Hooks/UseContactListeners"
import useFrequentVariables from "../../Hooks/UseFrequentVariables"
import MessagesList from "./Components/MessagesList/GroupChat/MessagesListGroupChat"
import ContactInfo from "./Components/ContactInfo/ContactInfo"
import GroupInfoSettings from "../GroupChat/GroupInfoSettings/GroupInfoSettings"
import NewRequestOptions from "./Components/NewRequestOptions/NewRequestOptions"
import InfoMessage from "./Components/MessagesList/GroupChat/Components/NewMembersMessages/InfoMessage"
import * as Bowser from "bowser"
import "./ChatWindow.scss"

const browser = Bowser.getParser(window.navigator.userAgent)
const DEBOUNCE_THROTTLE_DELAY = browser.getBrowserName() === "Firefox" ? 500 : 150

const throttleDebounceMap: any = {
  throttle,
  debounce
}

const ChatWindow: React.FC = () => {
  const { firebase, authUser, contactsState, contactsDispatch } = useFrequentVariables()
  const {
    activeChat,
    messages,
    contacts,
    renderedMessagesList,
    selectedMessages,
    lastScrollPosition,
    authUserUnreadMessages,
    firebaseListeners,
    groupInfoSettingsActive,
    rerenderUnreadMessagesStart
  } = contactsState
  const messagesData = messages[activeChat.chatKey]
  const renderedMessages = renderedMessagesList[activeChat.chatKey] || []
  const unreadMessagesAuth = authUserUnreadMessages[activeChat.chatKey] || []
  const selectedMessagesData = selectedMessages[activeChat.chatKey] || []
  const contactInfo = contacts[activeChat.contactKey] || {}

  const chatWindowLoading =
    messagesData === undefined ||
    (!firebaseListeners.contactUnreadMessages[activeChat.chatKey] && !contactInfo.isGroupChat)

  const [chatContainerRef, setChatContainerRef] = useState<HTMLDivElement>(null!)

  const unreadMessagesAuthRef = useRef<string[]>([])
  const [unreadMsgsListenerChatKey, setUnreadMsgsListenerChatKey] = useState("")
  const isScrolledFirstRenderRef = useRef(false)
  const isScrollBottomRef = useRef(false)

  const { floatDate, isScrollingTop } = useShowFloatDate({ activeChat, chatContainerRef, renderedMessages })

  const chatContainerCallback = useCallback((node) => {
    if (node !== null) {
      setChatContainerRef(node)
    }
  }, [])

  const { loadTopMessages, loadingTopMessages } = useLoadTopMessages()
  const { pageInFocus } = usePageFocusHandler({ activeChat, contactInfo })
  const { onMouseEnter } = useIntersectionObserver({
    chatContainerRef: chatContainerRef,
    unreadMessagesAuth: unreadMessagesAuthRef.current,
    unreadMsgsListenerChatKey,
    pageInFocus,
    chatWindowLoading
  })
  useResizeObserver({ chatContainerRef: chatContainerRef, isScrollBottomRef, contactInfo })
  useFirstRenderMessages({
    messages: messagesData,
    renderedMessages: renderedMessages,
    unreadMessages: unreadMessagesAuth,
    chatKey: activeChat.chatKey
  })
  const { contactLastActivity } = useContactListeners()

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
    loadingRef.current = loadingTopMessages
  }, [messagesData, renderedMessages, activeChat, loadingTopMessages])

  const scrollPositionHandler = useCallback(
    debounceWithFlush(() => {
      if (!chatContainerRef) return
      const { scrollTop, scrollHeight, height } = getContainerRect()
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
        contactsDispatch({
          type: "updateAuthUserUnreadMessages",
          payload: { chatKey: activeChat.chatKey, unreadMessages: [] }
        })
        firebase
          .unreadMessages({ uid: authUser?.uid!, chatKey: activeChat.chatKey, isGroupChat: contactInfo.isGroupChat })
          .set(null)
        firebase
          .chatMemberStatus({
            chatKey: activeChat.chatKey,
            memberKey: authUser?.uid!,
            isGroupChat: contactInfo.isGroupChat
          })
          .update({ chatBottom: true }, () => console.log("chatBottomUpdate"))
      } else {
        isScrollBottomRef.current = false
        firebase
          .chatMemberStatus({
            chatKey: activeChat.chatKey,
            memberKey: authUser?.uid!,
            isGroupChat: contactInfo.isGroupChat
          })
          .update({ chatBottom: false })
      }

      contactsDispatch({
        type: "updateLastScrollPosition",
        payload: { scrollTop, chatKey: activeChat.chatKey }
      })
    }, 150),
    [activeChat, chatContainerRef]
  )

  let prevScrollTop: any
  const handleScroll = useCallback(
    throttleDebounceMap[`${browser.getBrowserName() === "Firefox" ? "debounce" : "throttle"}`](
      DEBOUNCE_THROTTLE_DELAY,
      () => {
        if (chatWindowLoading || !chatContainerRef) return
        const { height, scrollHeight, scrollTop, thresholdTopRender, thresholdTopLoad, thresholdBottomRender } =
          getContainerRect()

        if (scrollHeight <= height) return
        if (scrollTop < prevScrollTop || prevScrollTop === undefined) {
          if (scrollTop <= thresholdTopRender) {
            contactsDispatch({
              type: "renderTopMessages",
              payload: { unreadMessagesAuthRef: unreadMessagesAuthRef.current, chatKey: activeChat.chatKey }
            })
          }
          if (scrollTop <= thresholdTopLoad) {
            if (loadingTopMessages) return
            loadTopMessages()
          }
        } else {
          if (scrollHeight <= scrollTop + height + thresholdBottomRender) {
            contactsDispatch({
              type: "renderBottomMessages",
              payload: { unreadMessagesAuthRef: unreadMessagesAuthRef.current, chatKey: activeChat.chatKey }
            })
          }
        }
        prevScrollTop = scrollTop
      }
    ),
    [chatContainerRef, activeChat, loadTopMessages, loadingTopMessages, chatWindowLoading]
  )

  useEffect(() => {
    const unreadMessagesListener = firebase
      .unreadMessages({ uid: authUser?.uid!, chatKey: activeChat.chatKey, isGroupChat: contactInfo.isGroupChat })
      .on("value", (snapshot: any) => {
        const unreadMessagesData = !snapshot.val() ? [] : Object.keys(snapshot.val())
        unreadMessagesAuthRef.current = unreadMessagesData
        setUnreadMsgsListenerChatKey(activeChat.chatKey)
      })
    return () => {
      firebase
        .unreadMessages({ uid: authUser?.uid!, chatKey: activeChat.chatKey, isGroupChat: contactInfo.isGroupChat })
        .off("value", unreadMessagesListener)
      contactsDispatch({
        type: "updateAuthUserUnreadMessages",
        payload: { chatKey: activeChat.chatKey, unreadMessages: unreadMessagesAuthRef.current }
      })
    }
  }, [activeChat])

  useLayoutEffect(() => {
    if (!chatContainerRef || !renderedMessages?.length || !messagesData?.length) return
    if (messagesData[messagesData.length - 1].key !== renderedMessages[renderedMessages.length - 1].key) return
    if (!isScrolledFirstRenderRef.current || !isScrollBottomRef.current || !pageInFocus) return
    if (chatWindowLoading && !contactInfo.isGroupChat) return

    contactsDispatch({
      type: "updateAuthUserUnreadMessages",
      payload: { chatKey: activeChat.chatKey, unreadMessages: [], rerenderUnreadMessagesStart: true }
    })
    firebase
      .unreadMessages({ uid: authUser?.uid!, chatKey: activeChat.chatKey, isGroupChat: contactInfo.isGroupChat })
      .set(null)

    chatContainerRef.scrollTop = getContainerRect().scrollHeight + getContainerRect().height
  }, [activeChat, renderedMessages, messagesData, chatContainerRef, chatWindowLoading])

  useLayoutEffect(() => {
    // UseEffect for first ChatWindow render or when activeChat changes
    if (!chatContainerRef || !messagesData?.length) return
    if (![true, "removed"].includes(contactInfo.status) && !contactInfo.isGroupChat) return
    if (isScrolledFirstRenderRef.current) return
    if (chatWindowLoading) return

    const { scrollHeight, height } = getContainerRect()
    const firstUnreadMessageRef = document.querySelector(`.chat-window__message--${unreadMessagesAuth[0]}`)

    const isScrollBottom = !!(
      lastScrollPosition[activeChat.chatKey] === undefined ||
      scrollHeight <= lastScrollPosition[activeChat.chatKey]! + height
    )

    const isFirstBunch = messagesData[messagesData.length - 1].key === renderedMessages[renderedMessages.length - 1].key

    if (firstUnreadMessageRef) {
      if (isScrollBottom) {
        console.log("firstUnreadMessageRef isScrollBottom: true")
        firstUnreadMessageRef?.parentElement?.scrollIntoView({ block: "start", inline: "start" })
      } else {
        if (isFirstBunch) {
          console.log("firstUnreadMessageRef isScrollBottom: false FIRST BUNCH")
          firstUnreadMessageRef?.parentElement?.scrollIntoView({ block: "start", inline: "start" })
        } else {
          console.log("firstUnreadMessageRef isScrollBottom: false NOT FIRST BUNCH")
          chatContainerRef.scrollTop = lastScrollPosition[activeChat.chatKey]!
        }
      }
    } else {
      if (isScrollBottom) {
        console.log("NOT firstUnreadMessageRef isScrollBottom: true")
        chatContainerRef.scrollTop = getContainerRect().scrollHeight + getContainerRect().height
        isScrollBottomRef.current = true
        firebase
          .chatMemberStatus({
            chatKey: activeChat.chatKey,
            memberKey: authUser?.uid!,
            isGroupChat: contactInfo.isGroupChat
          })
          .update({ chatBottom: true })
      } else {
        console.log("NOT firstUnreadMessageRef isScrollBottom: false")

        chatContainerRef.scrollTop = lastScrollPosition[activeChat.chatKey]!
      }
    }
    isScrolledFirstRenderRef.current = true
  }, [
    activeChat,
    messagesData,
    renderedMessages,
    unreadMessagesAuth,
    chatContainerRef,
    contactInfo,
    chatWindowLoading,
    lastScrollPosition
  ])

  useLayoutEffect(() => {
    if (!chatContainerRef) return
    const { scrollHeight, height } = getContainerRect()
    if (scrollHeight <= height) {
      isScrollBottomRef.current = true
      firebase
        .chatMemberStatus({
          chatKey: activeChat.chatKey,
          memberKey: authUser?.uid!,
          isGroupChat: contactInfo.isGroupChat
        })
        .update({ chatBottom: true })
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
    firebase
      .chatMemberStatus({
        chatKey: activeChat.chatKey,
        memberKey: authUser?.uid!,
        isGroupChat: contactInfo.isGroupChat
      })
      .update({ isOnline: true })
    return () => {
      firebase
        .chatMemberStatus({
          chatKey: activeChat.chatKey,
          memberKey: authUser?.uid!,
          isGroupChat: contactInfo.isGroupChat
        })
        .update({ isOnline: null })
    }
  }, [activeChat])

  useEffect(() => {
    firebase.newContactsActivity({ uid: authUser?.uid }).child(`${contactInfo.key}`).set(null)
  }, [contactInfo])

  const firstUnreadMessage = useMemo(() => {
    return messagesData?.find((message) => message.key === unreadMessagesAuth[0])
  }, [unreadMsgsListenerChatKey, rerenderUnreadMessagesStart, chatWindowLoading])

  return (
    <div className="chat-window-container" onMouseEnter={onMouseEnter}>
      <div
        className={classNames("chat-window__date chat-window__date--float", {
          "chat-window__date--float-fadein": isScrollingTop
        })}
      >
        {convertTimeStampToDate({ timeStamp: floatDate })}
      </div>

      {groupInfoSettingsActive && <GroupInfoSettings />}
      <ContactInfo isScrollBottomRef={isScrollBottomRef.current} />
      <div
        className={classNames("chat-window__messages-list-container", {
          "chat-window__messages-list-container--loading": messagesData === undefined,
          "chat-window__messages-list-container--group-chat": contactInfo.isGroupChat
        })}
        ref={chatContainerCallback}
      >
        {contactInfo.isGroupChat ? (
          <MessagesList firstUnreadMessage={firstUnreadMessage} />
        ) : (
          [true, "removed"].includes(contactInfo.status) &&
          (chatWindowLoading ? (
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

                const isFirstUnreadMessage = renderedMessage.key === firstUnreadMessage?.key

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

                    {renderedMessage.isRemovedFromContacts || renderedMessage.isNowContacts ? (
                      <InfoMessage renderedMessage={renderedMessage} privateChat={true} />
                    ) : (
                      <div
                        className={classNames("chat-window__message-wrapper", {
                          "chat-window__message-wrapper--send": renderedMessage.sender === authUser?.uid,
                          "chat-window__message-wrapper--receive": renderedMessage.sender === activeChat.contactKey,
                          "chat-window__message-wrapper--selected": selectedMessagesData.includes(renderedMessage.key),
                          "chat-window__message-wrapper--selection-active": selectedMessagesData.length,
                          "chat-window__message-wrapper--first-unread": isFirstUnreadMessage
                        })}
                        onClick={() => {
                          if (!selectedMessagesData.length) return
                          contactsDispatch({
                            type: "updateSelectedMessages",
                            payload: { messageKey: renderedMessage.key, chatKey: activeChat.chatKey }
                          })
                        }}
                      >
                        {isFirstUnreadMessage && (
                          <div className="chat-window__message-first-unread">
                            <span>Unread messages</span>
                          </div>
                        )}
                        <div
                          className={classNames(`chat-window__message chat-window__message--${renderedMessage.key}`, {
                            "chat-window__message--send": renderedMessage.sender === authUser?.uid,
                            "chat-window__message--receive": renderedMessage.sender === activeChat.contactKey,
                            "chat-window__message--last-in-bunch": renderedMessage.sender !== nextMessage?.sender,
                            "chat-window__message--deliver-failed": renderedMessage.isDelivered === false,
                            "chat-window__message--selected": selectedMessagesData.includes(renderedMessage.key)
                          })}
                          data-key={renderedMessage.key}
                        >
                          <div className="chat-window__message-inner">
                            <div
                              className="chat-window__message-text"
                              dangerouslySetInnerHTML={{
                                __html: `${renderedMessage.message}`
                              }}
                            ></div>
                            <MessageInfo messageData={renderedMessage} />
                          </div>
                        </div>
                        <button type="button" className="chat-window__select-btn"></button>
                      </div>
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          ))
        )}

        {[false, "rejected"].includes(contactInfo.status) && <NewRequestOptions />}
      </div>
      {!chatWindowLoading ? (
        contactInfo.isGroupChat && !contactInfo.removedFromGroup ? (
          <MessageInput
            chatContainerRef={chatContainerRef}
            getContainerRect={getContainerRect}
            unreadMessagesAuthRef={unreadMessagesAuthRef.current}
            contactLastActivity={contactLastActivity!}
          />
        ) : (
          contactInfo.status === true && (
            <MessageInput
              chatContainerRef={chatContainerRef}
              unreadMessagesAuthRef={unreadMessagesAuthRef.current}
              getContainerRect={getContainerRect}
              contactLastActivity={contactLastActivity!}
            />
          )
        )
      ) : (
        ""
      )}
    </div>
  )
}

export default ChatWindow
