import React, { useState, useEffect, useContext, useCallback, useRef } from "react"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { ContactsContext } from "../../Context/ContactsContext"
import { MessageInterface, MESSAGE_INITIAL_DATA, SnapshotStringBooleanInterface } from "Components/Pages/Contacts/Types"
import { isUnexpectedObject } from "Utils"
import { setMessagesSnapshot } from "./setMessagesSnapshot"
import { MESSAGES_TO_LOAD, MESSAGES_TO_RENDER } from "../../Context/Constants"
import debounce from "debounce"

const useLoadTopMessages = () => {
  const { authUser, errors } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)
  const { messages, renderedMessagesList, activeChat } = context?.state!
  const messagesRef = firebase.messages({ chatKey: activeChat.chatKey })

  const [loading, setLoading] = useState(false)

  const loadedMessageGroups = useRef<number[]>([])

  const loadTopMessages = useCallback(async () => {
    if (!messages[activeChat.chatKey]) return
    if (loadedMessageGroups.current.includes(messages[activeChat.chatKey][0].timeStamp)) return

    const firstRenderedMessageIndex = messages[activeChat.chatKey].findIndex(
      (item) => item.key === renderedMessagesList[activeChat.chatKey][0].key
    )

    console.log({ firstRenderedMessageIndex })

    if (!(firstRenderedMessageIndex <= 100 && firstRenderedMessageIndex !== 0)) return

    loadedMessageGroups.current = [...loadedMessageGroups.current, messages[activeChat.chatKey][0].timeStamp]

    console.log("load top messages")
    setLoading(true)
    const topMessagesSnapshot = await messagesRef
      .orderByChild("timeStamp")
      .endBefore(messages[activeChat.chatKey][0].timeStamp)
      .limitToLast(MESSAGES_TO_LOAD)
      .once("value")

    if (topMessagesSnapshot.val() === null) {
      setLoading(false)
      return
    }

    let newTopMessages: MessageInterface[] = []
    topMessagesSnapshot.forEach((message: any) => {
      if (isUnexpectedObject({ exampleObject: MESSAGE_INITIAL_DATA, targetObject: message.val() })) {
        errors.handleError({
          message: "Some of the messages were hidden, because of the unexpected error."
        })
        return
      }
      newTopMessages.push({ ...message.val(), key: message.key })
    })
    context?.dispatch({ type: "loadTopMessages", payload: { newTopMessages } })

    messagesRef
      .orderByChild("timeStamp")
      .endBefore(messages[activeChat.chatKey][0].timeStamp)
      .limitToLast(MESSAGES_TO_LOAD)
      .on("child_changed", (snapshot: { val: () => MessageInterface; key: string }) => {
        if (isUnexpectedObject({ exampleObject: MESSAGE_INITIAL_DATA, targetObject: snapshot.val() })) {
          errors.handleError({
            message: "Message hasn't been changed, because of the unexpected error. Please reload the page."
          })
          return
        }

        const changedMessage = { ...snapshot.val(), key: snapshot.key }
        context?.dispatch({ type: "changeMessage", payload: { changedMessage, chatKey: activeChat.chatKey } })
        console.log({ changedChild: changedMessage })
      })

    messagesRef
      .orderByChild("timeStamp")
      .endBefore(messages[activeChat.chatKey][0].timeStamp)
      .limitToLast(MESSAGES_TO_LOAD)
      .on("child_removed", (snapshot: { val: () => MessageInterface; key: string }) => {
        if (isUnexpectedObject({ exampleObject: MESSAGE_INITIAL_DATA, targetObject: snapshot.val() })) {
          errors.handleError({
            message: "Message hasn't been deleted, because of the unexpected error. Please reload the page."
          })
          return
        }
        const removedMessage = { ...snapshot.val(), key: snapshot.key }
        context?.dispatch({ type: "removeMessage", payload: { removedMessage, chatKey: activeChat.chatKey } })
        console.log({ removedMessage })
      })

    setLoading(false)
  }, [activeChat, messages, renderedMessagesList])

  return { loadTopMessages, loading }
}

export default useLoadTopMessages
