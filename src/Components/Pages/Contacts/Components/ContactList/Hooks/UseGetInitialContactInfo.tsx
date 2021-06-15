import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext, FirebaseInterface } from "Components/Firebase/FirebaseContext"
import { ContactInfoInterface, ContactsInterface, MessageInterface } from "Components/Pages/Contacts/@Types"
import { useContext, useEffect, useRef, useState } from "react"

const useGetInitialContactInfo = () => {
  const { authUser } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const loadedContactsRef = useRef<{ [key: string]: ContactInfoInterface }>({})

  const getContactsInfo = async ({ contactsData }: { contactsData: ContactInfoInterface[] }) => {
    return await Promise.all(
      contactsData.map(async (contact) => {
        if (loadedContactsRef.current[contact.key]) {
          return {
            ...loadedContactsRef.current[contact.key],
            ...contact
          }
        }

        let chatKey: string = ""
        if (contact.isGroupChat) {
          chatKey = contact.key
        } else {
          chatKey = contact.key < authUser?.uid! ? `${contact.key}_${authUser?.uid}` : `${authUser?.uid}_${contact.key}`
        }

        const [
          newContactsActivity,
          newContactsRequests,
          unreadMessagesAuthData,
          unreadMessagesContactData,
          lastMessage
        ]: [
          { val: () => boolean | null },
          { val: () => boolean | null },
          { val: () => { [key: string]: boolean } },
          { val: () => { [key: string]: boolean } },
          { val: () => MessageInterface | null }
        ] = await Promise.all([
          firebase.newContactsActivity({ uid: authUser?.uid! }).child(`${contact.key}`).once("value"),
          firebase.newContactsRequests({ uid: authUser?.uid! }).child(`${contact.key}`).once("value"),
          firebase.unreadMessages({ uid: authUser?.uid!, chatKey, isGroupChat: contact.isGroupChat }).once("value"),
          firebase.unreadMessages({ uid: contact.key, chatKey, isGroupChat: contact.isGroupChat }).once("value"),
          firebase
            .messages({ chatKey, isGroupChat: contact.isGroupChat })
            .orderByChild("timeStamp")
            .limitToLast(1)
            .once("value")
        ])

        const unreadMessages = !unreadMessagesAuthData.val() ? [] : Object.keys(unreadMessagesAuthData.val())
        const unreadMessagesContact = !unreadMessagesContactData.val()
          ? []
          : Object.keys(unreadMessagesContactData.val())
        const contactInfo = {
          ...contact,
          key: contact.key,
          chatKey,
          newContactsActivity: !!newContactsActivity.val(),
          newContactsRequests: !!newContactsRequests.val(),
          unreadMessages,
          unreadMessagesContact,
          lastMessage: lastMessage.val() !== null ? Object.values(lastMessage.val()!).map((item) => item)[0] : {}
        }

        loadedContactsRef.current = {
          ...loadedContactsRef.current,
          [contact.key]: contactInfo
        }

        return contactInfo
      })
    )
  }

  return { getContactsInfo }
}

export default useGetInitialContactInfo
