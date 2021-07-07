import { MessageInterface } from "Components/Pages/Contacts/@Types"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"

const useHandleMessage = ({ contactLastActivity }: { contactLastActivity: { timeStamp: number; key: string } }) => {
  const { firebase, authUser, contactsState, contactsDispatch } = useFrequentVariables()
  const { activeChat, contactsStatus, contacts, chatMembersStatus } = contactsState
  const contactStatusData = contactsStatus[activeChat.chatKey]
  const chatMembersStatusData = chatMembersStatus[activeChat.chatKey]
  const contactsData = Object.values(contacts || {})

  const sendMessageGroupChat = async ({ message }: { message: string }) => {
    const firstUnpinnedContactIndex = contactsData.findIndex(
      (contact) => contact.pinned_lastActivityTS.slice(0, 4) !== "true"
    )
    const activeContactIndex = contactsData.findIndex((contact) => contact.key === activeChat.contactKey)
    const updateContactLastActivityInAuth = Math.max(firstUnpinnedContactIndex, 0) < activeContactIndex

    const timeStampEpoch = new Date().getTime()
    const messageRef = firebase.groupChats().child(`${activeChat.chatKey}/messages`).push()
    const messageKey = messageRef.key
    const updateData: any = {
      [`groupChats/${activeChat.chatKey}/messages/${messageKey}`]: {
        sender: authUser?.uid,
        username: authUser?.username,
        message,
        timeStamp: timeStampEpoch
      },
      [`groupChats/${activeChat.chatKey}/members/status/${authUser?.uid}/isTyping`]: null
    }
    if (updateContactLastActivityInAuth) {
      updateData[`users/${authUser?.uid}/contactsDatabase/contactsLastActivity/${activeChat.chatKey}`] = timeStampEpoch
    }
    chatMembersStatusData.forEach((member) => {
      if (member.key === authUser?.uid) return
      if (!member.isOnline || !member.chatBottom || !member.pageInFocus) {
        updateData[`groupChats/${activeChat.chatKey}/members/unreadMessages/${member.key}/${messageKey}`] = true
      }
    })

    contactsDispatch({ type: "updateRerenderUnreadMessagesStart", payload: { messageKey } })
    await firebase
      .database()
      .ref()
      .update(updateData, async () => {
        const membersLastActivity = await Promise.all(
          chatMembersStatusData.map(async (member) => {
            const lastActivityContactSnapshot = await firebase
              .contactsLastActivity({ uid: member.key })
              .orderByValue()
              .limitToLast(1)
              .once("value")
            let lastActivityMember: { timeStamp: number; memberKey: string; lastActivityContact: string }[] = []
            lastActivityContactSnapshot.forEach((snapshot: { val: () => number; key: string }) => {
              lastActivityMember.push({
                timeStamp: snapshot.val(),
                memberKey: member.key,
                lastActivityContact: snapshot.key
              })
            })
            return lastActivityMember[0]
          })
        )
        let updateData: any = {}
        membersLastActivity.forEach((member) => {
          if (member.lastActivityContact !== activeChat.chatKey) {
            updateData[`users/${member.memberKey}/contactsDatabase/contactsLastActivity/${activeChat.chatKey}`] =
              timeStampEpoch
          }
        })
        return firebase.database().ref().update(updateData)
      })

    return messageKey
  }

  const sendMessage = async ({ message }: { message: string }) => {
    const firstUnpinnedContactIndex = contactsData.findIndex(
      (contact) => contact.pinned_lastActivityTS.slice(0, 4) !== "true"
    )
    const activeContactIndex = contactsData.findIndex((contact) => contact.key === activeChat.contactKey)
    const updateContactLastActivityInAuth = Math.max(firstUnpinnedContactIndex, 0) < activeContactIndex
    const updateAuthLastActivityInContact = contactLastActivity?.key !== authUser?.uid

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

    contactsDispatch({ type: "updateRerenderUnreadMessagesStart", payload: { messageKey } })
    await firebase.database().ref().update(updateData)

    return messageKey
  }

  const editMessagePrivateChat = async ({
    message,
    originalMessage
  }: {
    message: string
    originalMessage: MessageInterface
  }) => {
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

  const editMessageGroupChat = async ({
    message,
    originalMessage
  }: {
    message: string
    originalMessage: MessageInterface
  }) => {
    if (originalMessage.message === message) return
    const updateData = {
      [`messages/${originalMessage.key}`]: {
        sender: originalMessage.sender,
        timeStamp: originalMessage.timeStamp,
        username: originalMessage.username,
        message,
        isEdited: true
      },
      [`members/status/${authUser?.uid}/isTyping`]: null
    }
    return await firebase.groupChats().child(activeChat.chatKey).update(updateData)
  }

  return { sendMessage, sendMessageGroupChat, editMessagePrivateChat, editMessageGroupChat }
}

export default useHandleMessage
