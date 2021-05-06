import classNames from "classnames"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { ContainerRectInterface } from "Components/Pages/Contacts/Types"
import React, { useState, useEffect, useCallback, useLayoutEffect, useContext } from "react"
import { throttle } from "throttle-debounce"
import { ContactsContext } from "../../../Context/ContactsContext"
import "./GoDown.scss"

type Props = {
  chatContainerRef: HTMLDivElement
  chatKey: string
  authUnreadMessagesRef: string[]
  getContainerRect: () => ContainerRectInterface
}

const ToLastMessage: React.FC<Props> = ({
  chatContainerRef,
  chatKey,
  authUnreadMessagesRef,
  getContainerRect
}: Props) => {
  const firebase = useContext(FirebaseContext)
  const { authUser } = useContext(AppContext)
  const context = useContext(ContactsContext)
  const { renderedMessagesList, messages, activeChat } = context?.state!

  const [fadeInButton, setFadeInButton] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState<string[]>([])

  const [wentToLastMessage, setWentToLastMessage] = useState(false)
  const [wentToFirstUnread, setWentToFirstUnread] = useState(false)

  useEffect(() => {
    const unreadMessagesListener = firebase
      .unreadMessages({ uid: authUser?.uid!, chatKey })
      .on("value", (snapshot: any) => {
        const unreadMessagesAuth = !snapshot.val() ? [] : Object.keys(snapshot.val())
        setUnreadMessages(unreadMessagesAuth)
      })

    return () => {
      firebase.unreadMessages({ uid: authUser?.uid!, chatKey }).off("value", unreadMessagesListener)
    }
  }, [firebase, chatKey])

  const onGoDown = () => {
    const renderedMessagesData = renderedMessagesList[activeChat.chatKey].map((message) => message.key)
    if (!unreadMessages.length) {
      context?.dispatch({
        type: "handleGoDown",
        payload: { unreadMessages }
      })
      setWentToLastMessage(true)
    } else {
      if (unreadMessages.some((message) => renderedMessagesData.includes(message))) {
        firebase.unreadMessages({ uid: authUser?.uid!, chatKey }).set(null)
        setUnreadMessages([])
        authUnreadMessagesRef = []
        setWentToLastMessage(true)
      } else {
        setWentToFirstUnread(true)
      }
      context?.dispatch({
        type: "handleGoDown",
        payload: { unreadMessages }
      })
    }
  }

  const handleFadeIn = () => {
    const { height, scrollHeight, scrollTop } = getContainerRect()
    const threshold = 400

    const renderedMessages = renderedMessagesList[activeChat.chatKey]
    const messagesData = messages[activeChat.chatKey]

    if (!messagesData || !renderedMessages) return
    if (scrollHeight <= height) {
      setFadeInButton(false)
      return
    }
    if (
      scrollHeight - scrollTop - height >= threshold ||
      renderedMessages[renderedMessages?.length - 1].key !== messagesData[messagesData?.length - 1].key
    ) {
      setFadeInButton(true)
    } else {
      setFadeInButton(false)
    }
  }

  const handleScroll = useCallback(
    throttle(200, () => {
      if (!renderedMessagesList[chatKey] || !messages[chatKey]) return
      handleFadeIn()
    }),
    [chatContainerRef, renderedMessagesList[chatKey], messages[chatKey], chatKey]
  )

  useLayoutEffect(() => {
    if (!renderedMessagesList[activeChat.chatKey]?.length) return
    if (!wentToFirstUnread) return
    const firstUnreadMessage = unreadMessages[0]
    const firstUnreadMessageRef = document.querySelector(`.chat-window__message--${firstUnreadMessage}`)
    firstUnreadMessageRef?.scrollIntoView({ block: "start", inline: "start" })
    console.log("go down first unread")
    setWentToFirstUnread(false)
  }, [renderedMessagesList[activeChat.chatKey], wentToFirstUnread])

  useLayoutEffect(() => {
    if (!renderedMessagesList[activeChat.chatKey]?.length) return
    if (!wentToLastMessage) return
    const renderedMessages = renderedMessagesList[activeChat.chatKey]
    const lastMessage = renderedMessages[renderedMessages.length - 1]
    const lastMessageRef = document.querySelector(`.chat-window__message--${lastMessage.key}`)
    console.log("go down last msg")
    lastMessageRef?.scrollIntoView({ block: "start", inline: "start" })
    setWentToLastMessage(false)
  }, [renderedMessagesList[activeChat.chatKey], wentToLastMessage])

  useLayoutEffect(() => {
    if (!chatContainerRef) return
    if (!renderedMessagesList[chatKey] || !messages[chatKey]) return
    handleFadeIn()
  }, [chatContainerRef, chatKey, renderedMessagesList[chatKey], messages[chatKey]])

  useEffect(() => {
    if (!chatContainerRef) return
    const chatContainer = chatContainerRef
    chatContainer.addEventListener("scroll", handleScroll)
    return () => {
      chatContainer.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll, chatKey])

  return (
    <>
      {fadeInButton && (
        <div
          className={classNames("chat-window__go-down", {
            "chat-window__to-last-message--unread": !!unreadMessages
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

export default ToLastMessage
