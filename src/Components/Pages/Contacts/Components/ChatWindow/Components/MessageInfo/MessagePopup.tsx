import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { MessageInterface } from "Components/Pages/Contacts/@Types"
import React, { useEffect, useContext } from "react"
import { ContactsContext } from "../../../@Context/ContactsContext"

type Props = {
  messageOptionsRef: HTMLDivElement
  messageData: MessageInterface
  contactUnreadMessages: string[] | null
}

const MessagePopup: React.FC<Props> = ({ messageOptionsRef, messageData, contactUnreadMessages }) => {
  const { authUser, errors } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)
  const { activeChat, messages } = context?.state!
  const messagesData = messages[activeChat.chatKey]

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as EventListener)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as EventListener)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClickOutside = (e: CustomEvent) => {
    if (!messageOptionsRef?.contains(e.target as Node)) {
      context?.dispatch({ type: "updateMessagePopup", payload: "" })
    }
  }

  const deleteMessage = async () => {
    try {
      let updateData = {}
      const senderKey = messageData.sender
      const recipientKey = senderKey === activeChat.contactKey ? authUser?.uid : activeChat.contactKey
      const unreadMessage = contactUnreadMessages?.includes(messageData.key)
      if (!unreadMessage) {
        return await firebase.message({ chatKey: activeChat.chatKey, messageKey: messageData.key }).set(null)
      }
      if (contactUnreadMessages === null) return
      if (contactUnreadMessages[contactUnreadMessages.length - 1] !== messageData.key) {
        updateData = {
          [`privateChats/${activeChat.chatKey}/members/${recipientKey}/unreadMessages/${messageData.key}`]: null,
          [`privateChats/${activeChat.chatKey}/messages/${messageData.key}`]: null
        }
        return await firebase.database().ref().update(updateData)
      }

      let previousMessage: MessageInterface
      if (contactUnreadMessages?.length === 1) {
        previousMessage = messageData
      } else {
        const previousMessageKey = contactUnreadMessages[contactUnreadMessages.length - 2]
        previousMessage = messagesData.find((message) => message.key === previousMessageKey)!
      }

      updateData = {
        [`users/${recipientKey}/contactsDatabase/contactsLastActivity/${senderKey}`]: previousMessage.timeStamp,
        [`privateChats/${activeChat.chatKey}/members/${recipientKey}/unreadMessages/${messageData.key}`]: null,
        [`privateChats/${activeChat.chatKey}/messages/${messageData.key}`]: null
      }

      await firebase.database().ref().update(updateData)
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: "Message hasn't been deleted, because of the unexpected error."
      })
      throw new Error(`There has been some error updating database: ${error}`)
    }
  }

  return (
    <div className="popup-container">
      <div className="popup__option">
        <button className="popup__option-btn" type="button">
          Edit
        </button>
      </div>
      <div className="popup__option">
        <button className="popup__option-btn" type="button" onClick={() => deleteMessage()}>
          Delete
        </button>
      </div>
    </div>
  )
}

export default MessagePopup
