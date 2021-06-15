import React, { useState, useEffect, useContext, useRef } from "react"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import Contact from "./Contact/Contact"
import useElementScrolledDown from "Components/Pages/Movies/useElementScrolledDown"
import { ContactInfoInterface, CONTACT_INFO_INITIAL_DATA, MessageInterface } from "../../@Types"
import classNames from "classnames"
import { ContactsContext } from "../@Context/ContactsContext"
import { isUnexpectedObject } from "Utils"
import CreatePortal from "Components/UI/Modal/CreatePortal"
import ModalContent from "Components/UI/Modal/ModalContent"
import { CONTACTS_TO_LOAD } from "../@Context/Constants"
import useGetInitialContactInfo from "./Hooks/UseGetInitialContactInfo"
import useFrequentVariables from "../../Hooks/UseFrequentVariables"

type Props = {
  contactListWrapperRef: HTMLDivElement
}

const ContactList: React.FC<Props> = ({ contactListWrapperRef }) => {
  const { firebase, authUser, errors, contactsContext, contactsState } = useFrequentVariables()
  const { contacts, groupCreation } = contactsState
  const contactsData = Object.values(contacts)?.map((contact) => contact)

  const [allContactsAmount, setAllContactsAmount] = useState<number | null>(null)
  const loadedContacts = contactsContext?.state?.contacts ? Object.keys(contactsContext.state.contacts).length : 0

  const [initialLoading, setInitialLoading] = useState(true)
  const initialLoadingRef = useRef(true)
  const newLoad = useRef(true)

  const isScrolledDown = useElementScrolledDown({ element: contactListWrapperRef, threshold: 650 })

  const { getContactsInfo } = useGetInitialContactInfo()

  const contactsListRef = firebase.contactsList({ uid: authUser?.uid })
  const contactsDatabaseRef = firebase.contactsDatabase({ uid: authUser?.uid })

  useEffect(() => {
    if (!initialLoading) {
      initialLoadingRef.current = false
    }
  }, [initialLoading])

  const getContactsList = async (snapshot: any) => {
    if (snapshot.val() === null) {
      setInitialLoading(false)
      contactsContext?.dispatch({
        type: "updateContactsInitial",
        payload: { contacts: {}, unreadMessages: {}, unreadMessagesContacts: {} }
      })
      return
    }

    let contactsData: ContactInfoInterface[] = []
    snapshot.forEach((contact: { val: () => ContactInfoInterface; key: string }) => {
      if (
        isUnexpectedObject({ exampleObject: CONTACT_INFO_INITIAL_DATA, targetObject: contact.val() }) &&
        !contact.val().isGroupChat
      ) {
        errors.handleError({
          message: "Some of your contacts were not loaded correctly. Try to reload the page."
        })
        return
      }
      contactsData.push({ ...contact.val(), key: contact.key })
    })

    if (initialLoadingRef.current || newLoad.current) {
      console.log({ contactsData })

      const contacts = await getContactsInfo({ contactsData })

      console.log({ contacts })

      const unreadMessages = contacts.reduce((acc, contact) => {
        acc = { ...acc, [contact.chatKey]: contact.unreadMessages }
        return acc
      }, {})
      const unreadMessagesContacts = contacts.reduce((acc, contact) => {
        acc = { ...acc, [contact.chatKey]: contact.unreadMessagesContact }
        return acc
      }, {})

      const contactsDispatch = contacts.reduce((acc: { [key: string]: ContactInfoInterface }, contact) => {
        acc = { [contact.key]: { ...contact }, ...acc }
        return acc
      }, {})

      console.log({ contactsDispatch })

      // initialLoadingRef.current = false
      // newLoad.current = false

      contactsContext?.dispatch({
        type: "updateContactsInitial",
        payload: { contacts: contactsDispatch, unreadMessages, unreadMessagesContacts }
      })

      setInitialLoading(false)
    } else {
      contactsContext?.dispatch({
        type: "updateContacts",
        payload: { contacts: contactsData }
      })
    }
  }

  useEffect(() => {
    contactsListRef
      .orderByChild("pinned_lastActivityTS")
      .limitToLast(CONTACTS_TO_LOAD)
      .on("value", (snapshot: any) => getContactsList(snapshot))

    const contactsAmountListener = contactsDatabaseRef.child("contactsAmount").on("value", (snapshot: any) => {
      setAllContactsAmount(snapshot.val())
    })

    return () => {
      contactsListRef.off()
      contactsDatabaseRef.child("contactsAmount").off("value", contactsAmountListener)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isScrolledDown) return
    if (groupCreation.isActive) return
    if (loadedContacts >= allContactsAmount!) return

    contactsListRef.off()
    newLoad.current = true
    contactsListRef
      .orderByChild("pinned_lastActivityTS")
      .limitToLast(loadedContacts + CONTACTS_TO_LOAD)
      .on("value", (snapshot: any) => getContactsList(snapshot))
  }, [isScrolledDown, groupCreation]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={classNames("contact-list", {
        // "contact-list--hide-mobile": context?.state.activeChat.chatKey,
        "contact-list--no-contacts": !initialLoadingRef.current && !contactsData?.length,
        "contact-list--group-creation-active": groupCreation.isActive
      })}
    >
      {initialLoading ? (
        <div className="contact-list__loader-wrapper">
          <span className="contact-list__loader"></span>
        </div>
      ) : !contactsData?.length ? (
        <div className="contact-list--no-contacts-text">You don't have any contacts</div>
      ) : (
        contactsData?.map((contact) => (
          <Contact key={contact.key} contactInfo={contact} allContactsAmount={allContactsAmount} />
        ))
      )}

      {errors.error && <CreatePortal element={<ModalContent message={errors.error.message} />}></CreatePortal>}
    </div>
  )
}

export default ContactList
