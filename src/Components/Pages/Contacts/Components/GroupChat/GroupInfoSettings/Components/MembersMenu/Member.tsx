import classNames from "classnames"
import { ContactInfoInterface, MembersStatusGroupChatInterface } from "Components/Pages/Contacts/@Types"
import { ContactsContext } from "Components/Pages/Contacts/Components/@Context/ContactsContext"
import useTimestampFormater from "Components/Pages/Contacts/Hooks/UseTimestampFormater"
import React, { useState, useEffect, useContext } from "react"

type Props = {
  member: MembersStatusGroupChatInterface
}

const Contact: React.FC<Props> = ({ member }) => {
  const context = useContext(ContactsContext)
  const formatedDate = useTimestampFormater({ timeStamp: member.lastSeen! })

  return (
    <div className={classNames("contact-item member-item", {})} key={member.key}>
      <div className="contact-item__info">
        <div className="contact-item__username">{member.username}</div>
        <div
          className={classNames("contact-item__status", {
            "contact-item__status--online": member.isOnline
          })}
        >
          {member.isOnline ? "Online" : ""}
        </div>
      </div>
    </div>
  )
}

export default Contact
