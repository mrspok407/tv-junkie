import classNames from 'classnames'
import { ContactInfoInterface, MembersStatusGroupChatInterface } from 'Components/Pages/Contacts/@Types'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import useTimestampFormater from 'Components/Pages/Contacts/Hooks/UseTimestampFormater'
import React from 'react'
import useRemoveMember from './Hooks/UseRemoveMember'

type Props = {
  member: MembersStatusGroupChatInterface
  contactInfo: ContactInfoInterface
}

const Contact: React.FC<Props> = ({ member, contactInfo }) => {
  const { authUser } = useFrequentVariables()
  const formattedDate = useTimestampFormater({ timeStamp: member.lastSeen! })

  const { removeMember, removeMemberLoading } = useRemoveMember()

  const renderStatus = () => {
    if (member.isOnline) return 'Online in chat'
    if (formattedDate) return `Last seen: ${formattedDate}`
    return 'Long time ago'
  }

  return (
    <div className={classNames('contact-item member-item', {})} key={member.key}>
      <div className="contact-item__info">
        <div
          className={classNames('contact-item__username', {
            'contact-item__username--admin': member.role === 'ADMIN',
          })}
        >
          {member.userName}
        </div>
        <div
          className={classNames('contact-item__status', {
            'contact-item__status--online': member.isOnline,
          })}
        >
          {renderStatus()}
        </div>
      </div>
      {contactInfo.role === 'ADMIN' && member.key !== authUser?.uid && (
        <div className="member-item__remove">
          <button type="button" className="member-item__remove-btn" onClick={() => removeMember({ member })}>
            {removeMemberLoading ? <span className="button-loader-circle" /> : 'Remove'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Contact
