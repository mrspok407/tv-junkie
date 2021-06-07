import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { MessageInterface } from "Components/Pages/Contacts/@Types"
import React, { useState, useEffect, useContext } from "react"
import striptags from "striptags"
import { ContactsContext } from "../../../../@Context/ContactsContext"
import useContactListeners from "../../../Hooks/UseContactListeners"

const useHandleMessage = () => {
  const firebase = useContext(FirebaseContext)
  const { authUser } = useContext(AppContext)
  const context = useContext(ContactsContext)
  const { activeChat, contactsStatus, contacts } = context?.state!
  const contactStatusData = contactsStatus[activeChat.chatKey]
  const contactsData = Object.values(contacts || {})

  const { contactLastActivity } = useContactListeners()

  const sendMessage = async ({ message }: { message: string }) => {
    const firstUnpinnedContactIndex = contactsData.findIndex(
      (contact) => contact.pinned_lastActivityTS.slice(0, 4) !== "true"
    )
    const activeContactIndex = contactsData.findIndex((contact) => contact.key === activeChat.contactKey)
    const updateContactLastActivityInAuth = Math.max(firstUnpinnedContactIndex, 0) < activeContactIndex
    const updateAuthLastActivityInContact = contactLastActivity?.key !== authUser?.uid

    console.log({ contactLastActivity })

    const timeStampEpoch = new Date().getTime()
    const messageRef = firebase.privateChats().child(`${activeChat.chatKey}/messages`).push()
    const messageKey = messageRef.key
    const updateData: any = {
      [`privateChats/${activeChat.chatKey}/messages/${messageKey}`]: {
        sender: authUser?.uid,
        message,
        timeStamp: timeStampEpoch
      },
      [`privateChats/${activeChat.chatKey}/members/${activeChat.contactKey}/unreadMessages/${messageKey}`]:
        !contactStatusData?.isOnline || !contactStatusData?.chatBottom || !contactStatusData?.pageInFocus ? true : null,
      [`privateChats/${activeChat.chatKey}/members/${authUser?.uid}/status/isTyping`]: null
    }
    if (updateContactLastActivityInAuth) {
      updateData[`users/${authUser?.uid}/contactsDatabase/contactsLastActivity/${activeChat.contactKey}`] =
        timeStampEpoch
    }
    if (updateAuthLastActivityInContact) {
      updateData[`users/${activeChat.contactKey}/contactsDatabase/contactsLastActivity/${authUser?.uid}`] =
        timeStampEpoch
    }
    await firebase.database().ref().update(updateData)

    return messageKey
  }

  const editMessage = async ({ message, originalMessage }: { message: string; originalMessage: MessageInterface }) => {
    if (originalMessage.message === message) return
    const updateData = {
      [`messages/${originalMessage.key}`]: {
        sender: originalMessage.sender,
        timeStamp: originalMessage.timeStamp,
        message,
        isEdited: true
      },
      [`members/${authUser?.uid}/status/isTyping`]: null
    }
    return await firebase.privateChats().child(activeChat.chatKey).update(updateData)
  }

  return { sendMessage, editMessage }
}

export default useHandleMessage
