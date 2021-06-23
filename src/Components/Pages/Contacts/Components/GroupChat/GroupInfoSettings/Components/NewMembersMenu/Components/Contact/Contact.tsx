import classNames from "classnames"
import { ContactInfoInterface } from "Components/Pages/Contacts/@Types"
import { ContactsContext } from "Components/Pages/Contacts/Components/@Context/ContactsContext"
import useTimestampFormater from "Components/Pages/Contacts/Hooks/UseTimestampFormater"
import React, { useState, useEffect, useContext } from "react"
import "./Contact.scss"

type Props = {
  contact: ContactInfoInterface
  membersKeys: string[]
  handleNewMembers: (memberKey: string) => void
}

const Contact: React.FC<Props> = ({ contact, membersKeys, handleNewMembers }) => {
  const formatedDate = useTimestampFormater({ timeStamp: contact.lastSeen! })

  return (
    <div
      className={classNames("contact-item", {
        "contact-item--selected": membersKeys.includes(contact.key)
      })}
      key={contact.key}
      onClick={() => handleNewMembers(contact.key)}
    >
      <div className="contact-item__select">
        <button type="button"></button>
      </div>
      <div className="contact-item__info">
        <div className="contact-item__username">{contact.userName}</div>
        <div
          className={classNames("contact-item__status", {
            "contact-item__status--online": contact.isOnline
          })}
        >
          {contact.isOnline ? "Online" : formatedDate ? `Last seen: ${formatedDate}` : "Long time ago"}
        </div>
      </div>
    </div>
  )
}

export default Contact
