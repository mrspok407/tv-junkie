import React, { useState, useEffect, useContext, useRef } from "react"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import Contact from "./Contact"
import useElementScrolledDown from "Components/Pages/Movies/useElementScrolledDown"
import { ContactInfoInterface, CONTACT_INFO_INITIAL_DATA } from "../../Types"
import classNames from "classnames"
import { ContactsContext } from "../Context/ContactsContext"
import { isUnexpectedObject } from "Utils"
import CreatePortal from "Components/UI/Modal/CreatePortal"
import ModalContent from "Components/UI/Modal/ModalContent"

const CONTACTS_TO_LOAD = 15

const ContactList: React.FC = () => {
  const firebase = useContext(FirebaseContext)
  const { authUser, errors } = useContext(AppContext)
  const context = useContext(ContactsContext)

  const [contacts, setContacts] = useState<ContactInfoInterface[]>()
  const [allContactsAmount, setAllContactsAmount] = useState()
  const loadedContacts = Object.keys(context?.state?.contacts as {}).length

  const contactListRef = useRef<HTMLDivElement>(null!)
  const isScrolledDown = useElementScrolledDown({ element: contactListRef.current, threshold: 200 })

  const contactsListRef = firebase.contactsList({ uid: authUser?.uid }).orderByChild("pinned_lastActivityTS")
  const contactsDatabaseRef = firebase.contactsDatabase({ uid: authUser?.uid })

  const getContactsList = (snapshot: any) => {
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
    contactsData.reverse()
    console.log({ contactsData })

    context?.dispatch({ type: "updateContacts", payload: snapshot.val() })
    setContacts(contactsData)
  }

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
        "contact-list--hide-mobile": context?.state.activeChat.chatKey
      })}
    >
      {contacts?.map((contact) => (
        <Contact key={contact.key} contactInfo={contact} />
      ))}
      {errors.error && <CreatePortal element={<ModalContent message={errors.error.message} />}></CreatePortal>}
    </div>
  )
}

export default ContactList
