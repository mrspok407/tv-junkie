/* eslint-disable @typescript-eslint/no-extra-semi */
import { useState, useEffect, useRef, useCallback, useContext } from 'react'
import { MessageInterface } from 'Components/Pages/Contacts/@Types'
import debounce from 'debounce'
import { ErrorsHandlerContext } from 'Components/AppContext/Contexts/ErrorsContext'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { setMessagesSnapshot } from './setMessagesSnapshot'
import { MESSAGES_TO_RENDER, UNREAD_MESSAGES_TO_RENDER } from '../../@Context/Constants'

const useGetInitialMessages = ({ chatKey, isGroupChat }: { chatKey: string; isGroupChat: boolean }) => {
  const { firebase, authUser, contactsState, contactsDispatch } = useFrequentVariables()
  const handleError = useContext(ErrorsHandlerContext)
  const { messages } = contactsState
  const messagesData = messages[chatKey]

  const [loading, setLoading] = useState(false)
  const messagesRef = firebase.messages({ chatKey, isGroupChat })

  const messagesToDelete = useRef<MessageInterface[]>([])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const removeMessagesDebounce = useCallback(
    debounce((removedMessages: any) => {
      contactsDispatch({ type: 'removeMessages', payload: { removedMessages, chatKey } })
      messagesToDelete.current = []
    }, 0),
    [chatKey],
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
          firebase,
        })

        firstUnreadMessageKey =
          firstUnreadMessageKey.val() === null ? false : Object.keys(firstUnreadMessageKey.val()!)[0]
      } catch (error) {
        handleError({
          errorData: { message: 'There were a problem loading messages. Please try to reload the page.' },
          message: 'There were a problem loading messages. Please try to reload the page.',
        })
        contactsDispatch({ type: 'setInitialMessages', payload: { messagesData: [], chatKey } })
        setLoading(false)
        throw new Error('There were a problem loading messages. Please try to reload the page.')
      }

      if (messagesSnapshot.val() === null) {
        contactsDispatch({ type: 'setInitialMessages', payload: { messagesData: [], chatKey } })
        setLoading(false)
      }

      let firstMessageTimeStamp = 0
      let lastMessageTimeStamp = 0

      if (messagesSnapshot.val() !== null) {
        const messagesData: MessageInterface[] = []
        messagesSnapshot.forEach((message: any) => {
          messagesData.push({ ...message.val(), key: message.key })
        })

        const indexFirstUnreadMessage = messagesData.findIndex((message) => message.key === firstUnreadMessageKey)
        const authUnreadMessages =
          indexFirstUnreadMessage === -1 ? [] : [...messagesData].slice(indexFirstUnreadMessage)

        firstMessageTimeStamp = messagesData[0].timeStamp
        lastMessageTimeStamp = messagesData[messagesData.length - 1].timeStamp

        let startIndexRender = 0
        let endIndexRender = 0

        if (messagesData.length <= MESSAGES_TO_RENDER) {
          startIndexRender = 0
          endIndexRender = messagesData.length
        } else if (authUnreadMessages.length <= UNREAD_MESSAGES_TO_RENDER) {
          startIndexRender = Math.max(messagesData.length - MESSAGES_TO_RENDER, 0)
          endIndexRender = messagesData.length
        } else {
          endIndexRender = messagesData.length - (authUnreadMessages.length! - UNREAD_MESSAGES_TO_RENDER)
          startIndexRender = Math.max(endIndexRender - MESSAGES_TO_RENDER, 0)
        }

        contactsDispatch({
          type: 'setInitialMessages',
          payload: {
            messagesData,
            startIndex: startIndexRender,
            endIndex: endIndexRender,
            chatKey,
          },
        })
        setLoading(false)
      }

      messagesRef
        .orderByChild('timeStamp')
        .startAfter(lastMessageTimeStamp)
        .on('child_added', (snapshot: { val: () => MessageInterface; key: string }) => {
          const newMessage = { ...snapshot.val(), key: snapshot.key }
          contactsDispatch({ type: 'addNewMessage', payload: { newMessage, chatKey, authUser } })
        })

      messagesRef
        .orderByChild('timeStamp')
        .startAt(firstMessageTimeStamp)
        .on('child_changed', (snapshot: { val: () => MessageInterface; key: string }) => {
          const editedMessage = { ...snapshot.val(), key: snapshot.key }
          contactsDispatch({ type: 'editMessage', payload: { editedMessage, chatKey } })
        })

      messagesRef
        .orderByChild('timeStamp')
        .startAt(firstMessageTimeStamp)
        .on('child_removed', (snapshot: { val: () => MessageInterface; key: string }) => {
          const removedMessage = { ...snapshot.val(), key: snapshot.key }
          messagesToDelete.current.push(removedMessage)
          removeMessagesDebounce(messagesToDelete.current)
        })
    }

    getMessages()
  }, [chatKey, messagesRef, loading]) // eslint-disable-line react-hooks/exhaustive-deps
}

export default useGetInitialMessages
