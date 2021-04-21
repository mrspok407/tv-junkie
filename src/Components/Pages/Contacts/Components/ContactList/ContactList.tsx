import React, { useState, useEffect, useContext, useRef } from "react"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import Contact from "./Contact"
import useElementScrolledDown from "Components/Pages/Movies/useElementScrolledDown"
import { ContactInfoInterface, CONTACT_INFO_INITIAL_DATA, MessageInterface } from "../../Types"
import classNames from "classnames"
import { ContactsContext } from "../Context/ContactsContext"
import { isUnexpectedObject } from "Utils"
import CreatePortal from "Components/UI/Modal/CreatePortal"
import ModalContent from "Components/UI/Modal/ModalContent"

const CONTACTS_TO_LOAD = 20

const ContactList: React.FC = () => {
  const firebase = useContext(FirebaseContext)
  const { authUser, errors } = useContext(AppContext)
  const context = useContext(ContactsContext)

  const [contacts, setContacts] = useState<ContactInfoInterface[]>()
  const [allContactsAmount, setAllContactsAmount] = useState()
  const loadedContacts = context?.state?.contacts ? Object.keys(context.state.contacts).length : 0

  const [initialLoading, setInitialLoading] = useState(true)

  const contactListRef = useRef<HTMLDivElement>(null!)
  const isScrolledDown = useElementScrolledDown({ element: contactListRef.current, threshold: 650 })

  const contactsListRef = firebase.contactsList({ uid: authUser?.uid }).orderByChild("pinned_lastActivityTS")
  const contactsDatabaseRef = firebase.contactsDatabase({ uid: authUser?.uid })

  const getContactsList = async (snapshot: any) => {
    console.log({ snapshot: snapshot.val() })
    if (snapshot.val() === null) return

    let contactsData: ContactInfoInterface[] = []
    snapshot.forEach((contact: { val: () => ContactInfoInterface; key: string }) => {
      if (isUnexpectedObject({ exampleObject: CONTACT_INFO_INITIAL_DATA, targetObject: contact.val() })) {
        errors.handleError({
          message: "Some of your contacts were not loaded correctly. Try to reload the page."
        })
        return
      }
      contactsData.push({ ...contact.val(), key: contact.key })
    })

    const contacts: any[] = initialLoading
      ? await Promise.all(
          contactsData.map(async (contact: ContactInfoInterface) => {
            console.log("test")

            const chatKey =
              contact.key < authUser?.uid! ? `${contact.key}_${authUser?.uid}` : `${authUser?.uid}_${contact.key}`

            const [
              newContactsActivity,
              newContactsRequests,
              unreadMessagesAuth,
              unreadMessagesContact,
              lastMessage
            ] = await Promise.all([
              firebase.newContactsActivity({ uid: authUser?.uid! }).child(`${contact.key}`).once("value"),
              firebase.newContactsRequests({ uid: authUser?.uid! }).child(`${contact.key}`).once("value"),
              firebase.unreadMessages({ uid: authUser?.uid!, chatKey }).once("value"),
              firebase.unreadMessages({ uid: contact.key, chatKey }).orderByKey().limitToFirst(1).once("value"),
              firebase.messages({ chatKey }).orderByChild("timeStamp").limitToLast(1).once("value")
            ])

            return {
              ...contact,
              key: contact.key,
              newContactsActivity: newContactsActivity.val(),
              newContactsRequests: newContactsRequests.val(),
              unreadMessagesAuth: unreadMessagesAuth.numChildren(),
              unreadMessagesContact: unreadMessagesContact.numChildren(),
              lastMessage: Object.values(lastMessage.val()).map((item) => item)[0]
            }
          })
        )
      : contactsData

    contacts.reverse()
    console.log({ contacts })

    context?.dispatch({ type: "updateContacts", payload: snapshot.val() })
    setContacts(contacts)
    setInitialLoading(false)
  }

  useEffect(() => {
    console.log(context?.state.activeChat.chatKey)
  }, [context?.state.activeChat])

  useEffect(() => {
    contactsListRef.limitToLast(CONTACTS_TO_LOAD).on("value", (snapshot: any) => getContactsList(snapshot))

    contactsDatabaseRef.child("contactsAmount").on("value", (snapshot: any) => {
      setAllContactsAmount(snapshot.val())
    })

    return () => {
      contactsListRef.off()
      contactsDatabaseRef.off()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isScrolledDown) return
    if (loadedContacts >= allContactsAmount!) return

    contactsListRef.off()
    contactsListRef
      .limitToLast(loadedContacts + CONTACTS_TO_LOAD)
      .on("value", (snapshot: any) => getContactsList(snapshot))
  }, [isScrolledDown]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    console.log({ contacts })
  }, [contacts])

  return (
    <div
      ref={contactListRef}
      className={classNames("contact-list", {
        "contact-list--hide-mobile": context?.state.activeChat.chatKey,
        "contact-list--no-contacts": !contacts?.length
      })}
    >
      {!contacts?.length ? (
        <div className="contact-list--no-contacts-text">You don't have any contacts</div>
      ) : (
        contacts?.map((contact) => <Contact key={contact.key} contactInfo={contact} />)
      )}

      {errors.error && <CreatePortal element={<ModalContent message={errors.error.message} />}></CreatePortal>}
    </div>
  )
}

export default ContactList
