import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { ContactInfoInterface } from "Components/Pages/Contacts/@Types"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import React, { useState, useEffect, useContext } from "react"
import { ContactsContext } from "../../@Context/ContactsContext"

type Props = {
  contactInfo?: ContactInfoInterface
}

const useContactOptions = ({ contactInfo }: Props) => {
  const { firebase, authUser, errors, contactsContext, contactsState } = useFrequentVariables()
  const { activeChat, renderedMessagesList, contacts } = contactsState

  const updateIsPinned = async () => {
    contactsContext?.dispatch({ type: "closePopups", payload: "" })

    try {
      const timeStamp = new Date().getTime()
      const isPinned = !(contactInfo?.pinned_lastActivityTS?.slice(0, 4) === "true")
      await firebase.contact({ authUid: authUser?.uid, contactUid: contactInfo?.key! }).update({
        pinned_lastActivityTS: `${isPinned}_${timeStamp}`
      })
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: "There has been some error updating database. Please try again."
      })

      throw new Error(`There has been some error updating database: ${error}`)
    }
  }

  const handleMarkRead = async () => {
    contactsContext?.dispatch({ type: "closePopups", payload: "" })

    try {
      let updateData = {}
      if (contactInfo?.isGroupChat) {
        updateData = {
          [`groupChats/${contactInfo?.chatKey}/members/unreadMessages/${authUser?.uid}`]: null,
          [`users/${authUser?.uid}/contactsDatabase/newContactsActivity/${contactInfo?.key}`]: null,
          [`users/${authUser?.uid}/contactsDatabase/newContactsRequests/${contactInfo?.key}`]: null
        }
      } else {
        updateData = {
          [`privateChats/${contactInfo?.chatKey}/members/${authUser?.uid}/unreadMessages`]: null,
          [`users/${authUser?.uid}/contactsDatabase/newContactsActivity/${contactInfo?.key}`]: null,
          [`users/${authUser?.uid}/contactsDatabase/newContactsRequests/${contactInfo?.key}`]: null
        }
      }
      await firebase.database().ref().update(updateData)
      contactsContext?.dispatch({
        type: "updateAuthUserUnreadMessages",
        payload: { chatKey: activeChat.chatKey, unreadMessages: [] }
      })
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: "There has been some error updating database. Please try again."
      })

      throw new Error(`There has been some error updating database: ${error}`)
    }
  }

  const handleLeaveChat = async ({ contactInfo }: { contactInfo: ContactInfoInterface }) => {
    const timeStamp = firebase.timeStamp()
    const newMessageRef = firebase.messages({ chatKey: contactInfo.chatKey, isGroupChat: true }).push()
    try {
      const updateData: any = {
        [`users/${authUser?.uid}/contactsDatabase/contactsList/${contactInfo.key}`]: null,
        [`users/${authUser?.uid}/contactsDatabase/newContactsRequests/${contactInfo.key}`]: null,
        [`users/${authUser?.uid}/contactsDatabase/newContactsActivity/${contactInfo.key}`]: null,
        [`users/${authUser?.uid}/contactsDatabase/contactsLastActivity/${contactInfo.key}`]: null
      }
      if (!contactInfo.removedFromGroup) {
        updateData[`groupChats/${contactInfo.chatKey}/members/status/${authUser?.uid}`] = null
        updateData[`groupChats/${contactInfo.chatKey}/members/unreadMessages/${authUser?.uid}`] = null
        updateData[`groupChats/${contactInfo.chatKey}/messages/${newMessageRef.key}`] = {
          leftMember: {
            key: authUser?.uid,
            username: authUser?.username
          },
          timeStamp,
          isMemberLeft: true
        }
      }
      await firebase
        .database()
        .ref()
        .update(updateData, () =>
          contactsContext?.dispatch({
            type: "updateActiveChat",
            payload: {
              chatKey: activeChat.chatKey === contactInfo.chatKey ? "" : activeChat.chatKey,
              contactKey: activeChat.contactKey === contactInfo.key ? "" : activeChat.contactKey
            }
          })
        )
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: "There has been some error updating database. Please try again."
      })

      throw new Error(`There has been some error updating database: ${error}`)
    }
  }

  const handleRemoveContact = async ({ contactInfo }: { contactInfo: ContactInfoInterface }) => {
    const timeStamp = new Date().getTime()
    try {
      const updateData = {
        [`users/${authUser?.uid}/contactsDatabase/contactsList/${contactInfo.key}`]: null,
        [`users/${authUser?.uid}/contactsDatabase/newContactsRequests/${contactInfo.key}`]: null,
        [`users/${authUser?.uid}/contactsDatabase/newContactsActivity/${contactInfo.key}`]: null,
        [`users/${contactInfo.key}/contactsDatabase/contactsList/${authUser?.uid}/status`]: "rejected",
        [`users/${contactInfo.key}/contactsDatabase/newContactsActivity/${authUser?.uid}`]: true,
        [`users/${contactInfo.key}/contactsDatabase/contactsLastActivity/${authUser?.uid}`]: timeStamp
      }
      await firebase
        .database()
        .ref()
        .update(updateData, () =>
          contactsContext?.dispatch({
            type: "updateActiveChat",
            payload: {
              chatKey: activeChat.chatKey === contactInfo.chatKey ? "" : activeChat.chatKey,
              contactKey: activeChat.contactKey === contactInfo.key ? "" : activeChat.contactKey
            }
          })
        )
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: "There has been some error updating database. Please try again."
      })

      throw new Error(`There has been some error updating database: ${error}`)
    }
  }

  const handleClearHistory = async ({ contactInfo }: { contactInfo: ContactInfoInterface }) => {
    try {
      const updateData = {
        [`privateChats/${contactInfo.chatKey}/messages`]: null,
        [`privateChats/${contactInfo.chatKey}/historyDeleted`]: true,
        [`privateChats/${contactInfo.chatKey}/members/${contactInfo.key}/unreadMessages`]: null,
        [`privateChats/${contactInfo.chatKey}/members/${authUser?.uid}/unreadMessages`]: null,
        [`users/${authUser?.uid}/contactsDatabase/newContactsRequests/${contactInfo.key}`]: null,
        [`users/${authUser?.uid}/contactsDatabase/newContactsActivity/${contactInfo.key}`]: null,
        [`users/${contactInfo.key}/contactsDatabase/newContactsRequests/${authUser?.uid}`]: null,
        [`users/${contactInfo.key}/contactsDatabase/newContactsActivity/${authUser?.uid}`]: null
      }
      contactsContext?.dispatch({ type: "removeAllMessages", payload: { chatKey: contactInfo.chatKey } })
      await firebase.database().ref().update(updateData)
    } catch (error) {
      errors.handleError({
        errorData: error,
        message:
          "There has been some error deleting chat history, it may not work. Please reload the page and try again."
      })

      throw new Error(`There has been some error updating database: ${error}`)
    }
  }

  return {
    updateIsPinned,
    handleMarkRead,
    handleRemoveContact,
    handleLeaveChat,
    handleClearHistory
  }
}

export default useContactOptions
