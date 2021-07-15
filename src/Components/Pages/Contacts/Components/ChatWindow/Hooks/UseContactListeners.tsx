import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import { useState, useEffect } from "react"

const useContactListeners = () => {
  const { firebase, contactsState, contactsDispatch } = useFrequentVariables()
  const { activeChat, firebaseListeners } = contactsState
  const isUnreadMessagesListenerOn = firebaseListeners.contactUnreadMessages[activeChat.chatKey]

  const [contactLastActivity, setContactLastActivity] = useState<{ timeStamp: number; key: string }>()

  useEffect(() => {
    if (isUnreadMessagesListenerOn) return
    firebase
      .unreadMessages({ uid: activeChat.contactKey, chatKey: activeChat.chatKey, isGroupChat: false })
      .on("value", (snapshot: any) => {
        const unreadMessagesContact = !snapshot.val() ? [] : Object.keys(snapshot.val())
        contactsDispatch({
          type: "updateContactUnreadMessages",
          payload: {
            unreadMessages: unreadMessagesContact,
            chatKey: activeChat.chatKey
          }
        })
      })
  }, [activeChat, firebase, contactsDispatch, isUnreadMessagesListenerOn])

  useEffect(() => {
    firebase
      .contactsDatabase({ uid: activeChat.contactKey })
      .child("pageIsOpen")
      .on("value", (snapshot: any) => {
        contactsDispatch({
          type: "updateContactsPageIsOpen",
          payload: { isPageOpen: snapshot.val(), chatKey: activeChat.chatKey }
        })
      })

    firebase
      .contactsLastActivity({ uid: activeChat.contactKey })
      .orderByValue()
      .limitToLast(1)
      .on("value", (snapshot: any) => {
        let lastActivityData: { timeStamp: number; key: string }[] = []
        snapshot.forEach((snapshot: { val: () => number; key: string }) => {
          lastActivityData.push({ timeStamp: snapshot.val(), key: snapshot.key })
        })
        setContactLastActivity(lastActivityData[0])
      })

    return () => {
      firebase.contactsDatabase({ uid: activeChat.contactKey }).child("pageIsOpen").off()
      firebase.contactsLastActivity({ uid: activeChat.contactKey }).off()
    }
  }, [activeChat, firebase, contactsDispatch])
  return { contactLastActivity }
}

export default useContactListeners
