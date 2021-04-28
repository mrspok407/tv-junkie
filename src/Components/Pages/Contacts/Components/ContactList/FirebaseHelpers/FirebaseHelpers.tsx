import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import { ContactInfoInterface, MessageInterface } from "Components/Pages/Contacts/Types"
import { useContext } from "react"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"
import { ContactsContext, ContextInterface } from "../../Context/ContactsContext"

interface GetInitialInfoInfterface {
  firebase: FirebaseInterface
  contactsData: ContactInfoInterface[]
  authUser: AuthUserInterface | null
  context: ContextInterface | null
}

export const getInitialContactInfo = async ({
  firebase,
  contactsData,
  authUser,
  context
}: GetInitialInfoInfterface) => {
  return Promise.all(
    contactsData.map(async (contact) => {
      const chatKey =
        contact.key < authUser?.uid! ? `${contact.key}_${authUser?.uid}` : `${authUser?.uid}_${contact.key}`

      const [newContactsActivity, newContactsRequests, unreadMessagesAuth, unreadMessagesContact, lastMessage]: [
        { val: () => boolean | null },
        { val: () => boolean | null },
        { numChildren: () => number | null },
        { val: () => boolean | null },
        { val: () => MessageInterface | null }
      ] = await Promise.all([
        firebase.newContactsActivity({ uid: authUser?.uid! }).child(`${contact.key}`).once("value"),
        firebase.newContactsRequests({ uid: authUser?.uid! }).child(`${contact.key}`).once("value"),
        firebase.unreadMessages({ uid: authUser?.uid!, chatKey }).once("value"),
        firebase.unreadMessages({ uid: contact.key, chatKey }).orderByKey().limitToFirst(1).once("value"),
        firebase.messages({ chatKey }).orderByChild("timeStamp").limitToLast(1).once("value")
      ])

      context?.dispatch({
        type: "updateAuthUserUnreadMessages",
        payload: { chatKey, unreadMessages: unreadMessagesAuth.numChildren()! }
      })

      return {
        ...contact,
        key: contact.key,
        newContactsActivity: !!newContactsActivity.val(),
        newContactsRequests: !!newContactsRequests.val(),
        unreadMessagesAuth: unreadMessagesAuth.numChildren(),
        unreadMessagesContact: !!unreadMessagesContact.val(),
        lastMessage: lastMessage.val() !== null ? Object.values(lastMessage.val()!).map((item) => item)[0] : {}
      }
    })
  )
}
