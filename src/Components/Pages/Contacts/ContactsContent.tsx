import classNames from "classnames"
import React, { useEffect, useRef } from "react"
import ChatWindow from "./Components/ChatWindow/ChatWindow"
import ContactList from "./Components/ContactList/ContactList"
import ContactsContextHOC from "./Components/@Context/ContactsContext"
import { ContactInfoInterface } from "./@Types"
import ConfirmModal from "./Components/ChatWindow/Components/ConfirmModal/ConfirmModal"
import useContactOptions from "./Components/ContactOptionsPopup/Hooks/UseContactOptions"
import useSelectOptions from "./Components/ChatWindow/Components/SelectOptions/Hooks/UseSelectOptions"
import HandleNewMembers from "./Components/GroupChat/HandleNewMembers/HandleNewMembers"
import GroupCreation from "./Components/GroupChat/GroupCreation/GroupCreation"
import useFrequentVariables from "./Hooks/UseFrequentVariables"
import "./Components/ContactList/ContactList.scss"

const ContactsContent: React.FC = () => {
  const { firebase, authUser, contactsContext, contactsState, contactsDispatch } = useFrequentVariables()
  const { activeChat, contacts, messages, confirmModal, groupCreation } = contactsState

  const contactListWrapperRef = useRef<HTMLDivElement>(null!)
  const contactsRef = useRef<{ [key: string]: ContactInfoInterface }>()
  const confirmModalFunctions = { ...useContactOptions({}), ...useSelectOptions() }

  useEffect(() => {
    contactsRef.current = contacts
  }, [messages, contacts])

  useEffect(() => {
    return () => {
      console.log({ contactsRef: contactsRef.current })
      if (!contactsRef.current) return
      Object.values(contactsRef.current).forEach((contact) => {
        firebase.messages({ chatKey: contact.chatKey, isGroupChat: contact.isGroupChat }).off()
        firebase.unreadMessages({ uid: contact.key, chatKey: contact.chatKey, isGroupChat: false }).off()
        firebase.contactsDatabase({ uid: contact.key }).child("pageIsOpen").off()
        firebase
          .chatMemberStatus({ chatKey: contact.chatKey, memberKey: contact.key, isGroupChat: contact.isGroupChat })
          .off()
        if (contact.isGroupChat) {
          firebase.groupChatMembersStatus({ chatKey: contact.chatKey }).off()
          firebase.groupChatParticipants({ chatKey: contact.chatKey }).off()
        }
      })
    }
  }, [authUser, firebase])

  useEffect(() => {
    firebase.contactsDatabase({ uid: authUser?.uid }).update({ pageIsOpen: true })
    firebase.contactsDatabase({ uid: authUser?.uid }).onDisconnect().update({ pageIsOpen: null })
    return () => {
      firebase.contactsDatabase({ uid: authUser?.uid }).update({ pageIsOpen: null })
    }
  }, [authUser, firebase])

  return (
    <>
      <div className="chat-container">
        <div
          className={classNames("contact-list-wrapper", {
            "contact-list-wrapper--hide-mobile": contactsContext?.state.activeChat.chatKey,
            "contact-list-wrapper--group-creation-active": groupCreation.isActive
          })}
          ref={contactListWrapperRef}
        >
          <ContactList contactListWrapperRef={contactListWrapperRef.current} />
          {groupCreation.isActive && <GroupCreation contactListWrapperRef={contactListWrapperRef.current} />}
        </div>
        {!groupCreation.isActive && Object.values(contacts).filter((contact) => contact.status === true).length ? (
          <HandleNewMembers />
        ) : groupCreation.members.length && !groupCreation.error ? (
          <HandleNewMembers />
        ) : (
          ""
        )}

        {activeChat.chatKey === "" || !contacts[activeChat.contactKey] ? (
          !Object.keys(contacts)?.length ? (
            ""
          ) : (
            <div className="chat-window-container chat-window-container--no-active-chat">
              <div className="chat-window">Select a chat to start messaging</div>
            </div>
          )
        ) : contacts[activeChat.contactKey].chatDeleted ? (
          <div className="chat-window-container chat-window-container--no-active-chat">
            <div className="chat-window">This chat was deleted by it's admin</div>
          </div>
        ) : contacts[activeChat.contactKey].removedFromGroup ? (
          <div className="chat-window-container chat-window-container--no-active-chat chat-window-container--removed-from-group">
            <div className="chat-window">You were removed from this group</div>
            <div className="chat-window__go-back">
              <button
                className="chat-window__go-back-btn"
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  contactsDispatch({ type: "updateActiveChat", payload: { chatKey: "", contactKey: "" } })
                }}
              >
                Go back
              </button>
            </div>
          </div>
        ) : (
          <ChatWindow />
        )}
        {confirmModal.isActive && <ConfirmModal confirmFunctions={confirmModalFunctions} />}
      </div>
    </>
  )
}

export default ContactsContextHOC(ContactsContent)
