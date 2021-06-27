import classNames from "classnames"
import { ContactInfoInterface, GroupCreationNewMemberInterface } from "Components/Pages/Contacts/@Types"
import { ContactsContext } from "Components/Pages/Contacts/Components/@Context/ContactsContext"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import useTimestampFormater from "Components/Pages/Contacts/Hooks/UseTimestampFormater"
import React, { useState, useEffect, useContext, useMemo } from "react"
import "./Contact.scss"

type Props = {
  contact: ContactInfoInterface
  selectedMembers: GroupCreationNewMemberInterface[]
  handleNewMembers: ({
    contact,
    formatedDate
  }: {
    contact: ContactInfoInterface
    formatedDate: string | number | null
  }) => void
}

const Contact: React.FC<Props> = ({ contact, selectedMembers, handleNewMembers }) => {
  const { contactsState } = useFrequentVariables()
  const { activeChat, chatMembersStatus } = contactsState
  const chatMembersStatusKeysMemo = useMemo(
    () => chatMembersStatus[activeChat.chatKey].map((member) => member.key) || [],
    []
  )
  const formatedDate = useTimestampFormater({ timeStamp: contact.lastSeen! })

  return (
    <div
      className={classNames("contact-item", {
        "contact-item--selected": chatMembersStatusKeysMemo.includes(contact.key),
        "contact-item--new-member": selectedMembers.map((item) => item.key).includes(contact.key)
      })}
      key={contact.key}
      onClick={() => {
        if (chatMembersStatusKeysMemo.includes(contact.key)) return
        handleNewMembers({ contact, formatedDate })
      }}
    >
      <div className="contact-item__select">
        <button type="button"></button>
      </div>

      <div className="contact-item__info">
        <div className="contact-item__username">{contact.userName}</div>
        <div
          className={classNames("contact-item__status", {
            "contact-item__status--online": contact.isOnline || chatMembersStatusKeysMemo.includes(contact.key)
          })}
        >
          {chatMembersStatusKeysMemo.includes(contact.key)
            ? "Allready a member"
            : contact.isOnline
            ? "Online"
            : formatedDate
            ? `Last seen: ${formatedDate}`
            : "Long time ago"}
        </div>
      </div>
    </div>
  )
}

export default Contact
