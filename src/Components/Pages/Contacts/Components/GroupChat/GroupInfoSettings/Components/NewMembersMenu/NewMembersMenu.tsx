import classNames from "classnames"
import {
  ContactInfoInterface,
  CONTACT_INFO_INITIAL_DATA,
  GroupCreationNewMemberInterface
} from "Components/Pages/Contacts/@Types"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import useElementScrolledDown from "Components/Pages/Contacts/Hooks/useElementScrolledDown"
import React, { useState, useEffect, useRef, useCallback } from "react"
import { isUnexpectedObject } from "Utils"
import Contact from "./Components/Contact/Contact"
import SearchInput from "../../../GroupCreation/Components/SearchInput/SearchInput"
import useAddNewMembers from "../../../Hooks/UseAddNewMembers"
import "../../../GroupCreation/Components/ContactsSearch/ContactsSearch.scss"
import "./NewMembersMenu.scss"

const CONTACTS_TO_LOAD = 20

const NewMembersMenu: React.FC = () => {
  const { firebase, authUser, errors, contactsState } = useFrequentVariables()
  const { activeChat, contacts } = contactsState
  const contactInfo = contacts[activeChat.contactKey] || {}

  const [contactsList, setContactsList] = useState<ContactInfoInterface[]>([])
  const [searchedContacts, setSearchedContacts] = useState<ContactInfoInterface[] | null>([])
  const [selectedMembers, setSelectedMembers] = useState<GroupCreationNewMemberInterface[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [allContactsLoaded, setAllContactsLoaded] = useState(false)
  const [loadingNewContacts, setLoadingNewcontacts] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const { newMembersLoading, addNewMembers } = useAddNewMembers()

  const membersListWrapperRef = useRef<HTMLDivElement>(null!)
  const contactsListRef = firebase.contactsList({ uid: authUser?.uid })
  const isScrolledDown = useElementScrolledDown({ element: membersListWrapperRef.current, threshold: 650 })

  const handleNewMembers = ({
    contact,
    formatedDate
  }: {
    contact: ContactInfoInterface
    formatedDate: string | number | null
  }) => {
    const newMember = {
      key: contact.key,
      userName: contact.userName,
      lastSeen: formatedDate,
      chatKey: contact.chatKey
    }
    setSelectedMembers((prevState) => {
      if (prevState.map((member) => member.key).includes(newMember.key)) {
        return [...prevState.filter((item) => item.key !== newMember.key)]
      } else {
        return [...prevState, newMember]
      }
    })
  }

  const getContactsData = async ({ snapshot, isSearchedData = false }: { snapshot: any; isSearchedData?: boolean }) => {
    if (snapshot.val() === null) {
      setAllContactsLoaded(true)
      setLoadingNewcontacts(false)
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
      setLoadingNewcontacts(false)
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
    if (loadingNewContacts) return
    if (allContactsLoaded) return
    ;(async () => {
      try {
        setLoadingNewcontacts(true)
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
        setLoadingNewcontacts(false)
      }
    })()
  }, [isScrolledDown, contactsList, allContactsLoaded, loadingNewContacts, errors]) // eslint-disable-line react-hooks/exhaustive-deps

  const contactsToRender = !searchedContacts?.length ? contactsList : searchedContacts
  return (
    <>
      <div className="members-menu members-menu--new-members">
        <div className="contacts-search">
          <SearchInput onSearch={handleSearch} isSearching={isSearching} contactsList={contactsList} />
          <div className="members-list-wrapper" ref={membersListWrapperRef}>
            <div className="members-list">
              {initialLoading ? (
                <div className="contact-list__loader-wrapper">
                  <span className="contact-list__loader"></span>
                </div>
              ) : !contactsList.length ? (
                <div className="contact-list--no-contacts-text">You don't have any contacts</div>
              ) : searchedContacts === null ? (
                <div className="contact-list--no-contacts-text">No contacts found</div>
              ) : (
                contactsToRender.map((contact) => (
                  <Contact
                    key={contact.key}
                    contact={contact}
                    handleNewMembers={handleNewMembers}
                    selectedMembers={selectedMembers}
                  />
                ))
              )}
              {loadingNewContacts && (
                <div className="contact-list__loader-wrapper">
                  <span className="contact-list__loader"></span>
                </div>
              )}
            </div>
          </div>
        </div>
        {selectedMembers.length ? (
          <div
            className={classNames("handle-new-members", {
              "handle-new-members--arrow": true,
              "handle-new-members--loading": newMembersLoading
            })}
          >
            <button
              type="button"
              onClick={() =>
                addNewMembers({
                  members: selectedMembers,
                  groupInfo: { groupName: contactInfo.groupName, key: contactInfo.chatKey }
                })
              }
            ></button>
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  )
}

export default NewMembersMenu
