import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import React, { useState, useEffect, useContext, useCallback, useRef } from "react"
import { ContactsContext } from "../../Context/ContactsContext"

type Props = {
  chatContainerRef: HTMLDivElement
}

const useIntersectionObserver = ({ chatContainerRef }: Props) => {
  const { authUser } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)
  const { activeChat, renderedMessagesList, authUserUnreadMessages, contacts } = context?.state!
  const contactInfo = contacts[activeChat.contactKey] || {}

  const observerRef = useRef<any>()

  console.log(chatContainerRef)

  const observerOptions: any = {
    root: chatContainerRef,
    rootMargin: "0px",
    threshold: 1.0
  }

  const observerCallback = useCallback(
    (entries: any) => {
      console.log("observer callback")
      entries.forEach((entry: any) => {
        if (entry.isIntersecting) {
          const messageKey = entry.target.dataset.key
          const messageRef: any = document.querySelector(`.chat-window__message--${messageKey}`)
          observerRef.current.unobserve(messageRef)

          console.log("intersected")

          firebase
            .unreadMessages({ uid: authUser?.uid!, chatKey: activeChat.chatKey })
            .orderByKey()
            .endAt(`${messageKey}`)
            .once("value", (snapshot: any) => {
              if (snapshot.val() === null) return
              console.log({ keys: Object.keys(snapshot.val()) })
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
    if (!authUserUnreadMessages[activeChat.chatKey]?.length) return
    if (contactInfo.status !== true) return
    if (!observerRef.current) return
    console.log(authUserUnreadMessages[activeChat.chatKey])
    renderedMessagesList[activeChat.chatKey].forEach((message) => {
      if (!authUserUnreadMessages[activeChat.chatKey].includes(message.key)) return
      const unreadMessage = document.querySelector(`.chat-window__message--${message.key}`)
      observerRef.current?.observe(unreadMessage)
    })
  }, [activeChat, renderedMessagesList, authUserUnreadMessages, contactInfo.status, observerRef.current])

  useEffect(() => {
    if (!chatContainerRef) return
    observerRef.current = new IntersectionObserver(observerCallback, observerOptions)
  }, [activeChat, chatContainerRef])
}

export default useIntersectionObserver
