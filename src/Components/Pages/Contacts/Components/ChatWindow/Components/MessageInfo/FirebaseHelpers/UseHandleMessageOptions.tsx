import { MessageInterface } from 'Components/Pages/Contacts/@Types'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import striptags from 'striptags'
import { MESSAGE_LINE_HEIGHT } from '../../../../@Context/Constants'

type Props = {
  messageData?: MessageInterface
}

const useHandleMessageOptions = ({ messageData }: Props) => {
  const { firebase, authUser, errors, contactsState, contactsDispatch } = useFrequentVariables()
  const { activeChat, messages, contacts, chatMembersStatus, contactsUnreadMessages } = contactsState
  const contactInfo = contacts[activeChat.contactKey]
  const contactsUnreadMessagesData = contactsUnreadMessages[activeChat.chatKey]
  const chatMembersStatusData = chatMembersStatus[activeChat.chatKey]
  const messagesData = messages[activeChat.chatKey]

  const selectMessage = async () => {
    if ((contactInfo.status !== undefined && contactInfo.status !== true) || contactInfo.removedFromGroup) return
    contactsDispatch({
      type: 'updateSelectedMessages',
      payload: { messageKey: messageData?.key!, chatKey: activeChat.chatKey },
    })
  }

  const deleteMessageGroupChat = async ({ deleteMessagesKeys }: { deleteMessagesKeys: string[] }) => {
    if (contactInfo.removedFromGroup) return

    contactsDispatch({ type: 'updateMsgDeletionProcessLoading', payload: { messageDeletionProcess: true } })
    const deletedMessagesData = messagesData.reduce((deletedMessagesData: MessageInterface[], message) => {
      if (deleteMessagesKeys.includes(message.key)) {
        deletedMessagesData.push(message)
      }
      return deletedMessagesData
    }, [])

    const failedDeliverMessages = deletedMessagesData.filter((message) => message.isDelivered === false)
    const successDeliverMessages = deletedMessagesData.filter((message) => message.isDelivered !== false)

    if (failedDeliverMessages.length) {
      contactsDispatch({
        type: 'removeMessages',
        payload: { removedMessages: failedDeliverMessages, chatKey: activeChat.chatKey },
      })
    }

    try {
      const updateData: { [key: string]: any } = {}

      successDeliverMessages.forEach((messageData) => {
        updateData[`groupChats/${activeChat.chatKey}/messages/${messageData.key}`] = null
        chatMembersStatusData.forEach((member) => {
          updateData[`groupChats/${activeChat.chatKey}/members/unreadMessages/${member.key}/${messageData.key}`] = null
        })
      })

      await firebase.rootRef().update(updateData)
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: 'Message hasn&apos;t been deleted, because of the unexpected error.',
      })
      throw new Error(`There has been some error updating database: ${error}`)
    } finally {
      contactsDispatch({
        type: 'updateMsgDeletionProcess',
        payload: { messageDeletionProcess: false, deletedMessages: deletedMessagesData },
      })
    }
  }

  const deleteMessagePrivateChat = async ({ deleteMessagesKeys }: { deleteMessagesKeys: string[] }) => {
    if (contactInfo.status !== true) return
    contactsDispatch({ type: 'updateMsgDeletionProcessLoading', payload: { messageDeletionProcess: true } })

    const deletedMessagesData = messagesData.reduce((deletedMessagesData: MessageInterface[], message) => {
      if (deleteMessagesKeys.includes(message.key)) {
        deletedMessagesData.push(message)
      }
      return deletedMessagesData
    }, [])

    const failedDeliverMessages = deletedMessagesData.filter((message) => message.isDelivered === false)
    const successDeliverMessages = deletedMessagesData.filter((message) => message.isDelivered !== false)

    if (failedDeliverMessages.length) {
      contactsDispatch({
        type: 'removeMessages',
        payload: { removedMessages: failedDeliverMessages, chatKey: activeChat.chatKey },
      })
    }

    try {
      const updateData: { [key: string]: any } = {}
      const unreadMsgsDataAfterDeletion = contactsUnreadMessagesData.filter(
        (message) => !deleteMessagesKeys.includes(message),
      )

      const lastUnreadMsgAfterDeletion = messagesData.find(
        (message) => message.key === unreadMsgsDataAfterDeletion[unreadMsgsDataAfterDeletion.length - 1],
      )

      const lastUnreadMsgBeforeDeletion = contactsUnreadMessagesData[contactsUnreadMessagesData.length - 1]
      const lastReadMessage = messagesData[Math.max(messagesData.length - 1 - contactsUnreadMessagesData.length, 0)]

      successDeliverMessages.forEach((messageData) => {
        updateData[`privateChats/${activeChat.chatKey}/messages/${messageData.key}`] = null
        updateData[
          `privateChats/${activeChat.chatKey}/members/${activeChat.contactKey}/unreadMessages/${messageData.key}`
        ] = null
      })

      if (lastUnreadMsgAfterDeletion && lastUnreadMsgBeforeDeletion !== lastUnreadMsgAfterDeletion.key) {
        updateData[`users/${activeChat.contactKey}/contactsDatabase/contactsLastActivity/${authUser?.uid}`] =
          lastUnreadMsgAfterDeletion?.timeStamp
      }
      if (!unreadMsgsDataAfterDeletion.length) {
        updateData[`users/${activeChat.contactKey}/contactsDatabase/contactsLastActivity/${authUser?.uid}`] =
          lastReadMessage?.timeStamp
      }

      await firebase.rootRef().update(updateData)
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: 'Message hasn&apos;t been deleted, because of the unexpected error.',
      })
      throw new Error(`There has been some error updating database: ${error}`)
    } finally {
      contactsDispatch({
        type: 'updateMsgDeletionProcess',
        payload: { messageDeletionProcess: false, deletedMessages: deletedMessagesData },
      })
    }
  }

  const editMessage = async () => {
    if ((!contactInfo.isGroupChat && contactInfo.status !== true) || contactInfo.removedFromGroup) return
    const inputRef = document.querySelector('.chat-window__input-message') as HTMLElement
    const chatContainerRef = document.querySelector('.chat-window__messages-list-container') as HTMLElement
    const message = messagesData.find((message) => message.key === messageData?.key)

    inputRef.innerHTML = striptags(message?.message!)
    const inputHeight = inputRef?.getBoundingClientRect().height

    inputRef.focus()
    chatContainerRef.scrollTop = chatContainerRef?.scrollTop! + (inputHeight - MESSAGE_LINE_HEIGHT)!

    contactsDispatch({
      type: 'updateMessageInput',
      payload: { message: message?.message!, editingMsgKey: messageData?.key },
    })
  }

  return { selectMessage, deleteMessagePrivateChat, deleteMessageGroupChat, editMessage }
}

export default useHandleMessageOptions
