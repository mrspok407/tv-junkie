import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { MessageInterface } from "Components/Pages/Contacts/@Types"
import React, { useState, useEffect, useContext } from "react"
import { MESSAGE_LINE_HEIGHT } from "../../../../@Context/Constants"
import { ContactsContext } from "../../../../@Context/ContactsContext"

type Props = {
  messageData?: MessageInterface
}

const useHandleMessageOptions = ({ messageData }: Props) => {
  const firebase = useContext(FirebaseContext)
  const { authUser, errors } = useContext(AppContext)
  const context = useContext(ContactsContext)
  const { activeChat, messages, contactsStatus, contactsUnreadMessages } = context?.state!
  const contactsUnreadMessagesData = contactsUnreadMessages[activeChat.chatKey]
  const contactsStatusData = contactsStatus[activeChat.chatKey]
  const messagesData = messages[activeChat.chatKey]

  const selectMessage = async () => {
    context?.dispatch({
      type: "updateSelectedMessages",
      payload: { messageKey: messageData?.key!, chatKey: activeChat.chatKey }
    })
  }

  const deleteMessage = async ({ deleteMessagesKeys }: { deleteMessagesKeys: string[] }) => {
    console.log({ deleteMessagesKeys })

    const deletedMessagesData = messagesData.reduce((deletedMessagesData: MessageInterface[], message) => {
      if (deleteMessagesKeys.includes(message.key)) {
        deletedMessagesData.push(message)
      }
      return deletedMessagesData
    }, [])
    const failedDeliverMessages = deletedMessagesData.filter((message) => message.isDelivered === false)
    const successDeliverMessages = deletedMessagesData.filter((message) => message.isDelivered !== false)

    if (failedDeliverMessages.length) {
      context?.dispatch({
        type: "removeMessages",
        payload: { removedMessages: failedDeliverMessages, chatKey: activeChat.chatKey }
      })
    }

    try {
      let updateData: { [key: string]: any } = {}
      const unreadMsgsDataAfterDeletion = contactsUnreadMessagesData.filter(
        (message) => !deleteMessagesKeys.includes(message)
      )
      const lastUnreadMsgAfterDeletion = messagesData.find(
        (message) => message.key === unreadMsgsDataAfterDeletion[unreadMsgsDataAfterDeletion.length - 1]
      )
      const lastUnreadMsgBeforeDeletion = contactsUnreadMessagesData[contactsUnreadMessagesData.length - 1]

      successDeliverMessages.forEach((messageData) => {
        // const senderKey = messageData.sender
        // const recipientKey = senderKey === activeChat.contactKey ? authUser?.uid : activeChat.contactKey
        const unreadMessage = contactsUnreadMessagesData?.includes(messageData.key)
        if (!unreadMessage) {
          updateData[`privateChats/${activeChat.chatKey}/messages/${messageData.key}`] = null
        } else {
          updateData[`privateChats/${activeChat.chatKey}/messages/${messageData.key}`] = null
          updateData[
            `privateChats/${activeChat.chatKey}/members/${activeChat.contactKey}/unreadMessages/${messageData.key}`
          ] = null
        }
      })

      if (lastUnreadMsgAfterDeletion && lastUnreadMsgBeforeDeletion !== lastUnreadMsgAfterDeletion.key) {
        updateData[`users/${activeChat.contactKey}/contactsDatabase/contactsLastActivity/${authUser?.uid}`] =
          lastUnreadMsgAfterDeletion.timeStamp
      }

      console.log({ updateData })

      await firebase.database().ref().update(updateData)

      // const senderKey = messageData.sender
      // const recipientKey = senderKey === activeChat.contactKey ? authUser?.uid : activeChat.contactKey
      // const unreadMessage = contactsUnreadMessagesData?.includes(messageData.key)
      // if (!unreadMessage) {
      //   return await firebase.message({ chatKey: activeChat.chatKey, messageKey: messageData.key }).set(null)
      // }
      // // if (contactsUnreadMessagesData === null) return
      // if (contactsUnreadMessagesData[contactsUnreadMessagesData.length - 1] !== messageData.key) {
      //   updateData = {
      //     [`privateChats/${activeChat.chatKey}/members/${recipientKey}/unreadMessages/${messageData.key}`]: null,
      //     [`privateChats/${activeChat.chatKey}/messages/${messageData.key}`]: null
      //   }
      //   return await firebase.database().ref().update(updateData)
      // }

      // let previousMessage: MessageInterface
      // if (contactsUnreadMessagesData?.length === 1) {
      //   previousMessage = messageData
      // } else {
      //   const previousMessageKey = contactsUnreadMessagesData[contactsUnreadMessagesData.length - 2]
      //   previousMessage = messagesData.find((message) => message.key === previousMessageKey)!
      // }

      // updateData = {
      //   [`users/${recipientKey}/contactsDatabase/contactsLastActivity/${senderKey}`]: previousMessage.timeStamp,
      //   [`privateChats/${activeChat.chatKey}/members/${recipientKey}/unreadMessages/${messageData.key}`]: null,
      //   [`privateChats/${activeChat.chatKey}/messages/${messageData.key}`]: null
      // }

      // await firebase.database().ref().update(updateData)
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: "Message hasn't been deleted, because of the unexpected error."
      })
      throw new Error(`There has been some error updating database: ${error}`)
    }
  }

  const editMessage = async () => {
    const inputRef = document.querySelector(".chat-window__input-message") as HTMLElement
    const chatContainerRef = document.querySelector(".chat-window__messages-list-container") as HTMLElement
    const message = messagesData.find((message) => message.key === messageData?.key)

    inputRef.innerHTML = message?.message!
    const inputHeight = inputRef?.getBoundingClientRect().height

    inputRef.focus()
    chatContainerRef.scrollTop = chatContainerRef?.scrollTop! + (inputHeight - MESSAGE_LINE_HEIGHT)!

    context?.dispatch({
      type: "updateMessageInput",
      payload: { message: message?.message!, editingMsgKey: messageData?.key }
    })
  }

  return { selectMessage, deleteMessage, editMessage }
}

export default useHandleMessageOptions
