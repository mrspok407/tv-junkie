import classNames from 'classnames'
import React, { useRef } from 'react'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { MessageInterface } from '../../../../@Types'
import MessagePopup from './MessagePopup'
import './MessageInfo.scss'

type Props = { messageData: MessageInterface }

const MessageInfo: React.FC<Props> = ({ messageData }) => {
  const { authUser, contactsState, contactsDispatch } = useFrequentVariables()
  const { activeChat, messagePopup, contactsUnreadMessages, contacts } = contactsState
  const contactInfo = contacts[activeChat.contactKey] || {}
  const contactsUnreadMessagesData = contactsUnreadMessages[activeChat.chatKey]

  const messageOptionsRef = useRef<HTMLDivElement>(null!)

  return (
    <div className="chat-window__message-info">
      {contactInfo.isGroupChat ? (
        <div
          ref={messageOptionsRef}
          className={classNames('chat-window__message-options', {
            'chat-window__message-options--hide': messageData.sender !== authUser?.uid || contactInfo.removedFromGroup,
          })}
        >
          <button
            type="button"
            className={classNames('chat-window__open-popup-btn', {
              'chat-window__open-popup-btn--open': messagePopup === messageData.key,
            })}
            onClick={(e) => {
              e.stopPropagation()
              contactsDispatch({ type: 'updateMessagePopup', payload: messageData.key })
            }}
          >
            <span />
            <span />
            <span />
          </button>

          {messagePopup === messageData.key && (
            <MessagePopup messageOptionsRef={messageOptionsRef.current} messageData={messageData} />
          )}
        </div>
      ) : (
        <div
          ref={messageOptionsRef}
          className={classNames('chat-window__message-options', {
            'chat-window__message-options--hide': contactInfo.status !== true,
          })}
        >
          <button
            type="button"
            className={classNames('chat-window__open-popup-btn', {
              'chat-window__open-popup-btn--open': messagePopup === messageData.key,
            })}
            onClick={(e) => {
              e.stopPropagation()
              contactsDispatch({ type: 'updateMessagePopup', payload: messageData.key })
            }}
          >
            <span />
            <span />
            <span />
          </button>

          {messagePopup === messageData.key && (
            <MessagePopup messageOptionsRef={messageOptionsRef.current} messageData={messageData} />
          )}
        </div>
      )}

      {messageData.sender === authUser?.uid && !contactInfo.isGroupChat && (
        <div
          className={classNames('chat-window__message-status', {
            'chat-window__message-status--read': !contactsUnreadMessagesData?.includes(messageData.key),
            'chat-window__message-status--deliver-failed': messageData.isDelivered === false,
            'chat-window__message-status--loading': contactsUnreadMessagesData === null,
          })}
        />
      )}
      {messageData.isDelivered === false && contactInfo.isGroupChat && (
        <div
          className={classNames('chat-window__message-status', {
            'chat-window__message-status--deliver-failed': messageData.isDelivered === false,
          })}
        />
      )}
      <div className="chat-window__message-timestamp">
        <div>
          {' '}
          {new Date(Number(messageData.timeStamp)).toLocaleTimeString().slice(0, -3)}
        </div>
        <div className="chat-window__message-edited">{messageData.isEdited && 'edited'}</div>
      </div>
    </div>
  )
}

export default MessageInfo
