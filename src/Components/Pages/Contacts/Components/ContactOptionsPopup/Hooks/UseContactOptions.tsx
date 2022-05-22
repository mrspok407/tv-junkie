import { ContactInfoInterface } from 'Components/Pages/Contacts/@Types'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'

type Props = {
  contactInfo?: ContactInfoInterface
}

const useContactOptions = ({ contactInfo }: Props) => {
  const { firebase, authUser, errors, contactsState, contactsDispatch } = useFrequentVariables()
  const { activeChat, chatParticipants } = contactsState

  const updateIsPinned = async () => {
    contactsDispatch({ type: 'closePopups', payload: '' })

    try {
      const timeStamp = new Date().getTime()
      const isPinned = !(contactInfo?.pinned_lastActivityTS?.slice(0, 4) === 'true')
      await firebase.contact({ authUid: authUser?.uid, contactUid: contactInfo?.key! }).update({
        pinned_lastActivityTS: `${isPinned}_${timeStamp}`,
      })
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: 'There has been some error updating database. Please try again.',
      })

      throw new Error(`There has been some error updating database: ${error}`)
    }
  }

  const handleMarkRead = async () => {
    contactsDispatch({ type: 'closePopups', payload: '' })

    try {
      let updateData = {}
      if (contactInfo?.isGroupChat) {
        updateData = {
          [`groupChats/${contactInfo?.chatKey}/members/unreadMessages/${authUser?.uid}`]: null,
          [`users/${authUser?.uid}/contactsDatabase/newContactsActivity/${contactInfo?.key}`]: null,
          [`users/${authUser?.uid}/contactsDatabase/newContactsRequests/${contactInfo?.key}`]: null,
        }
      } else {
        updateData = {
          [`privateChats/${contactInfo?.chatKey}/members/${authUser?.uid}/unreadMessages`]: null,
          [`users/${authUser?.uid}/contactsDatabase/newContactsActivity/${contactInfo?.key}`]: null,
          [`users/${authUser?.uid}/contactsDatabase/newContactsRequests/${contactInfo?.key}`]: null,
        }
      }
      await firebase.database().ref().update(updateData)
      contactsDispatch({
        type: 'updateAuthUserUnreadMessages',
        payload: { chatKey: contactInfo?.chatKey!, unreadMessages: [], markAsRead: true },
      })
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: 'There has been some error updating database. Please try again.',
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
        [`users/${authUser?.uid}/contactsDatabase/contactsLastActivity/${contactInfo.key}`]: null,
      }
      if (!contactInfo.removedFromGroup && !contactInfo.chatDeleted) {
        updateData[`groupChats/${contactInfo.chatKey}/members/participants/${authUser?.uid}`] = null
        updateData[`groupChats/${contactInfo.chatKey}/members/status/${authUser?.uid}`] = null
        updateData[`groupChats/${contactInfo.chatKey}/members/unreadMessages/${authUser?.uid}`] = null
        updateData[`groupChats/${contactInfo.chatKey}/messages/${newMessageRef.key}`] = {
          leftMember: {
            key: authUser?.uid,
            userName: authUser?.username,
          },
          timeStamp,
          isMemberLeft: true,
        }
      }
      await firebase
        .database()
        .ref()
        .update(updateData, () => contactsDispatch({
            type: 'updateActiveChat',
            payload: {
              chatKey: activeChat.chatKey === contactInfo.chatKey ? '' : activeChat.chatKey,
              contactKey: activeChat.contactKey === contactInfo.key ? '' : activeChat.contactKey,
            },
          }))
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: 'There has been some error updating database. Please try again.',
      })

      throw new Error(`There has been some error updating database: ${error}`)
    }
  }

  const handleDeleteChat = async ({ contactInfo }: { contactInfo: ContactInfoInterface }) => {
    const timeStamp = firebase.timeStamp()
    const chatParticipantsData = chatParticipants[contactInfo.chatKey]
    try {
      const updateData: any = {
        [`users/${authUser?.uid}/contactsDatabase/contactsList/${contactInfo.chatKey}`]: null,
        [`users/${authUser?.uid}/contactsDatabase/newContactsRequests/${contactInfo.chatKey}`]: null,
        [`users/${authUser?.uid}/contactsDatabase/newContactsActivity/${contactInfo.chatKey}`]: null,
        [`users/${authUser?.uid}/contactsDatabase/contactsLastActivity/${contactInfo.chatKey}`]: null,
      }
      chatParticipantsData.forEach((participantKey) => {
        if (participantKey === authUser?.uid) return
        updateData[`users/${participantKey}/contactsDatabase/contactsList/${contactInfo.chatKey}/chatDeleted`] = true
        updateData[`users/${participantKey}/contactsDatabase/newContactsRequests/${contactInfo.chatKey}`] = null
        updateData[`users/${participantKey}/contactsDatabase/newContactsActivity/${contactInfo.chatKey}`] = true
        updateData[`users/${participantKey}/contactsDatabase/contactsLastActivity/${contactInfo.chatKey}`] = timeStamp
      })
      updateData[`groupChats/${contactInfo.chatKey}`] = null

      await firebase
        .database()
        .ref()
        .update(updateData, () => contactsDispatch({
            type: 'updateActiveChat',
            payload: {
              chatKey: activeChat.chatKey === contactInfo.chatKey ? '' : activeChat.chatKey,
              contactKey: activeChat.contactKey === contactInfo.key ? '' : activeChat.contactKey,
            },
          }))
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: 'There has been some error updating database. Please try again.',
      })

      throw new Error(`There has been some error updating database: ${error}`)
    }
  }

  const handleRemoveContact = async ({ contactInfo }: { contactInfo: ContactInfoInterface }) => {
    const timeStamp = new Date().getTime()
    const newMessageRef = firebase.privateChats().child('messages').push()
    try {
      let updateData: any = {
        [`users/${authUser?.uid}/contactsDatabase/contactsList/${contactInfo.key}`]: null,
        [`users/${authUser?.uid}/contactsDatabase/newContactsRequests/${contactInfo.key}`]: null,
        [`users/${authUser?.uid}/contactsDatabase/newContactsActivity/${contactInfo.key}`]: null,
        [`users/${authUser?.uid}/contactsDatabase/contactsLastActivity/${contactInfo.key}`]: null,
      }

      if (['removed', 'rejected', false].includes(contactInfo.status as string)) {
        updateData = {
          ...updateData,
          [`users/${contactInfo.key}/contactsDatabase/contactsList/${authUser?.uid}`]: null,
          [`users/${contactInfo.key}/contactsDatabase/newContactsRequests/${authUser?.uid}`]: null,
          [`users/${contactInfo.key}/contactsDatabase/newContactsActivity/${authUser?.uid}`]: null,
          [`users/${contactInfo.key}/contactsDatabase/contactsLastActivity/${authUser?.uid}`]: null,
        }
      }
      if (contactInfo.status === true) {
        updateData = {
          ...updateData,
          [`users/${contactInfo.key}/contactsDatabase/contactsList/${authUser?.uid}/status`]: 'removed',
          [`users/${contactInfo.key}/contactsDatabase/contactsList/${authUser?.uid}/receiver`]: null,
          [`users/${contactInfo.key}/contactsDatabase/newContactsActivity/${authUser?.uid}`]: true,
          [`users/${contactInfo.key}/contactsDatabase/newContactsRequests/${authUser?.uid}`]: null,
          [`users/${contactInfo.key}/contactsDatabase/contactsLastActivity/${authUser?.uid}`]: timeStamp,
          [`privateChats/${contactInfo.chatKey}/messages/${newMessageRef.key}`]: {
            sender: authUser?.uid,
            isRemovedFromContacts: true,
            timeStamp,
          },
        }
      }

      await firebase
        .database()
        .ref()
        .update(updateData, () => {
          contactsDispatch({
            type: 'removeContactCleanUp',
            payload: {
              chatKey: contactInfo.chatKey,
              contactKey: contactInfo.key,
            },
          })
        })
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: 'There has been some error updating database. Please try again.',
      })

      throw new Error(`There has been some error updating database: ${error}`)
    }
  }

  const handleClearHistory = async ({ contactInfo }: { contactInfo: ContactInfoInterface }) => {
    if (contactInfo.status !== true) return
    try {
      const updateData = {
        [`privateChats/${contactInfo.chatKey}/messages`]: null,
        [`privateChats/${contactInfo.chatKey}/historyDeleted`]: true,
        [`privateChats/${contactInfo.chatKey}/members/${contactInfo.key}/unreadMessages`]: null,
        [`privateChats/${contactInfo.chatKey}/members/${authUser?.uid}/unreadMessages`]: null,
        [`users/${authUser?.uid}/contactsDatabase/newContactsRequests/${contactInfo.key}`]: null,
        [`users/${authUser?.uid}/contactsDatabase/newContactsActivity/${contactInfo.key}`]: null,
        [`users/${contactInfo.key}/contactsDatabase/newContactsRequests/${authUser?.uid}`]: null,
        [`users/${contactInfo.key}/contactsDatabase/newContactsActivity/${authUser?.uid}`]: null,
      }
      contactsDispatch({ type: 'removeAllMessages', payload: { chatKey: contactInfo.chatKey } })
      await firebase.database().ref().update(updateData)
    } catch (error) {
      errors.handleError({
        errorData: error,
        message:
          'There has been some error deleting chat history, it may not work. Please reload the page and try again.',
      })

      throw new Error(`There has been some error updating database: ${error}`)
    }
  }

  return {
    updateIsPinned,
    handleMarkRead,
    handleRemoveContact,
    handleLeaveChat,
    handleClearHistory,
    handleDeleteChat,
  }
}

export default useContactOptions
