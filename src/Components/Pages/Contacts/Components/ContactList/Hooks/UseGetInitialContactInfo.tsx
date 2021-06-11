import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext, FirebaseInterface } from "Components/Firebase/FirebaseContext"
import { ContactInfoInterface, ContactsInterface, MessageInterface } from "Components/Pages/Contacts/@Types"
import { useContext, useEffect, useRef, useState } from "react"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"
import { ContactsContext, ContextInterface } from "../../@Context/ContactsContext"
import useGetInitialMessages from "../../ChatWindow/FirebaseHelpers/UseGetInitialMessages"

// let loadedContactsRef: { [key: string]: ContactInfoInterface } = {}

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

        const chatKey =
          contact.key < authUser?.uid! ? `${contact.key}_${authUser?.uid}` : `${authUser?.uid}_${contact.key}`
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
          firebase.unreadMessages({ uid: authUser?.uid!, chatKey }).once("value"),
          firebase.unreadMessages({ uid: contact.key, chatKey }).once("value"),
          firebase.messages({ chatKey }).orderByChild("timeStamp").limitToLast(1).once("value")
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