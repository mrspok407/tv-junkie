import classNames from 'classnames'
import { GroupCreationNewMemberInterface } from 'Components/Pages/Contacts/@Types'
import useTimestampFormater from 'Components/Pages/Contacts/Hooks/UseTimestampFormater'
import React from 'react'
import './Contact.scss'

type Props = {
  member: GroupCreationNewMemberInterface
}

const Contact: React.FC<Props> = ({ member }) => {
  const formatedDate = useTimestampFormater({ timeStamp: member.lastSeen! })
  return (
    <div className="contact-item" key={member.key}>
      <div className="contact-item__info">
        <div className="contact-item__username">{member.userName}</div>
        <div
          className={classNames('contact-item__status', {
            'contact-item__status--online': member.isOnline,
          })}
        >
          {member.isOnline ? 'Online' : formatedDate ? `Last seen: ${formatedDate}` : 'Long time ago'}
        </div>
      </div>
    </div>
  )
}

export default Contact
