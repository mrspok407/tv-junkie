import classNames from "classnames"
import { ContactInfoInterface, MembersStatusGroupChatInterface } from "Components/Pages/Contacts/@Types"
import { ContactsContext } from "Components/Pages/Contacts/Components/@Context/ContactsContext"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import useTimestampFormater from "Components/Pages/Contacts/Hooks/UseTimestampFormater"
import React, { useState, useEffect, useContext } from "react"
import useRemoveMember from "./Hooks/UseRemoveMember"

type Props = {
  member: MembersStatusGroupChatInterface
  contactInfo: ContactInfoInterface
}

const Contact: React.FC<Props> = ({ member, contactInfo }) => {
  const { authUser, contactsState } = useFrequentVariables()
  const formatedDate = useTimestampFormater({ timeStamp: member.lastSeen! })

  const { removeMember } = useRemoveMember()

  return (
    <div className={classNames("contact-item member-item", {})} key={member.key}>
      <div className="contact-item__info">
        <div
          className={classNames("contact-item__username", {
            "contact-item__username--admin": member.role === "ADMIN"
          })}
        >
          {member.username}
        </div>
        <div
          className={classNames("contact-item__status", {
            "contact-item__status--online": member.isOnline
          })}
        >
          {member.isOnline ? "Online in chat" : formatedDate ? `Last seen: ${formatedDate}` : "Long time ago"}
        </div>
      </div>
      {contactInfo.role === "ADMIN" && member.key !== authUser?.uid && (
        <div className="member-item__remove">
          <button type="button" className="member-item__remove-btn" onClick={() => removeMember({ member })}>
            Remove
          </button>
        </div>
      )}
    </div>
  )
}

export default Contact
