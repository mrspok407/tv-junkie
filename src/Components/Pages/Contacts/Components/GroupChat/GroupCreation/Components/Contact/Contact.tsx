import classNames from "classnames"
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
  const { contactsStatus, groupCreation } = context?.state!
  const membersData = groupCreation.members.map((member) => member.key)

  const formatedDate = useTimestampFormater({ timeStamp: contactsStatus[contact.chatKey]?.lastSeen! })

  return (
    <div
      className={classNames("contact-item", {
        "contact-item--selected": membersData.includes(contact.key)
      })}
      key={contact.key}
      onClick={() =>
        context?.dispatch({
          type: "updateCreateNewGroup",
          payload: { isActive: null, newMember: { key: contact.key, username: contact.userName } }
        })
      }
    >
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
