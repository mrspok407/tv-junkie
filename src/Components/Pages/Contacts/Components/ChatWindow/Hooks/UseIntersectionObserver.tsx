import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import React, { useState, useEffect, useContext, useCallback, useRef } from "react"
import { ContactsContext } from "../../Context/ContactsContext"

type Props = {
  chatContainerRef: HTMLDivElement
  authUnreadMessages: string[]
}

const useIntersectionObserver = ({ chatContainerRef, authUnreadMessages }: Props) => {
  const { authUser } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)
  const { activeChat, renderedMessagesList, contacts } = context?.state!
  const contactInfo = contacts[activeChat.contactKey] || {}

  const observerRef = useRef<any>()
  const observedMessages = useRef<string[]>([])

  const observerOptions: any = {
    root: chatContainerRef,
    rootMargin: "0px",
    threshold: 1.0
  }

  const observerCallback = useCallback(
    (entries: any) => {
      console.log({ entries })
      entries.forEach((entry: any) => {
        if (entry.isIntersecting) {
          const messageKey = entry.target.dataset.key
          const messageRef: any = document.querySelector(`.chat-window__message--${messageKey}`)
          observerRef.current.unobserve(messageRef)
          observedMessages.current = [...observedMessages.current.filter((message) => message !== messageKey)]

          console.log("intersected")

          firebase
            .unreadMessages({ uid: authUser?.uid!, chatKey: activeChat.chatKey })
            .orderByKey()
            .endAt(`${messageKey}`)
            .once("value", (snapshot: any) => {
              if (snapshot.val() === null) return
              Object.keys(snapshot.val()).forEach((key: string) => {
                firebase.unreadMessages({ uid: authUser?.uid!, chatKey: activeChat.chatKey }).child(key).set(null)
              })
            })
        }
      })
    },
    [activeChat]
  )

  useEffect(() => {
    if (!renderedMessagesList[activeChat.chatKey]?.length) return
    if (!authUnreadMessages?.length) return
    if (contactInfo.status !== true) return
    if (!observerRef.current) return

    renderedMessagesList[activeChat.chatKey].forEach((message) => {
      if (!authUnreadMessages.includes(message.key)) return
      if (observedMessages.current.includes(message.key)) return
      console.log("test")
      const unreadMessage = document.querySelector(`.chat-window__message--${message.key}`)
      observedMessages.current = [...observedMessages.current, message.key]
      observerRef.current?.observe(unreadMessage)
    })
  }, [activeChat, renderedMessagesList, authUnreadMessages, contactInfo.status, observerRef.current])

  useEffect(() => {
    if (!renderedMessagesList[activeChat.chatKey]?.length) return
    observedMessages.current = [
      ...observedMessages.current.filter((message) =>
        renderedMessagesList[activeChat.chatKey].map((message) => message.key).includes(message)
      )
    ]
  }, [renderedMessagesList[activeChat.chatKey]])

  useEffect(() => {
    if (!chatContainerRef) return
    observerRef.current = new IntersectionObserver(observerCallback, observerOptions)

    return () => {
      observerRef.current.disconnect()
      observedMessages.current = []
    }
  }, [activeChat, chatContainerRef])
}

export default useIntersectionObserver
