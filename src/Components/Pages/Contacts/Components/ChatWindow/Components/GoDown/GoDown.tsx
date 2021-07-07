import classNames from "classnames"
import { ContainerRectInterface, MessageInterface } from "Components/Pages/Contacts/@Types"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import React, { useState, useEffect, useCallback, useLayoutEffect, useRef } from "react"
import { throttle } from "throttle-debounce"
import "./GoDown.scss"

type Props = {
  chatContainerRef: HTMLDivElement
  chatKey: string
  unreadMessagesAuthRef: string[]
  getContainerRect: () => ContainerRectInterface
}

const GoDown: React.FC<Props> = ({ chatContainerRef, chatKey, unreadMessagesAuthRef, getContainerRect }: Props) => {
  const { firebase, authUser, contactsState, contactsDispatch } = useFrequentVariables()
  const { activeChat, renderedMessagesList, messages, contacts } = contactsState
  const messagesData = messages[chatKey]
  const renderedMessages = renderedMessagesList[chatKey]
  const contactInfo = contacts[activeChat.contactKey] || {}

  const [fadeInButton, setFadeInButton] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState<string[]>([])

  const [wentToLastMessage, setWentToLastMessage] = useState(false)
  const [wentToFirstUnread, setWentToFirstUnread] = useState(false)

  const messagesRef = useRef<MessageInterface[]>([])
  const renderedMessagesRef = useRef<MessageInterface[]>([])

  useLayoutEffect(() => {
    messagesRef.current = messagesData
    renderedMessagesRef.current = renderedMessages
  }, [messagesData, renderedMessages, chatKey])

  useEffect(() => {
    const unreadMessagesListener = firebase
      .unreadMessages({ uid: authUser?.uid!, chatKey, isGroupChat: contactInfo.isGroupChat })
      .on("value", (snapshot: any) => {
        const unreadMessagesData = !snapshot.val() ? [] : Object.keys(snapshot.val())
        setUnreadMessages(unreadMessagesData)
      })

    return () => {
      firebase
        .unreadMessages({ uid: authUser?.uid!, chatKey, isGroupChat: contactInfo.isGroupChat })
        .off("value", unreadMessagesListener)
    }
  }, [chatKey, authUser, firebase]) // eslint-disable-line react-hooks/exhaustive-deps

  const onGoDown = () => {
    const renderedMessagesArray = renderedMessages.map((message) => message.key)
    if (!unreadMessages?.length) {
      contactsDispatch({
        type: "handleGoDown",
        payload: { unreadMessages }
      })
      setWentToLastMessage(true)
    } else {
      if (unreadMessages.some((message) => renderedMessagesArray.includes(message))) {
        firebase.unreadMessages({ uid: authUser?.uid!, chatKey, isGroupChat: contactInfo.isGroupChat }).set(null)
        setUnreadMessages([])
        unreadMessagesAuthRef = []
        setWentToLastMessage(true)
      } else {
        setWentToFirstUnread(true)
      }
      contactsDispatch({
        type: "handleGoDown",
        payload: { unreadMessages }
      })
    }
  }

  const handleFadeIn = () => {
    const { height, scrollHeight, scrollTop } = getContainerRect()
    const threshold = scrollHeight * 0.1

    if (!messagesRef.current?.length || !renderedMessagesRef.current?.length || scrollHeight <= height) {
      setFadeInButton(false)
      return
    }
    if (
      scrollHeight - scrollTop - height >= threshold ||
      renderedMessagesRef.current[renderedMessagesRef.current?.length - 1].key !==
        messagesRef.current[messagesRef.current?.length - 1].key
    ) {
      setFadeInButton(true)
    } else {
      setFadeInButton(false)
    }
  }

  const handleScroll = useCallback(
    throttle(150, () => {
      handleFadeIn()
    }),
    [chatContainerRef, chatKey]
  )

  useLayoutEffect(() => {
    if (!renderedMessages?.length) return
    if (!wentToFirstUnread) return
    const firstUnreadMessage = unreadMessages[0]
    const firstUnreadMessageRef = document.querySelector(`.chat-window__message--${firstUnreadMessage}`)
    firstUnreadMessageRef?.parentElement?.scrollIntoView({ block: "start", inline: "start" })
    setWentToFirstUnread(false)
  }, [renderedMessages, wentToFirstUnread, unreadMessages])

  useLayoutEffect(() => {
    if (!renderedMessages?.length) return
    if (!wentToLastMessage) return
    chatContainerRef.scrollTop = getContainerRect().scrollHeight + getContainerRect().height
    setWentToLastMessage(false)
  }, [renderedMessages, wentToLastMessage]) // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (!chatContainerRef) return
    handleFadeIn()
  }, [chatContainerRef, chatKey]) // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (!chatContainerRef) return
    if (!renderedMessages?.length || !messagesData?.length) {
      setFadeInButton(false)
      return
    }
    if (messagesData?.length <= 75) {
      handleFadeIn()
    }
  }, [chatContainerRef, chatKey, messagesData, renderedMessages]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!chatContainerRef) return
    const chatContainer = chatContainerRef
    chatContainer.addEventListener("scroll", handleScroll)
    return () => {
      chatContainer.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll, chatContainerRef])

  return (
    <>
      {fadeInButton && (
        <div
          className={classNames("chat-window__go-down", {
            "chat-window__to-last-message--unread": !!unreadMessages,
            "chat-window__go-down--fadein": fadeInButton
          })}
        >
          <button type="button" onClick={() => onGoDown()}></button>
          {unreadMessages.length !== 0 && (
            <span
              className={classNames("unread-messages", {
                "unread-messages--max": !!(unreadMessages.length >= 99)
              })}
            >
              {unreadMessages ? (unreadMessages.length >= 99 ? "99+" : unreadMessages.length) : ""}
            </span>
          )}
        </div>
      )}
    </>
  )
}

export default GoDown
