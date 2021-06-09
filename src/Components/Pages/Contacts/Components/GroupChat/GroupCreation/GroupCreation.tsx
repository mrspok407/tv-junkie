import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { ContactInfoInterface, CONTACT_INFO_INITIAL_DATA } from "Components/Pages/Contacts/@Types"
import useTimestampFormater from "Components/Pages/Contacts/Hooks/UseTimestampFormater"
import useElementScrolledDown from "Components/Pages/Movies/useElementScrolledDown"
import React, { useState, useEffect, useContext, useRef, useLayoutEffect } from "react"
import { keyframes } from "styled-components"
import { isUnexpectedObject } from "Utils"
import { ContactsContext } from "../../@Context/ContactsContext"
import Contact from "./Components/Contact/Contact"
import "./GroupCreation.scss"

type Props = {
  contactListWrapperRef: HTMLDivElement
}

const CONTACTS_TO_LOAD = 20

const GroupCreation: React.FC<Props> = ({ contactListWrapperRef }) => {
  const firebase = useContext(FirebaseContext)
  const { authUser, errors } = useContext(AppContext)
  const context = useContext(ContactsContext)
  const { contactsStatus } = context?.state!

  const [contacts, setContacts] = useState<ContactInfoInterface[]>([])
  const [loadedContacts, setLoadedContacts] = useState(CONTACTS_TO_LOAD)
  const [allContactsAmount, setAllContactsAmount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const createGroupWrapperRef = useRef<HTMLDivElement>(null!)
  const contactsListRef = firebase.contactsList({ uid: authUser?.uid })
  const isScrolledDown = useElementScrolledDown({ element: createGroupWrapperRef.current, threshold: 650 })

  useLayoutEffect(() => {
    contactListWrapperRef.scrollTop = 0
  }, [])

  const getContactsData = async (snapshot: any) => {
    let contacts: ContactInfoInterface[] = []
    snapshot.forEach((contact: { val: () => ContactInfoInterface; key: string }) => {
      if (isUnexpectedObject({ exampleObject: CONTACT_INFO_INITIAL_DATA, targetObject: contact.val() })) {
        errors.handleError({
          message: "Some of your contacts were not loaded correctly. Try to reload the page."
        })
        return
      }
      const chatKey =
        contact.key < authUser?.uid! ? `${contact.key}_${authUser?.uid}` : `${authUser?.uid}_${contact.key}`
      contacts.push({ ...contact.val(), key: contact.key, chatKey })
    })
    setContacts((prevState) => [...prevState, ...contacts])
    setInitialLoading(false)
    setLoading(false)
  }

  useEffect(() => {
    ;(async () => {
      try {
        setInitialLoading(true)
        const contactsData = await contactsListRef.orderByChild("userName").limitToFirst(CONTACTS_TO_LOAD).once("value")
        getContactsData(contactsData)
      } catch (error) {
        errors.handleError({
          message: "Some of your contacts were not loaded correctly. Try to reload the page."
        })
        setInitialLoading(false)
      }
    })()
    const contactsAmountListener = firebase
      .contactsDatabase({ uid: authUser?.uid })
      .child("contactsAmount")
      .on("value", (snapshot: any) => {
        setAllContactsAmount(snapshot.val())
      })
    return () => {
      firebase.contactsDatabase({ uid: authUser?.uid }).child("contactsAmount").off("value", contactsAmountListener)
    }
  }, [firebase, authUser])

  useEffect(() => {
    if (!isScrolledDown) return
    if (loading) return
    if (contacts.length >= allContactsAmount!) return
    ;(async () => {
      try {
        setLoading(true)
        const contactsData = await contactsListRef
          .orderByChild("userName")
          .startAfter(contacts[contacts.length - 1].userName)
          .limitToFirst(CONTACTS_TO_LOAD)
          .once("value")
        getContactsData(contactsData)
      } catch (error) {
        errors.handleError({
          message: "Some of your contacts were not loaded correctly. Try to reload the page."
        })
        setLoading(false)
      }
    })()
  }, [isScrolledDown, contacts])

  return (
    <div className="group-creation" ref={createGroupWrapperRef}>
      <div className="group-creation__heading">
        <div className="group-creation__heading-go-back">
          <button
            type="button"
            onClick={() => context?.dispatch({ type: "toggleIsActiveGroupCreation", payload: { isActive: false } })}
          ></button>
        </div>
        <div className="group-creation__heading-text">Add members</div>
      </div>
      <div className="group-creation__search">
        <input type="text" placeholder="Search for contact" className="search__input" />
      </div>
      <div className="contact-list">
        {initialLoading ? (
          <div className="contact-list__loader-wrapper">
            <span className="contact-list__loader"></span>
          </div>
        ) : !contacts.length ? (
          <div className="contact-list--no-contacts-text">You don't have any contacts</div>
        ) : (
          contacts.map((contact) => <Contact key={contact.key} contact={contact} />)
        )}
        {loading && (
          <div className="contact-list__loader-wrapper">
            <span className="contact-list__loader"></span>
          </div>
        )}
      </div>
    </div>
  )
}

export default GroupCreation
