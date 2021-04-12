import React from "react"
import { ContactInfoInterface } from "./ContactList"

type Props = {
  contactInfo: ContactInfoInterface
}

const Contact: React.FC<Props> = ({ contactInfo }) => {
  const timeStamp = new Date(Number(contactInfo.pinned_lastActivityTS.slice(-13))).toLocaleDateString()
  return (
    <div className="contact-item">
      <div className="contact-item__username">{contactInfo.userName}</div>
      <div className="contact-item__timestamp">{timeStamp}</div>
    </div>
  )
}

export default Contact
