import classNames from "classnames"
import { FirebaseContext } from "Components/Firebase"
import React, { useContext, useEffect, useRef } from "react"
import ChatWindow from "./Components/ChatWindow/ChatWindow"
import ContactList from "./Components/ContactList/ContactList"
import ContactsContextHOC, { ContactsContext } from "./Components/@Context/ContactsContext"
import { MessageInterface } from "./@Types"
import { LoremIpsum } from "lorem-ipsum"
import { AppContext } from "Components/AppContext/AppContextHOC"
import ConfirmModal from "./Components/ChatWindow/Components/ConfirmModal/ConfirmModal"
import useContactOptions from "./Components/ContactOptionsPopup/Hooks/UseContactOptions"
import useSelectOptions from "./Components/ChatWindow/Components/SelectOptions/Hooks/UseSelectOptions"
import HandleNewMembers from "./Components/GroupChat/HandleNewMembers/HandleNewMembers"
import GroupCreation from "./Components/GroupChat/GroupCreation/GroupCreation"
import useFrequentVariables from "./Hooks/UseFrequentVariables"
import "./Components/ContactList/ContactList.scss"

const ContactsContent: React.FC = () => {
  const { firebase, authUser, contactsContext, contactsState } = useFrequentVariables()
  const { activeChat, contacts, messages, confirmModal, groupCreation } = contactsState

  const contactListWrapperRef = useRef<HTMLDivElement>(null!)
  const messagesRef = useRef<{ [key: string]: MessageInterface[] }>()
  const confirmModalFunctions = { ...useContactOptions({}), ...useSelectOptions() }

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    return () => {
      if (!messagesRef.current) return
      Object.keys(messagesRef.current).forEach((chatKey) => {
        let otherMemberKey: string
        if (authUser?.uid === chatKey.slice(0, authUser?.uid.length)) {
          otherMemberKey = chatKey.slice(authUser?.uid.length + 1)
        } else {
          otherMemberKey = chatKey.slice(0, -authUser?.uid.length! - 1)
        }

        firebase.messages({ chatKey, isGroupChat: contacts[chatKey]?.isGroupChat }).off()
        firebase.unreadMessages({ uid: otherMemberKey, chatKey, isGroupChat: false }).off()
        firebase.contactsDatabase({ uid: otherMemberKey }).child("pageIsOpen").off()
        firebase
          .chatMemberStatus({ chatKey, memberKey: otherMemberKey, isGroupChat: contacts[chatKey]?.isGroupChat })
          .off()
      })
    }
  }, [authUser, firebase])

  useEffect(() => {
    firebase.contactsDatabase({ uid: authUser?.uid }).update({ pageIsOpen: true })
    firebase.contactsDatabase({ uid: authUser?.uid }).onDisconnect().update({ pageIsOpen: null })
    return () => {
      firebase.contactsDatabase({ uid: authUser?.uid }).update({ pageIsOpen: null })
    }
  }, [])

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
        ) : contacts[activeChat.contactKey].removedFromGroup ? (
          <div className="chat-window-container chat-window-container--no-active-chat">
            <div className="chat-window">You were removed from this group</div>
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
