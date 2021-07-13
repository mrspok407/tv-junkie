import { ContactInfoInterface, CONTACT_INFO_INITIAL_DATA } from "Components/Pages/Contacts/@Types"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import useElementScrolledDown from "Components/Pages/Contacts/Hooks/useElementScrolledDown"
import React, { useState, useEffect, useCallback } from "react"
import { isUnexpectedObject } from "Utils"
import Contact from "../Contact/Contact"
import SearchInput from "../SearchInput/SearchInput"
import "./ContactsSearch.scss"

type Props = {
  wrapperRef: HTMLDivElement
}

const CONTACTS_TO_LOAD = 20

const ContactsSearch: React.FC<Props> = ({ wrapperRef }) => {
  const { firebase, authUser, errors, contactsState, contactsDispatch } = useFrequentVariables()
  const { groupCreation } = contactsState

  const [contactsList, setContactsList] = useState<ContactInfoInterface[]>([])
  const [searchedContacts, setSearchedContacts] = useState<ContactInfoInterface[] | null>([])
  const [isSearching, setIsSearching] = useState(false)
  const [allContactsLoaded, setAllContactsLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const contactsListRef = firebase.contactsList({ uid: authUser?.uid })
  const isScrolledDown = useElementScrolledDown({ element: wrapperRef, threshold: 650 })

  const getContactsData = async ({ snapshot, isSearchedData = false }: { snapshot: any; isSearchedData?: boolean }) => {
    if (snapshot.val() === null) {
      setAllContactsLoaded(true)
      setLoading(false)
      return
    }

    let contacts: ContactInfoInterface[] = []
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
      const chatKey =
        contact.key < authUser?.uid! ? `${contact.key}_${authUser?.uid}` : `${authUser?.uid}_${contact.key}`
      contacts.push({ ...contact.val(), key: contact.key, chatKey })
    })

    const contactWithStatus = await Promise.all(
      contacts.map(async (contact) => {
        const contactStatus = await Promise.all([
          firebase.contactsDatabase({ uid: contact.key }).child("pageIsOpen").once("value"),
          firebase
            .chatMemberStatus({ chatKey: contact.chatKey, memberKey: contact.key, isGroupChat: false })
            .child("lastSeen")
            .once("value")
        ])
        return { ...contact, isOnline: contactStatus[0].val(), lastSeen: contactStatus[1].val() }
      })
    )

    if (isSearchedData) {
      setSearchedContacts(contactWithStatus.filter((contact) => contact.status === true && !contact.isGroupChat))
      setIsSearching(false)
    } else {
      setContactsList((prevState) => [
        ...prevState,
        ...contactWithStatus.filter((contact) => contact.status === true && !contact.isGroupChat)
      ])
      setInitialLoading(false)
      setLoading(false)
    }
  }

  const handleSearch = useCallback(
    async (query: string) => {
      if (!contactsList.length) return
      if (!query || !query.trim()) {
        setSearchedContacts([])
        setIsSearching(false)
        return
      }
      setIsSearching(true)

      try {
        const contactsData = await contactsListRef
          .orderByChild("userNameLowerCase")
          .startAt(query.toLowerCase())
          .endAt(query.toLowerCase() + "\uf8ff")
          .once("value")
        if (
          !Object.values(contactsData.val() || {}).filter((item: any) => item.status === true && !item.isGroupChat)
            .length
        ) {
          setSearchedContacts(null)
          setIsSearching(false)
          return
        }

        getContactsData({ snapshot: contactsData, isSearchedData: true })
      } catch (error) {
        errors.handleError({
          message: "Some of your contacts were not loaded correctly. Try to reload the page."
        })
        setIsSearching(false)
      }
    },
    [contactsList, errors] // eslint-disable-line react-hooks/exhaustive-deps
  )

  useEffect(() => {
    ;(async () => {
      setInitialLoading(true)
      try {
        let additionalContactsToLoad = 0
        let contacts: any = []
        const getInitialContacts = async () => {
          const contactsData = await contactsListRef
            .orderByChild("userNameLowerCase")
            .limitToFirst(CONTACTS_TO_LOAD + additionalContactsToLoad)
            .once("value")
          const contactsLength = Object.keys(contactsData.val() || {}).length
          const contactsDataFiltered = Object.values(contactsData.val() || {}).filter(
            (contact: any) => contact.status === true && !contact.isGroupChat
          )

          if (contactsLength < 20 || contactsDataFiltered.length >= 20) {
            contacts = contactsData
            return
          }

          if (contactsLength >= 20 && contactsLength !== contactsDataFiltered.length) {
            additionalContactsToLoad = additionalContactsToLoad + CONTACTS_TO_LOAD
            await getInitialContacts()
          } else {
            contacts = contactsData
          }
        }
        await getInitialContacts()
        getContactsData({ snapshot: contacts })
      } catch (error) {
        errors.handleError({
          message: "Some of your contacts were not loaded correctly. Try to reload the page."
        })
        setInitialLoading(false)
      }
    })()
  }, [firebase, authUser, errors]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isScrolledDown) return
    if (loading) return
    if (allContactsLoaded) return
    ;(async () => {
      try {
        setLoading(true)
        const contactsData = await contactsListRef
          .orderByChild("userNameLowerCase")
          .startAfter(contactsList[contactsList.length - 1].userNameLowerCase)
          .limitToFirst(CONTACTS_TO_LOAD)
          .once("value")
        getContactsData({ snapshot: contactsData })
      } catch (error) {
        errors.handleError({
          message: "Some of your contacts were not loaded correctly. Try to reload the page."
        })
        setLoading(false)
      }
    })()
  }, [isScrolledDown, allContactsLoaded, errors, loading, contactsList]) // eslint-disable-line react-hooks/exhaustive-deps

  const contactsToRender = !searchedContacts?.length ? contactsList : searchedContacts
  return (
    <>
      <div className="contacts-search">
        <div className="contacts-search__selected-members">
          {groupCreation.members.map((member) => (
            <div
              key={member.key}
              className="contacts-search__selected-contact"
              onClick={() =>
                contactsDispatch({
                  type: "updateGroupMembers",
                  payload: { removeMember: true, newMember: { key: member.key } }
                })
              }
            >
              <div className="contacts-search__selected-contact-name">{member.username}</div>
              <div className="contacts-search__selected-contact-remove">
                <button type="button"></button>
              </div>
            </div>
          ))}
        </div>
        <SearchInput onSearch={handleSearch} isSearching={isSearching} contactsList={contactsList} />
        {!groupCreation.selectNameActive && (
          <div className="contact-list">
            {initialLoading ? (
              <div className="contact-list__loader-wrapper">
                <span className="contact-list__loader"></span>
              </div>
            ) : !contactsList.length ? (
              <div className="contact-list--no-contacts-text">You don't have any contacts</div>
            ) : searchedContacts === null ? (
              <div className="contact-list--no-contacts-text">No contacts found</div>
            ) : (
              contactsToRender.map((contact) => <Contact key={contact.key} contact={contact} />)
            )}
            {loading && (
              <div className="contact-list__loader-wrapper">
                <span className="contact-list__loader"></span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default ContactsSearch
