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
  unreadMessagesAuthRef: string[]
  getContainerRect: () => ContainerRectInterface
}

const GoDown: React.FC<Props> = ({ chatContainerRef, chatKey, unreadMessagesAuthRef, getContainerRect }: Props) => {
  const firebase = useContext(FirebaseContext)
  const { authUser } = useContext(AppContext)
  const context = useContext(ContactsContext)
  const { renderedMessagesList, messages } = context?.state!
  const messagesData = messages[chatKey]
  const renderedMessages = renderedMessagesList[chatKey]

  const [fadeInButton, setFadeInButton] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState<string[]>([])

  const [wentToLastMessage, setWentToLastMessage] = useState(false)
  const [wentToFirstUnread, setWentToFirstUnread] = useState(false)

  useEffect(() => {
    const unreadMessagesListener = firebase
      .unreadMessages({ uid: authUser?.uid!, chatKey })
      .on("value", (snapshot: any) => {
        const unreadMessagesData = !snapshot.val() ? [] : Object.keys(snapshot.val())
        setUnreadMessages(unreadMessagesData)
      })

    return () => {
      firebase.unreadMessages({ uid: authUser?.uid!, chatKey }).off("value", unreadMessagesListener)
    }
  }, [firebase, chatKey])

  const onGoDown = () => {
    const renderedMessagesArray = renderedMessages.map((message) => message.key)
    if (!unreadMessages?.length) {
      context?.dispatch({
        type: "handleGoDown",
        payload: { unreadMessages }
      })
      setWentToLastMessage(true)
    } else {
      if (unreadMessages.some((message) => renderedMessagesArray.includes(message))) {
        firebase.unreadMessages({ uid: authUser?.uid!, chatKey }).set(null)
        setUnreadMessages([])
        unreadMessagesAuthRef = []
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
    const threshold = scrollHeight * 0.1

    if (!messagesData?.length || !renderedMessages?.length) return
    if (scrollHeight <= height) {
      setFadeInButton(false)
      return
    }
    if (
      scrollHeight - scrollTop - height >= threshold ||
      renderedMessages[renderedMessages?.length - 1].key !== messagesData[messagesData?.length - 1].key
    ) {
      // console.log("fade in true")
      setFadeInButton(true)
    } else {
      // console.log("fade in false")
      setFadeInButton(false)
    }
  }

  const handleScroll = useCallback(
    throttle(200, () => {
      // console.log("test")
      if (!renderedMessages?.length || !messagesData?.length) return
      handleFadeIn()
    }),
    [chatContainerRef, renderedMessages, messagesData, chatKey]
  )

  useLayoutEffect(() => {
    if (!renderedMessages?.length) return
    if (!wentToFirstUnread) return
    const firstUnreadMessage = unreadMessages[0]
    const firstUnreadMessageRef = document.querySelector(`.chat-window__message--${firstUnreadMessage}`)
    firstUnreadMessageRef?.scrollIntoView({ block: "start", inline: "start" })
    // console.log("go down first unread")
    setWentToFirstUnread(false)
  }, [renderedMessages, wentToFirstUnread])

  useLayoutEffect(() => {
    if (!renderedMessages?.length) return
    if (!wentToLastMessage) return
    const lastMessage = renderedMessages[renderedMessages.length - 1]
    const lastMessageRef = document.querySelector(`.chat-window__message--${lastMessage.key}`)
    //("go down last msg")
    lastMessageRef?.scrollIntoView({ block: "start", inline: "start" })
    setWentToLastMessage(false)
  }, [renderedMessages, wentToLastMessage])

  useLayoutEffect(() => {
    if (!chatContainerRef) return
    if (!renderedMessages?.length || !messagesData?.length) return
    handleFadeIn()
  }, [chatContainerRef, chatKey])

  useLayoutEffect(() => {
    if (!chatContainerRef) return
    if (!renderedMessages?.length || !messagesData?.length) return
    if (messagesData?.length <= 75) {
      handleFadeIn()
    }
  }, [chatContainerRef, chatKey, messagesData])

  useEffect(() => {
    if (!chatContainerRef) return
    const chatContainer = chatContainerRef
    chatContainer.addEventListener("scroll", handleScroll)
    return () => {
      // console.log("scroll GoDown remove")
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

export default GoDown
