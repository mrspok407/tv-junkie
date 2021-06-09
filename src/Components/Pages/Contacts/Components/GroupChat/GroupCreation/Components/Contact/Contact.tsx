import { ContactInfoInterface } from "Components/Pages/Contacts/@Types"
import { ContactsContext } from "Components/Pages/Contacts/Components/@Context/ContactsContext"
import useTimestampFormater from "Components/Pages/Contacts/Hooks/UseTimestampFormater"
import React, { useState, useEffect, useContext } from "react"
import "./Contact.scss"

type Props = {
  contact: ContactInfoInterface
}

const Contact: React.FC<Props> = ({ contact }) => {
  const context = useContext(ContactsContext)
  const { contactsStatus } = context?.state!

  const formatedDate = useTimestampFormater({ timeStamp: contactsStatus[contact.chatKey]?.lastSeen! })

  return (
    <div className="contact-item" key={contact.key}>
      <div className="contact-item__select">
        <button type="button"></button>
      </div>
      <div className="contact-item__info">
        <div className="contact-item__username">{contact.userName}</div>
        <div className="contact-item__status">
          {contactsStatus[contact.chatKey]?.isOnline
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
