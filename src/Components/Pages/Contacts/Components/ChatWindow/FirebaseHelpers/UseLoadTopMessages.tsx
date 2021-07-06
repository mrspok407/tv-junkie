import { useState, useContext, useCallback, useRef } from "react"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { ContactsContext } from "../../@Context/ContactsContext"
import { MessageInterface, MESSAGE_INITIAL_DATA } from "Components/Pages/Contacts/@Types"
import { isUnexpectedObject } from "Utils"
import { MESSAGES_TO_LOAD } from "../../@Context/Constants"
import debounce from "debounce"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"

const useLoadTopMessages = () => {
  const { firebase, authUser, errors, contactsContext, contactsState } = useFrequentVariables()
  const { messages, renderedMessagesList, activeChat, contacts } = contactsState
  const contactInfo = contacts[activeChat.contactKey] || {}
  const messagesData = messages[activeChat.chatKey] || []
  const renderedMessages = renderedMessagesList[activeChat.chatKey] || []
  const messagesRef = firebase.messages({ chatKey: activeChat.chatKey, isGroupChat: contactInfo.isGroupChat })

  const [loadingTopMessages, setLoadingTopMessages] = useState(false)
  const loadedMessageGroups = useRef<number[]>([])

  const messagesToDelete = useRef<MessageInterface[]>([])
  const removeMessagesDebounce = useCallback(
    debounce((removedMessages: any) => {
      contactsContext?.dispatch({ type: "removeMessages", payload: { removedMessages, chatKey: activeChat.chatKey } })
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
    setLoadingTopMessages(true)
    const topMessagesSnapshot = await messagesRef
      .orderByChild("timeStamp")
      .endBefore(messagesData[0].timeStamp)
      .limitToLast(MESSAGES_TO_LOAD)
      .once("value")

    if (topMessagesSnapshot.val() === null) {
      setLoadingTopMessages(false)
      return
    }

    let newTopMessages: MessageInterface[] = []
    topMessagesSnapshot.forEach((message: any) => {
      // if (
      //   isUnexpectedObject({ exampleObject: MESSAGE_INITIAL_DATA, targetObject: message.val() }) &&
      //   !contactInfo.isGroupChat
      // ) {
      //   errors.handleError({
      //     message: "Some of the messages were hidden, because of the unexpected error."
      //   })
      //   return
      // }
      newTopMessages.push({ ...message.val(), key: message.key })
    })
    contactsContext?.dispatch({ type: "loadTopMessages", payload: { newTopMessages } })

    messagesRef
      .orderByChild("timeStamp")
      .endBefore(messagesData[0].timeStamp)
      .limitToLast(MESSAGES_TO_LOAD)
      .on("child_changed", (snapshot: { val: () => MessageInterface; key: string }) => {
        // if (
        //   isUnexpectedObject({ exampleObject: MESSAGE_INITIAL_DATA, targetObject: snapshot.val() }) &&
        //   !contactInfo.isGroupChat
        // ) {
        //   errors.handleError({
        //     message: "Message hasn't been changed, because of the unexpected error. Please reload the page."
        //   })
        //   return
        // }

        const editedMessage = { ...snapshot.val(), key: snapshot.key }
        contactsContext?.dispatch({ type: "editMessage", payload: { editedMessage, chatKey: activeChat.chatKey } })
        console.log({ changedChild: editedMessage })
      })

    messagesRef
      .orderByChild("timeStamp")
      .endBefore(messagesData[0].timeStamp)
      .limitToLast(MESSAGES_TO_LOAD)
      .on("child_removed", (snapshot: { val: () => MessageInterface; key: string }) => {
        // if (
        //   isUnexpectedObject({ exampleObject: MESSAGE_INITIAL_DATA, targetObject: snapshot.val() }) &&
        //   !contactInfo.isGroupChat
        // ) {
        //   errors.handleError({
        //     message: "Message hasn't been deleted, because of the unexpected error. Please reload the page."
        //   })
        //   return
        // }
        const removedMessage = { ...snapshot.val(), key: snapshot.key }
        console.log({ removedMessage })
        messagesToDelete.current.push(removedMessage)
        removeMessagesDebounce(messagesToDelete.current)
      })

    setLoadingTopMessages(false)
  }, [activeChat, messagesData, renderedMessages])

  return { loadTopMessages, loadingTopMessages }
}

export default useLoadTopMessages
