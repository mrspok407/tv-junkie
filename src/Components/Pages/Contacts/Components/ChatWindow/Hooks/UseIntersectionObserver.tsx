import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import { useEffect, useContext, useCallback, useRef } from "react"
import { ContactsContext } from "../../@Context/ContactsContext"

type Props = {
  chatContainerRef: HTMLDivElement
  unreadMessagesAuth: string[]
  unreadMsgsListenerChatKey: string
  pageInFocus: boolean
  chatWindowLoading: boolean
}

const useIntersectionObserver = ({
  chatContainerRef,
  unreadMessagesAuth,
  unreadMsgsListenerChatKey,
  pageInFocus,
  chatWindowLoading
}: Props) => {
  const { firebase, authUser, errors, contactsContext, contactsState } = useFrequentVariables()
  const { activeChat, renderedMessagesList, contacts } = contactsState
  const renderedMessages = renderedMessagesList[activeChat.chatKey]
  const contactInfo = contacts[activeChat.contactKey] || {}

  let observerRef: any
  const observedMessages = useRef<string[]>([])

  const observerCallback = (entries: any) => {
    entries.forEach((entry: any) => {
      if (entry.isIntersecting) {
        const messageKey = entry.target.dataset.key
        const messageRef: any = document.querySelector(`.chat-window__message--${messageKey}`)
        observerRef.unobserve(messageRef)
        observedMessages.current = [...observedMessages.current.filter((message) => message !== messageKey)]

        firebase
          .unreadMessages({ uid: authUser?.uid!, chatKey: activeChat.chatKey, isGroupChat: contactInfo.isGroupChat })
          .orderByKey()
          .endAt(`${messageKey}`)
          .once("value", (snapshot: any) => {
            if (snapshot.val() === null) return
            Object.keys(snapshot.val()).forEach(async (key: string) => {
              try {
                await firebase
                  .unreadMessages({
                    uid: authUser?.uid!,
                    chatKey: activeChat.chatKey,
                    isGroupChat: contactInfo.isGroupChat
                  })
                  .child(key)
                  .set(null)
              } catch (error) {
                errors.handleError({
                  errorData: error,
                  message: "There has been some error updating database. Tye to realod the page."
                })

                throw new Error(`There has been some error updating database: ${error}`)
              }
            })
          })
      }
    })
  }

  const observerOptions: any = {
    root: chatContainerRef && chatContainerRef,
    rootMargin: "0px",
    threshold: 1.0
  }
  observerRef = new IntersectionObserver(observerCallback, observerOptions)

  useEffect(() => {
    if (!unreadMsgsListenerChatKey) return
    if (!renderedMessages?.length || !unreadMessagesAuth?.length) return
    if (![true, "removed"].includes(contactInfo.status) && !contactInfo.isGroupChat) return
    if (!observerRef || !pageInFocus || chatWindowLoading) return

    console.log({ unreadMessagesAuth })
    console.log({ observedMessages: observedMessages.current })

    renderedMessages.forEach((message) => {
      if (!unreadMessagesAuth.includes(message.key)) return
      if (observedMessages.current.includes(message.key)) return
      const unreadMessage = document.querySelector(`.chat-window__message--${message.key}`)
      observedMessages.current = [...observedMessages.current, message.key]
      observerRef?.observe(unreadMessage)
    })
  }, [activeChat, renderedMessages, unreadMsgsListenerChatKey, contactInfo, pageInFocus, chatWindowLoading])

  const onMouseEnter = () => {
    if (!renderedMessages?.length || !unreadMessagesAuth?.length) return
    if (![true, "removed"].includes(contactInfo.status) && !contactInfo.isGroupChat) return
    if (!observerRef || pageInFocus || chatWindowLoading) return

    renderedMessages.forEach((message) => {
      if (!unreadMessagesAuth.includes(message.key)) return
      if (observedMessages.current.includes(message.key)) return
      const unreadMessage = document.querySelector(`.chat-window__message--${message.key}`)
      observedMessages.current = [...observedMessages.current, message.key]
      observerRef?.observe(unreadMessage)
    })
  }

  useEffect(() => {
    if (!renderedMessages?.length) return
    observedMessages.current = [
      ...observedMessages.current.filter((message) => renderedMessages.map((message) => message.key).includes(message))
    ]
  }, [renderedMessages])

  useEffect(() => {
    return () => {
      observerRef.disconnect()
      observedMessages.current = []
    }
  }, [activeChat])

  return { onMouseEnter }
}

export default useIntersectionObserver
