/* eslint-disable no-nested-ternary */
import classNames from 'classnames'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import useTimestampFormater from 'Components/Pages/Contacts/Hooks/UseTimestampFormater'
import React, { useRef } from 'react'
import { LoremIpsum } from 'lorem-ipsum'
import Loader from 'Components/UI/Placeholders/Loader'
import ContactOptionsPopup from '../../../ContactOptionsPopup/ContactOptionsPopup'
import './ContactInfo.scss'

type Props = {
  isScrollBottomRef: any
}

const ContactInfo: React.FC<Props> = ({ isScrollBottomRef }) => {
  const { firebase, authUser, newContactsActivity, contactsState, contactsDispatch } = useFrequentVariables()
  const { activeChat, contacts, contactsStatus, optionsPopupChatWindow, chatMembersStatus } = contactsState
  const contactInfo = contacts[activeChat.contactKey] || {}
  const chatMembersStatusData = chatMembersStatus[contactInfo.chatKey] || []
  const contactOptionsRef = useRef<HTMLDivElement>(null!)

  const formatedLastSeen = useTimestampFormater({ timeStamp: contactsStatus[activeChat.chatKey]?.lastSeen! })
  const chatMembersTyping = chatMembersStatusData?.filter((member) => member.isTyping && member.key !== authUser?.uid)

  const chatMembersOnline = chatMembersStatusData.filter((member) => member.isOnline).length

  const lorem = new LoremIpsum({
    sentencesPerParagraph: {
      max: 8,
      min: 4,
    },
    wordsPerSentence: {
      max: 8,
      min: 4,
    },
  })

  const sendMessageCurrentContactPrivate = async () => {
    const timeStampEpoch = new Date().getTime()
    const messageRef = firebase.privateChats().child(`${activeChat.chatKey}/messages`).push()
    const messageKey = messageRef.key

    const updateData: any = {
      [`privateChats/${activeChat.chatKey}/messages/${messageKey}`]: {
        sender: contactInfo.key,
        message: lorem.generateSentences(2),
        timeStamp: timeStampEpoch,
      },
      [`privateChats/${activeChat.chatKey}/members/${authUser?.uid}/unreadMessages/${messageKey}`]: !isScrollBottomRef
        ? true
        : null,
    }
    return firebase.database().ref().update(updateData)
  }

  const sendMessageCurrentContactGroup = () => {
    const timeStampEpoch = new Date().getTime()
    const messageRef = firebase.messages({ chatKey: activeChat.chatKey, isGroupChat: true }).push()
    const messageKey = messageRef.key

    const members = chatMembersStatusData.filter((member) => member.key !== authUser?.uid)
    const sender = members[Math.floor(Math.random() * members.length)]

    const updateData: any = {
      [`groupChats/${activeChat.chatKey}/messages/${messageKey}`]: {
        sender: sender.key,
        userName: sender.userName,
        message: lorem.generateSentences(2),
        timeStamp: timeStampEpoch,
      },
      [`groupChats/${activeChat.chatKey}/members/unreadMessages/${authUser?.uid}/${messageKey}`]: !isScrollBottomRef
        ? true
        : null,
    }
    return firebase.database().ref().update(updateData)
  }

  return (
    <div
      className={classNames('chat-window__contact-info', {
        'chat-window__contact-info--group-chat': contactInfo.isGroupChat,
        'chat-window__contact-info--test-msg': ['testchat@gmail.com', 'test2@test.com'].includes(authUser?.email!),
      })}
      onClick={() => {
        if (!contactInfo.isGroupChat) return
        contactsDispatch({ type: 'updateGroupInfoSettings' })
      }}
    >
      <div
        className={classNames('contact-info__close-chat', {
          'contact-info__close-chat--new-activity': newContactsActivity,
        })}
      >
        <button
          className="contact-info__close-chat-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            contactsDispatch({ type: 'updateActiveChat', payload: { chatKey: '', contactKey: '' } })
          }}
        />
      </div>
      <div className="contact-info__name">{contactInfo.userName || contactInfo.groupName}</div>
      <div ref={contactOptionsRef} className="contact-item__options contact-info__options">
        <button
          type="button"
          className={classNames('contact-item__open-popup-btn', {
            'contact-item__open-popup-btn--open': optionsPopupChatWindow,
          })}
          onClick={(e) => {
            e.stopPropagation()
            contactsDispatch({ type: 'updateOptionsPopupChatWindow', payload: activeChat.contactKey })
          }}
        >
          <span />
          <span />
          <span />
        </button>

        {optionsPopupChatWindow && (
          <ContactOptionsPopup contactOptionsRef={contactOptionsRef} contactInfo={contactInfo} />
        )}
      </div>
      <div className="contact-info__status">
        {contactInfo.isGroupChat ? (
          chatMembersTyping.length ? (
            chatMembersTyping.length === 1 ? (
              <>
                <div>Someone typing</div> <Loader className="loader--typing" />
              </>
            ) : (
              <>
                <div>{chatMembersTyping.length} people typing</div> <Loader className="loader--typing" />
              </>
            )
          ) : !chatMembersStatusData.length ? (
            ''
          ) : chatMembersStatusData.length === 1 ? (
            '1 member'
          ) : (
            `${chatMembersStatusData.length} members${chatMembersOnline ? `, ${chatMembersOnline} online` : ''}`
          )
        ) : contactsStatus[activeChat.chatKey]?.isTyping ? (
          <>
            <div>Typing</div> <Loader className="loader--typing" />
          </>
        ) : contactsStatus[activeChat.chatKey]?.isOnline ? (
          'Online'
        ) : formatedLastSeen ? (
          `Last seen ${formatedLastSeen}`
        ) : (
          ''
        )}
      </div>
      {['testchat@gmail.com', 'test2@test.com'].includes(authUser?.email!) && (
        <div className="contact-info__send-message-current">
          <button
            type="button"
            className="button"
            onClick={(e) => {
              e.stopPropagation()
              if (contactInfo.isGroupChat) {
                sendMessageCurrentContactGroup()
              } else {
                sendMessageCurrentContactPrivate()
              }
            }}
          >
            Test msg
          </button>
        </div>
      )}
    </div>
  )
}

export default ContactInfo
