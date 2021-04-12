import React, { useState, useEffect, useContext, useRef } from "react"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import Contact from "./Contact"
import useElementScrolledDown from "Components/Pages/Movies/useElementScrolledDown"

type Props = {}

export interface ContactInfoInterface {
  status: boolean
  receiver: boolean
  userName: string
  timeStamp: number
  pinned_lastActivityTS: string
  recipientNotified: boolean
  key: string
}

const CONTACTS_TO_LOAD = 15

const ContactList: React.FC<Props> = () => {
  const firebase = useContext(FirebaseContext)
  const { authUser } = useContext(AppContext)

  const [contacts, setContacts] = useState<ContactInfoInterface[]>()
  const [allContactsAmount, setAllContactsAmount] = useState()
  const [loadedContacts, setLoadedContacts] = useState(0)

  const contactListRef = useRef<HTMLDivElement>(null!)
  const isScrolledDown = useElementScrolledDown({ element: contactListRef.current, threshold: 400 })

  const contactsListRef = firebase.contactsList({ uid: authUser?.uid }).orderByChild("pinned_lastActivityTS")
  const contactsDatabaseRef = firebase.contactsDatabase({ uid: authUser?.uid })

  const getContactsList = (snapshot: any) => {
    let contactsData: ContactInfoInterface[] = []
    snapshot.forEach((contact: { val: () => ContactInfoInterface; key: string }) => {
      contactsData.push({ ...contact.val(), key: contact.key })
    })
    contactsData.reverse()
    setContacts(contactsData)
    setLoadedContacts((prevState) => prevState + CONTACTS_TO_LOAD)
  }

  useEffect(() => {
    contactsListRef.limitToLast(CONTACTS_TO_LOAD).on("value", (snapshot: any) => getContactsList(snapshot))

    contactsDatabaseRef.child("contactsAmount").on("value", (snapshot: any) => {
      setAllContactsAmount(snapshot.val())
    })
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
    <div ref={contactListRef} className="contact-list">
      {contacts?.map((contact) => (
        <Contact key={contact.key} contactInfo={contact} />
      ))}
    </div>
  )
}

export default ContactList
