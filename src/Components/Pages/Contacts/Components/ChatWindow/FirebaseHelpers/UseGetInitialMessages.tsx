import { useState, useEffect, useRef, useCallback } from "react"
import { MessageInterface } from "Components/Pages/Contacts/@Types"
import { setMessagesSnapshot } from "./setMessagesSnapshot"
import { MESSAGES_TO_RENDER, UNREAD_MESSAGES_TO_RENDER } from "../../@Context/Constants"
import debounce from "debounce"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"

const useGetInitialMessages = ({ chatKey, isGroupChat }: { chatKey: string; isGroupChat: boolean }) => {
  const { firebase, authUser, errors, contactsState, contactsDispatch } = useFrequentVariables()
  const { messages } = contactsState
  const messagesData = messages[chatKey]

  const [loading, setLoading] = useState(false)
  const messagesRef = firebase.messages({ chatKey, isGroupChat })

  const messagesToDelete = useRef<MessageInterface[]>([])
  const removeMessagesDebounce = useCallback(
    debounce((removedMessages: any) => {
      contactsDispatch({ type: "removeMessages", payload: { removedMessages, chatKey } })
      console.log(chatKey)
      messagesToDelete.current = []
    }, 0),
    [chatKey]
  )

  useEffect(() => {
    if (messagesData !== undefined) return
    if (loading) return
    setLoading(true)

    const getMessages = async () => {
      let messagesSnapshot: any
      let firstUnreadMessageKey: any

      try {
        ;[messagesSnapshot, firstUnreadMessageKey] = await setMessagesSnapshot({
          chatKey,
          isGroupChat,
          authUser,
          messagesRef,
          firebase
        })

        firstUnreadMessageKey =
          firstUnreadMessageKey.val() === null ? false : Object.keys(firstUnreadMessageKey.val()!)[0]
      } catch (error) {
        errors.handleError({
          message: "There were a problem loading messages. Please try to reload the page."
        })
        contactsDispatch({ type: "setInitialMessages", payload: { messagesData: [], chatKey } })
        setLoading(false)
        throw new Error("There were a problem loading messages. Please try to reload the page.")
      }

      if (messagesSnapshot.val() === null) {
        contactsDispatch({ type: "setInitialMessages", payload: { messagesData: [], chatKey } })
        setLoading(false)
      }

      let firstMessageTimeStamp = 0
      let lastMessageTimeStamp = 0

      if (messagesSnapshot.val() !== null) {
        let messagesData: MessageInterface[] = []
        messagesSnapshot.forEach((message: any) => {
          messagesData.push({ ...message.val(), key: message.key })
        })

        const indexFirstUnreadMessage = messagesData.findIndex((message) => message.key === firstUnreadMessageKey)
        const authUnreadMessages =
          indexFirstUnreadMessage === -1 ? [] : [...messagesData].slice(indexFirstUnreadMessage)

        firstMessageTimeStamp = messagesData[0].timeStamp
        lastMessageTimeStamp = messagesData[messagesData.length - 1].timeStamp

        let startIndexRender: number = 0
        let endIndexRender: number = 0

        if (messagesData.length <= MESSAGES_TO_RENDER) {
          startIndexRender = 0
          endIndexRender = messagesData.length
        } else {
          if (authUnreadMessages.length <= UNREAD_MESSAGES_TO_RENDER) {
            startIndexRender = Math.max(messagesData.length - MESSAGES_TO_RENDER, 0)
            endIndexRender = messagesData.length
          } else {
            endIndexRender = messagesData.length - (authUnreadMessages.length! - UNREAD_MESSAGES_TO_RENDER)
            startIndexRender = Math.max(endIndexRender - MESSAGES_TO_RENDER, 0)
          }
        }

        contactsDispatch({
          type: "setInitialMessages",
          payload: {
            messagesData,
            startIndex: startIndexRender,
            endIndex: endIndexRender,
            chatKey
          }
        })
        setLoading(false)
      }

      messagesRef
        .orderByChild("timeStamp")
        .startAfter(lastMessageTimeStamp)
        .on("child_added", (snapshot: { val: () => MessageInterface; key: string }) => {
          const newMessage = { ...snapshot.val(), key: snapshot.key }
          console.log({ newMessage })
          contactsDispatch({ type: "addNewMessage", payload: { newMessage, chatKey, authUser } })
        })

      messagesRef
        .orderByChild("timeStamp")
        .startAt(firstMessageTimeStamp)
        .on("child_changed", (snapshot: { val: () => MessageInterface; key: string }) => {
          const editedMessage = { ...snapshot.val(), key: snapshot.key }
          contactsDispatch({ type: "editMessage", payload: { editedMessage, chatKey } })
        })

      messagesRef
        .orderByChild("timeStamp")
        .startAt(firstMessageTimeStamp)
        .on("child_removed", (snapshot: { val: () => MessageInterface; key: string }) => {
          const removedMessage = { ...snapshot.val(), key: snapshot.key }
          messagesToDelete.current.push(removedMessage)
          removeMessagesDebounce(messagesToDelete.current)
        })
    }

    getMessages()
  }, [chatKey, messagesRef, loading]) // eslint-disable-line react-hooks/exhaustive-deps
}

export default useGetInitialMessages
