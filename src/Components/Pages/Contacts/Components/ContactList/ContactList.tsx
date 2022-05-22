import React, { useState, useEffect, useRef } from 'react'
import useElementScrolledDown from 'Components/Pages/Contacts/Hooks/useElementScrolledDown'
import classNames from 'classnames'
import { isUnexpectedObject } from 'Utils'
import CreatePortal from 'Components/UI/Modal/CreatePortal'
import ModalContent from 'Components/UI/Modal/ModalContent'
import { useAppSelector } from 'app/hooks'
import { selectAuthUser } from 'Components/UserAuth/Session/WithAuthentication/authUserSlice'
import { CONTACTS_TO_LOAD } from '../@Context/Constants'
import useGetInitialContactInfo from './Hooks/UseGetInitialContactInfo'
import useFrequentVariables from '../../../../../Utils/Hooks/UseFrequentVariables'
import { ContactInfoInterface, CONTACT_INFO_INITIAL_DATA } from '../../@Types'
import ContactRemovedFromGroup from './ContactRemovedFromGroup/ContactRemovedFromGroup'
import Contact from './Contact/Contact'

type Props = {
  contactListWrapperRef: HTMLDivElement
}

const ContactList: React.FC<Props> = ({ contactListWrapperRef }) => {
  const { firebase, authUser, errors, contactsState, contactsDispatch } = useFrequentVariables()
  const { contacts, groupCreation } = contactsState
  const contactsData = Object.values(contacts)?.map((contact) => contact)

  const [allContactsAmount, setAllContactsAmount] = useState<number | null>(null)
  const loadedContacts = contactsState.contacts ? Object.keys(contactsState.contacts).length : 0

  const [initialLoading, setInitialLoading] = useState(true)
  const initialLoadingRef = useRef(true)
  const newLoad = useRef(false)

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
      contactsDispatch({
        type: 'updateContactsInitial',
        payload: { contacts: {}, unreadMessages: {}, unreadMessagesContacts: {} },
      })
      return
    }

    const contactsData: ContactInfoInterface[] = []
    snapshot.forEach((contact: { val: () => ContactInfoInterface; key: string }) => {
      if (
        isUnexpectedObject({ exampleObject: CONTACT_INFO_INITIAL_DATA, targetObject: contact.val() }) &&
        !contact.val().isGroupChat
      ) {
        errors.handleError({
          message: 'Some of your contacts were not loaded correctly. Try to reload the page.',
        })
        return
      }
      let chatKey = ''
      if (contact.val().isGroupChat) {
        chatKey = contact.key
      } else {
        chatKey = contact.key < authUser?.uid! ? `${contact.key}_${authUser?.uid}` : `${authUser?.uid}_${contact.key}`
      }
      contactsData.push({ ...contact.val(), isGroupChat: !!contact.val().isGroupChat, key: contact.key, chatKey })
    })

    if (initialLoadingRef.current || newLoad.current) {
      const contacts = await getContactsInfo({ contactsData })

      const unreadMessages = contacts.reduce((acc, contact) => {
        acc = { ...acc, [contact.chatKey]: contact.unreadMessages }
        return acc
      }, {})
      const unreadMessagesContacts = contacts.reduce((acc, contact) => {
        acc = { ...acc, [contact.chatKey]: contact.unreadMessagesContact }
        return acc
      }, {})

      const contactsToDispatch = contacts.reduce((acc: { [key: string]: ContactInfoInterface }, contact) => {
        acc = { [contact.key]: { ...contact }, ...acc }
        return acc
      }, {})

      contactsDispatch({
        type: 'updateContactsInitial',
        payload: { contacts: contactsToDispatch, unreadMessages, unreadMessagesContacts },
      })

      newLoad.current = false
      setInitialLoading(false)
    } else {
      contactsDispatch({
        type: 'updateContacts',
        payload: { contacts: contactsData },
      })
    }
  }

  useEffect(() => {
    contactsListRef
      .orderByChild('pinned_lastActivityTS')
      .limitToLast(CONTACTS_TO_LOAD)
      .on('value', (snapshot: any) => getContactsList(snapshot))

    const contactsAmountListener = contactsDatabaseRef.child('contactsAmount').on('value', (snapshot: any) => {
      setAllContactsAmount(snapshot.val())
    })

    return () => {
      contactsListRef.off()
      contactsDatabaseRef.child('contactsAmount').off('value', contactsAmountListener)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isScrolledDown) return
    if (groupCreation.isActive) return
    if (loadedContacts >= allContactsAmount!) return

    contactsListRef.off()
    newLoad.current = true
    contactsListRef
      .orderByChild('pinned_lastActivityTS')
      .limitToLast(loadedContacts + CONTACTS_TO_LOAD)
      .on('value', (snapshot: any) => getContactsList(snapshot))
  }, [isScrolledDown, groupCreation]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={classNames('contact-list', {
        'contact-list--no-contacts': !initialLoadingRef.current && !contactsData?.length,
        'contact-list--group-creation-active': groupCreation.isActive,
      })}
    >
      {initialLoading ? (
        <div className="contact-list__loader-wrapper">
          <span className="contact-list__loader" />
        </div>
      ) : !contactsData?.length ? (
        <div className="contact-list--no-contacts-text">You don't have any contacts</div>
      ) : (
        contactsData?.map((contact) => (contact.removedFromGroup ? (
          <ContactRemovedFromGroup key={contact.key} contactInfo={contact} allContactsAmount={allContactsAmount} />
          ) : (
            <Contact key={contact.key} contactInfo={contact} allContactsAmount={allContactsAmount} />
          )))
      )}

      {errors.error && <CreatePortal element={<ModalContent message={errors.error.message} />} />}
    </div>
  )
}

export default ContactList
