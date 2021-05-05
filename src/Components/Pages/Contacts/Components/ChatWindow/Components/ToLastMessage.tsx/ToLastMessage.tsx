import classNames from "classnames"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import React, { useState, useEffect, useCallback, useLayoutEffect, useContext } from "react"
import { throttle } from "throttle-debounce"
import { ContactsContext } from "../../../Context/ContactsContext"
import "./ToLastMessage.scss"

type Props = {
  chatContainerRef: HTMLDivElement
  chatKey: string
  authUnreadMessagesRef: string[]
}

const ToLastMessage: React.FC<Props> = ({ chatContainerRef, chatKey, authUnreadMessagesRef }: Props) => {
  const firebase = useContext(FirebaseContext)
  const { authUser } = useContext(AppContext)
  const context = useContext(ContactsContext)
  const { renderedMessagesList, activeChat } = context?.state!

  const [fadeIn, setFadeIn] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState<string[]>([])
  const [wentDown, setWentDown] = useState(false)

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

  const handleGoDown = () => {
    const height = chatContainerRef.getBoundingClientRect().height
    const scrollHeight = chatContainerRef.scrollHeight
    const renderedMessagesData = renderedMessagesList[activeChat.chatKey].map((message) => message.key)
    if (unreadMessages.some((message) => renderedMessagesData.includes(message))) {
      firebase.unreadMessages({ uid: authUser?.uid!, chatKey }).set(null)

      context?.dispatch({
        type: "handleGoDown",
        payload: { unreadMessages }
      })
      setUnreadMessages([])
      authUnreadMessagesRef = []
      setWentDown(true)

      //   chatContainerRef.scrollTop = 999999
    }
  }

  useLayoutEffect(() => {
    if (!renderedMessagesList[activeChat.chatKey]?.length) return
    if (!wentDown) return
    const renderedMessages = renderedMessagesList[activeChat.chatKey]
    const lastMessage = renderedMessages[renderedMessages.length - 1]
    const lastMessageRef = document.querySelector(`.chat-window__message--${lastMessage.key}`)
    lastMessageRef?.scrollIntoView({ block: "start", inline: "start", behavior: "smooth" })
    setWentDown(false)
  }, [renderedMessagesList[activeChat.chatKey], wentDown])

  const handleFadeIn = () => {
    const height = chatContainerRef.getBoundingClientRect().height
    const scrollHeight = chatContainerRef.scrollHeight
    const scrollTop = chatContainerRef.scrollTop
    const threshold = 400

    if (scrollHeight <= height) {
      setFadeIn(false)
      return
    }
    if (scrollHeight - scrollTop - height >= threshold) {
      setFadeIn(true)
    } else {
      setFadeIn(false)
    }
  }

  const handleScroll = useCallback(
    throttle(200, () => handleFadeIn()),
    [chatContainerRef]
  )

  useLayoutEffect(() => {
    if (!chatContainerRef) return
    handleFadeIn()
  }, [chatContainerRef, chatKey])

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
      {fadeIn && (
        <div
          className={classNames("chat-window__go-down", {
            "chat-window__to-last-message--unread": !!unreadMessages
          })}
        >
          <button type="button" onClick={() => handleGoDown()}></button>
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
