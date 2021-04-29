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

  const loadTopMessages = useCallback(async () => {
    if (!messages[activeChat.chatKey]) return

    const firstRenderedMessageIndex = messages[activeChat.chatKey].findIndex(
      (item) => item.key === renderedMessagesList[activeChat.chatKey][0].key
    )

    console.log({ firstRenderedMessageIndex })

    if (!(firstRenderedMessageIndex <= 100 && firstRenderedMessageIndex !== 0)) return

    // if (
    //   !renderedMessagesList[activeChat.chatKey].find((item: any) => item.key === messages[activeChat.chatKey][0].key)
    // ) {
    //   // context?.dispatch({ type: "renderTopMessages", payload: { messagesToRender: MESSAGES_TO_RENDER } })
    //   return
    // }

    console.log("load top messages")

    const topMessagesSnapshot = await messagesRef
      .orderByChild("timeStamp")
      .endBefore(messages[activeChat.chatKey][0].timeStamp)
      .limitToLast(MESSAGES_TO_LOAD)
      .once("value")

    console.log({ topMessagesSnapshot: topMessagesSnapshot.val() })

    if (topMessagesSnapshot.val() === null) {
      //  context?.dispatch({ type: "renderTopMessages", payload: { messagesToRender: MESSAGES_TO_RENDER } })
      // context?.dispatch({ type: "renderTopMessages", payload: { messagesToRender: MESSAGES_TO_RENDER } })
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
    // context?.dispatch({ type: "renderTopMessages", payload: { messagesToRender: MESSAGES_TO_RENDER } })
  }, [activeChat, messages, renderedMessagesList])

  return loadTopMessages
}

export default useLoadTopMessages
