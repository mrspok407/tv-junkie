import { useState, useContext, useCallback, useRef } from "react"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { ContactsContext } from "../../@Context/ContactsContext"
import { MessageInterface, MESSAGE_INITIAL_DATA } from "Components/Pages/Contacts/@Types"
import { isUnexpectedObject } from "Utils"
import { MESSAGES_TO_LOAD } from "../../@Context/Constants"
import debounce from "debounce"

const useLoadTopMessages = () => {
  const { errors } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)
  const { messages, renderedMessagesList, activeChat, contacts } = context?.state!
  const contactInfo = contacts[activeChat.contactKey] || {}
  const messagesData = messages[activeChat.chatKey] || []
  const renderedMessages = renderedMessagesList[activeChat.chatKey] || []
  const messagesRef = firebase.messages({ chatKey: activeChat.chatKey, isGroupChat: contactInfo.isGroupChat })

  const [loading, setLoading] = useState(false)
  const loadedMessageGroups = useRef<number[]>([])

  const messagesToDelete = useRef<MessageInterface[]>([])
  const removeMessagesDebounce = useCallback(
    debounce((removedMessages: any) => {
      context?.dispatch({ type: "removeMessages", payload: { removedMessages, chatKey: activeChat.chatKey } })
      console.log(activeChat.chatKey)
      messagesToDelete.current = []
    }, 100),
    [activeChat]
  )

  const loadTopMessages = useCallback(async () => {
    if (!messagesData?.length) return
    if (loadedMessageGroups.current.includes(messagesData[0].timeStamp)) return

    const firstRenderedMessageIndex = messagesData.findIndex((item) => item.key === renderedMessages[0].key)

    // console.log({ firstRenderedMessageIndex })

    if (!(firstRenderedMessageIndex <= 100 && firstRenderedMessageIndex !== 0)) return

    loadedMessageGroups.current = [...loadedMessageGroups.current, messagesData[0].timeStamp]

    console.log("load top messages")
    setLoading(true)
    const topMessagesSnapshot = await messagesRef
      .orderByChild("timeStamp")
      .endBefore(messagesData[0].timeStamp)
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
      .endBefore(messagesData[0].timeStamp)
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
      .endBefore(messagesData[0].timeStamp)
      .limitToLast(MESSAGES_TO_LOAD)
      .on("child_removed", (snapshot: { val: () => MessageInterface; key: string }) => {
        if (isUnexpectedObject({ exampleObject: MESSAGE_INITIAL_DATA, targetObject: snapshot.val() })) {
          errors.handleError({
            message: "Message hasn't been deleted, because of the unexpected error. Please reload the page."
          })
          return
        }
        const removedMessage = { ...snapshot.val(), key: snapshot.key }
        console.log({ removedMessage })
        messagesToDelete.current.push(removedMessage)
        removeMessagesDebounce(messagesToDelete.current)
      })

    setLoading(false)
  }, [activeChat, messagesData, renderedMessages])

  return { loadTopMessages, loading }
}

export default useLoadTopMessages
