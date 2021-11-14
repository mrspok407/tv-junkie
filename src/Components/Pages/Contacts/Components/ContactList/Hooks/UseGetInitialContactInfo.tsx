import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase/FirebaseContext"
import { ContactInfoInterface, MessageInterface } from "Components/Pages/Contacts/@Types"
import { useContext, useRef } from "react"

const useGetInitialContactInfo = () => {
  const { authUser } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const loadedContactsRef = useRef<{ [key: string]: ContactInfoInterface }>({})

  const getContactsInfo = async ({ contactsData }: { contactsData: ContactInfoInterface[] }) => {
    return await Promise.all(
      contactsData?.map(async (contact) => {
        if (loadedContactsRef.current[contact.key]) {
          return {
            ...loadedContactsRef.current[contact.key],
            ...contact
          }
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
          firebase
            .unreadMessages({ uid: authUser?.uid!, chatKey: contact.chatKey, isGroupChat: contact.isGroupChat })
            .once("value"),
          firebase
            .unreadMessages({ uid: contact.key, chatKey: contact.chatKey, isGroupChat: contact.isGroupChat })
            .once("value"),
          firebase
            .messages({ chatKey: contact.chatKey, isGroupChat: contact.isGroupChat })
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
          chatKey: contact.chatKey,
          newContactsActivity: !!newContactsActivity.val(),
          newContactsRequests: !!newContactsRequests.val(),
          unreadMessages,
          unreadMessagesContact,
          lastMessage: lastMessage.val() !== null ? Object.values(lastMessage.val() || {}).map((item) => item)[0] : {}
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
