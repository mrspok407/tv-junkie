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
  const renderStatus = () => {
    if (member.isOnline) return 'Online'
    if (formatedDate) return `Last seen: ${formatedDate}`
    return 'Long time ago'
  }
  return (
    <div className="contact-item" key={member.key}>
      <div className="contact-item__info">
        <div className="contact-item__username">{member.userName}</div>
        <div
          className={classNames('contact-item__status', {
            'contact-item__status--online': member.isOnline,
          })}
        >
          {renderStatus()}
        </div>
      </div>
    </div>
  )
}

export default Contact
