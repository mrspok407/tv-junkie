import classNames from 'classnames'
import { ContactInfoInterface } from 'Components/Pages/Contacts/@Types'
import { ContactsContext } from 'Components/Pages/Contacts/Components/@Context/ContactsContext'
import useTimestampFormater from 'Components/Pages/Contacts/Hooks/UseTimestampFormater'
import React, { useContext } from 'react'
import './Contact.scss'

type Props = {
  contact: ContactInfoInterface
  isGroupInfoSearch?: boolean
}

const Contact: React.FC<Props> = ({ contact, isGroupInfoSearch = false }) => {
  const context = useContext(ContactsContext)
  const { groupCreation } = context?.state!
  const membersKeys = groupCreation.members.map((member) => member.key)

  const formatedDate = useTimestampFormater({ timeStamp: contact.lastSeen! })

  const renderStatus = () => {
    if (contact.isOnline) return 'Online'
    if (formatedDate) return `Last seen: ${formatedDate}`
    return 'Long time ago'
  }

  return (
    <div
      className={classNames('contact-item', {
        'contact-item--selected': membersKeys.includes(contact.key),
        'member-item': isGroupInfoSearch,
      })}
      key={contact.key}
      onClick={() =>
        context?.dispatch({
          type: 'updateGroupMembers',
          payload: {
            removeMember: membersKeys.includes(contact.key),
            newMember: {
              key: contact.key,
              userName: contact.userName,
              lastSeen: formatedDate,
              chatKey: contact.chatKey,
            },
          },
        })
      }
    >
      <div className="contact-item__select">
        <button type="button" />
      </div>
      <div className="contact-item__info">
        <div className="contact-item__username">{contact.userName}</div>
        <div
          className={classNames('contact-item__status', {
            'contact-item__status--online': contact.isOnline,
          })}
        >
          {renderStatus()}
        </div>
      </div>
    </div>
  )
}

export default Contact
