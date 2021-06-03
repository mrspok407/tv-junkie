import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import React, { useState, useEffect, useContext } from "react"
import { ContactsContext } from "../../@Context/ContactsContext"

const useContactListeners = () => {
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)
  const { authUser } = useContext(AppContext)
  const { activeChat, contactsUnreadMessages } = context?.state!

  const [contactLastActivity, setContactLastActivity] = useState<{ timeStamp: number; key: string }>()

  useEffect(() => {
    firebase
      .contactsDatabase({ uid: activeChat.contactKey })
      .child("pageIsOpen")
      .on("value", (snapshot: any) => {
        console.log("pageIsOpen")
        context?.dispatch({
          type: "updateContactsPageIsOpen",
          payload: { isPageOpen: snapshot.val(), chatKey: activeChat.chatKey }
        })
      })

    const unreadMessagesListener = firebase
      .unreadMessages({ uid: activeChat.contactKey, chatKey: activeChat.chatKey })
      .on("value", (snapshot: any) => {
        const unreadMessagesContact = !snapshot.val() ? [] : Object.keys(snapshot.val())
        context?.dispatch({
          type: "updateContactUnreadMessages",
          payload: { unreadMessages: unreadMessagesContact, chatKey: activeChat.chatKey }
        })
      })

    firebase
      .contactsLastActivity({ uid: authUser?.uid })
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
      firebase
        .unreadMessages({ uid: activeChat.contactKey, chatKey: activeChat.chatKey })
        .off("value", unreadMessagesListener)
      firebase.contactsDatabase({ uid: activeChat.contactKey }).child("pageIsOpen").off()
      firebase.contactsLastActivity({ uid: activeChat.contactKey }).off()
    }
  }, [activeChat, firebase])
  return { contactLastActivity }
}

export default useContactListeners
