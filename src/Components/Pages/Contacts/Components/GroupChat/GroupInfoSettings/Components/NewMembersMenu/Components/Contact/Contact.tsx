/* eslint-disable no-nested-ternary */
import React, { useMemo } from 'react'
import { ContactInfoInterface, GroupCreationNewMemberInterface } from 'Components/Pages/Contacts/@Types'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import useTimestampFormater from 'Components/Pages/Contacts/Hooks/UseTimestampFormater'
import classNames from 'classnames'
import './Contact.scss'

type Props = {
  contact: ContactInfoInterface
  selectedMembers: GroupCreationNewMemberInterface[]
  handleNewMembers: ({
    contact,
    formatedDate,
  }: {
    contact: ContactInfoInterface
    formatedDate: string | number | null
  }) => void
}

const Contact: React.FC<Props> = ({ contact, selectedMembers, handleNewMembers }) => {
  const { contactsState } = useFrequentVariables()
  const { activeChat, chatParticipants } = contactsState
  const chatParticipantsMemo = useMemo(
    () => chatParticipants[activeChat.chatKey] || [],
    [activeChat.chatKey, chatParticipants],
  )
  const formatedDate = useTimestampFormater({ timeStamp: contact.lastSeen! })

  const renderStatus = () => {
    if (chatParticipantsMemo.includes(contact.key)) return 'Allready a member'
    if (contact.isOnline) return 'Online'
    if (formatedDate) return `Last seen: ${formatedDate}`
    return 'Long time ago'
  }

  return (
    <div
      className={classNames('contact-item', {
        'contact-item--selected': chatParticipantsMemo.includes(contact.key),
        'contact-item--new-member': selectedMembers.map((item) => item.key).includes(contact.key),
      })}
      key={contact.key}
      onClick={() => {
        if (chatParticipantsMemo.includes(contact.key)) return
        handleNewMembers({ contact, formatedDate })
      }}
    >
      <div className="contact-item__select">
        <button type="button" />
      </div>

      <div className="contact-item__info">
        <div className="contact-item__username">{contact.userName}</div>
        <div
          className={classNames('contact-item__status', {
            'contact-item__status--online': contact.isOnline || chatParticipantsMemo.includes(contact.key),
          })}
        >
          {renderStatus()}
        </div>
      </div>
    </div>
  )
}

export default Contact
