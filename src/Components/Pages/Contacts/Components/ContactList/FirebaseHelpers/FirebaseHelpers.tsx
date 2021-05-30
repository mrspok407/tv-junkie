import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import { ContactInfoInterface, MessageInterface } from "Components/Pages/Contacts/@Types"
import { useContext } from "react"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"
import { ContactsContext, ContextInterface } from "../../@Context/ContactsContext"

interface GetInitialInfoInfterface {
  firebase: FirebaseInterface
  contactsData: ContactInfoInterface[]
  authUser: AuthUserInterface | null
  context: ContextInterface | null
}

let loadedContactsRef: { [key: string]: ContactInfoInterface } = {}

export const getInitialContactInfo = async ({ firebase, contactsData, authUser }: GetInitialInfoInfterface) => {
  return Promise.all(
    contactsData.map(async (contact) => {
      if (loadedContactsRef[contact.key]) {
        return {
          ...loadedContactsRef[contact.key],
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
      const unreadMessagesContact = !unreadMessagesContactData.val() ? [] : Object.keys(unreadMessagesContactData.val())
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

      loadedContactsRef = {
        ...loadedContactsRef,
        [contact.key]: contactInfo
      }

      return contactInfo
    })
  )
}
