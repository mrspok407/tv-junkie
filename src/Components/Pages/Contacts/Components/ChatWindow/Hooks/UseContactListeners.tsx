import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import React, { useState, useEffect, useContext } from "react"
import { ContactsContext } from "../../@Context/ContactsContext"

type Props = {}

const useContactListeners = () => {
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)
  const { activeChat } = context?.state!

  useEffect(() => {
    firebase
      .contactsDatabase({ uid: activeChat.contactKey })
      .child("pageIsOpen")
      .on("value", (snapshot: any) => {
        context?.dispatch({
          type: "updateContactsPageIsOpen",
          payload: { isPageOpen: snapshot.val(), chatKey: activeChat.chatKey }
        })
      })

    firebase
      .unreadMessages({ uid: activeChat.contactKey, chatKey: activeChat.chatKey })
      .on("value", (snapshot: any) => {
        const unreadMessagesContact = !snapshot.val() ? [] : Object.keys(snapshot.val())
        console.log({ unreadMessagesContact })
        context?.dispatch({
          type: "updateContactUnreadMessages",
          payload: { unreadMessages: unreadMessagesContact, chatKey: activeChat.chatKey }
        })
      })

    firebase.contactsLastActivity({ uid: activeChat.contactKey })

    return () => {
      firebase.unreadMessages({ uid: activeChat.contactKey, chatKey: activeChat.chatKey }).off()
    }
  }, [activeChat, firebase])
}

export default useContactListeners
