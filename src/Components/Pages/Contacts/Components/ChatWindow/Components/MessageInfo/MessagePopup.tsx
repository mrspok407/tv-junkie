import classNames from 'classnames'
import { MessageInterface } from 'Components/Pages/Contacts/@Types'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import React, { useCallback } from 'react'
import useClickOutside from 'Utils/Hooks/UseClickOutside'
import useHandleMessageOptions from './FirebaseHelpers/UseHandleMessageOptions'

type Props = {
  messageOptionsRef: { current: HTMLDivElement }
  messageData: MessageInterface
}

const MessagePopup: React.FC<Props> = ({ messageOptionsRef, messageData }) => {
  const { authUser, contactsState, contactsDispatch } = useFrequentVariables()
  const { activeChat, messages, contacts } = contactsState
  const contactInfo = contacts[activeChat.chatKey] || {}
  const messagesData = messages[activeChat.chatKey] || []

  const { selectMessage, deleteMessagePrivateChat, deleteMessageGroupChat, editMessage } = useHandleMessageOptions({
    messageData,
  })

  const updateMessagePopup = useCallback(() => {
    contactsDispatch({ type: 'updateMessagePopup', payload: '' })
  }, [contactsDispatch])

  useClickOutside({ ref: messageOptionsRef, callback: updateMessagePopup })

  return (
    <div
      className={classNames('popup-container', {
        'popup-container--sended-message': messageData.sender === authUser?.uid,
        'popup-container--received-message': messageData.sender !== authUser?.uid,
        'popup-container--messages-less-two': messagesData.length <= 2,
        'popup-container--failed-deliver': messageData.isDelivered === false,
      })}
      onClick={(e) => {
        e.stopPropagation()
        contactsDispatch({ type: 'updateMessagePopup', payload: '' })
      }}
    >
      {messageData.sender === authUser?.uid && messageData.isDelivered !== false && (
        <div className="popup__option">
          <button className="popup__option-btn" type="button" onClick={() => editMessage()}>
            Edit
          </button>
        </div>
      )}

      <div className="popup__option">
        <button
          className="popup__option-btn"
          type="button"
          onClick={() => {
            if (contactInfo.isGroupChat) {
              deleteMessageGroupChat({ deleteMessagesKeys: [messageData.key] })
            } else {
              deleteMessagePrivateChat({ deleteMessagesKeys: [messageData.key] })
            }
          }}
        >
          Delete
        </button>
      </div>

      <div className="popup__option">
        <button className="popup__option-btn" type="button" onClick={() => selectMessage()}>
          Select
        </button>
      </div>
    </div>
  )
}

export default MessagePopup
