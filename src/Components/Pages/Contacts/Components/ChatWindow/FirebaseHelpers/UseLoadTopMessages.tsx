import { useState, useCallback, useRef } from "react"
import { MessageInterface } from "Components/Pages/Contacts/@Types"
import { MESSAGES_TO_LOAD } from "../../@Context/Constants"
import debounce from "debounce"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"

const useLoadTopMessages = () => {
  const { firebase, contactsState, contactsDispatch } = useFrequentVariables()
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
      contactsDispatch({ type: "removeMessages", payload: { removedMessages, chatKey: activeChat.chatKey } })
      messagesToDelete.current = []
    }, 100),
    [activeChat]
  )

  const loadTopMessages = useCallback(async () => {
    if (!messagesData?.length) return
    if (loadedMessageGroups.current.includes(messagesData[0].timeStamp)) return

    const firstRenderedMessageIndex = messagesData.findIndex((item) => item.key === renderedMessages[0].key)
    if (!(firstRenderedMessageIndex <= 100 && firstRenderedMessageIndex !== 0)) return

    loadedMessageGroups.current = [...loadedMessageGroups.current, messagesData[0].timeStamp]

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
      newTopMessages.push({ ...message.val(), key: message.key })
    })
    contactsDispatch({ type: "loadTopMessages", payload: { newTopMessages } })

    messagesRef
      .orderByChild("timeStamp")
      .endBefore(messagesData[0].timeStamp)
      .limitToLast(MESSAGES_TO_LOAD)
      .on("child_changed", (snapshot: { val: () => MessageInterface; key: string }) => {
        const editedMessage = { ...snapshot.val(), key: snapshot.key }
        contactsDispatch({ type: "editMessage", payload: { editedMessage, chatKey: activeChat.chatKey } })
      })

    messagesRef
      .orderByChild("timeStamp")
      .endBefore(messagesData[0].timeStamp)
      .limitToLast(MESSAGES_TO_LOAD)
      .on("child_removed", (snapshot: { val: () => MessageInterface; key: string }) => {
        const removedMessage = { ...snapshot.val(), key: snapshot.key }
        messagesToDelete.current.push(removedMessage)
        removeMessagesDebounce(messagesToDelete.current)
      })

    setLoadingTopMessages(false)
  }, [activeChat, messagesData, renderedMessages, contactsDispatch]) // eslint-disable-line react-hooks/exhaustive-deps

  return { loadTopMessages, loadingTopMessages }
}

export default useLoadTopMessages
