import React, { useState, useEffect, useContext, useRef } from "react"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import Contact from "./Contact/Contact"
import useElementScrolledDown from "Components/Pages/Movies/useElementScrolledDown"
import { ContactInfoInterface, CONTACT_INFO_INITIAL_DATA, MessageInterface } from "../../Types"
import classNames from "classnames"
import { ContactsContext } from "../Context/ContactsContext"
import { isUnexpectedObject } from "Utils"
import CreatePortal from "Components/UI/Modal/CreatePortal"
import ModalContent from "Components/UI/Modal/ModalContent"
import "./ContactList.scss"
import { getInitialContactInfo } from "./FirebaseHelpers/FirebaseHelpers"

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
    console.log("on listener fire")
    if (snapshot.val() === null) {
      setInitialLoading(false)
      return
    }

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
      ? await getInitialContactInfo({ firebase, contactsData, authUser })
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
    console.log("contactListUseEffect")

    contactsListRef.limitToLast(CONTACTS_TO_LOAD).on("value", (snapshot: any) => getContactsList(snapshot))

    contactsDatabaseRef.child("contactsAmount").on("value", (snapshot: any) => {
      setAllContactsAmount(snapshot.val())
    })

    return () => {
      firebase.contactsList({ uid: authUser?.uid }).off()
      contactsDatabaseRef.off()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isScrolledDown) return
    if (loadedContacts >= allContactsAmount!) return

    console.log("contactListUseEffect Scroll")
    console.log(loadedContacts + CONTACTS_TO_LOAD)

    firebase.contactsList({ uid: authUser?.uid }).off()
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
        "contact-list--no-contacts": !initialLoading && !contacts?.length
      })}
    >
      {initialLoading ? (
        <span className="contact-list__loader"></span>
      ) : !contacts?.length ? (
        <div className="contact-list--no-contacts-text">You don't have any contacts</div>
      ) : (
        contacts?.map((contact) => <Contact key={contact.key} contactInfo={contact} />)
      )}

      {errors.error && <CreatePortal element={<ModalContent message={errors.error.message} />}></CreatePortal>}
    </div>
  )
}

export default ContactList
