import React, { useContext, useCallback } from 'react'
import useClickOutside from 'Utils/Hooks/UseClickOutside'
import { ContactInfoInterface } from '../../@Types'
import { ContactsContext } from '../@Context/ContactsContext'
import useContactOptions from './Hooks/UseContactOptions'
import './ContactOptionsPopup.scss'

type Props = {
  contactOptionsRef: { current: HTMLDivElement }
  contactInfo: ContactInfoInterface
}

const ContactOptionsPopup: React.FC<Props> = ({ contactOptionsRef, contactInfo }) => {
  const context = useContext(ContactsContext)
  const optionsHandler = useContactOptions({ contactInfo })

  const handleClosePopups = useCallback(() => {
    context?.dispatch({ type: 'closePopups', payload: '' })
  }, [context])

  useClickOutside({ ref: contactOptionsRef, callback: handleClosePopups })

  const isPinned = !!(contactInfo.pinned_lastActivityTS?.slice(0, 4) === 'true')

  return (
    <div className="popup-container">
      <div className="popup__option">
        {isPinned ? (
          <button
            className="popup__option-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              optionsHandler.updateIsPinned()
            }}
          >
            Unpin from top
          </button>
        ) : (
          <button
            className="popup__option-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              optionsHandler.updateIsPinned()
            }}
          >
            Pin to top
          </button>
        )}
      </div>
      {!contactInfo.isGroupChat && (
        <>
          <div className="popup__option">
            <a
              onClick={(e) => {
                e.stopPropagation()
                context?.dispatch({ type: 'closePopups', payload: '' })
              }}
              className="popup__option-btn"
              href={`${
                process.env.NODE_ENV === 'production'
                  ? `https://www.tv-junkie.com/user/${contactInfo.key}`
                  : `http://localhost:3000/user/${contactInfo.key}`
              }`}
              rel="noopener noreferrer"
              target="_blank"
            >
              View profile
            </a>
          </div>
          {contactInfo.status === true && (
            <div className="popup__option">
              <button
                className="popup__option-btn"
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  context?.dispatch({
                    type: 'updateConfirmModal',
                    payload: { isActive: true, function: 'handleClearHistory', contactKey: contactInfo.key },
                  })
                }}
              >
                Clear history
              </button>
            </div>
          )}
        </>
      )}

      {!contactInfo.removedFromGroup && !contactInfo.chatDeleted && (
        <div className="popup__option">
          <button
            className="popup__option-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              optionsHandler.handleMarkRead()
            }}
          >
            Mark as read
          </button>
        </div>
      )}

      {contactInfo.isGroupChat && (
        <div className="popup__option">
          <button
            className="popup__option-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              context?.dispatch({
                type: 'updateConfirmModal',
                payload: {
                  isActive: true,
                  function: `${contactInfo.role === 'ADMIN' ? 'handleDeleteChat' : 'handleLeaveChat'}`,
                  contactKey: contactInfo.key,
                },
              })
            }}
          >
            {contactInfo.role === 'ADMIN' ? 'Delete chat' : 'Leave chat'}
          </button>
        </div>
      )}

      {contactInfo.receiver === true ? (
        <div className="popup__option">
          <button
            className="popup__option-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              context?.dispatch({
                type: 'updateConfirmModal',
                payload: {
                  isActive: true,
                  function: 'handleRemoveContact',
                  contactKey: contactInfo.key,
                },
              })
            }}
          >
            Remove from contacts
          </button>
        </div>
      ) : (
        ['removed', 'rejected', true].includes(contactInfo.status) && (
          <div className="popup__option">
            <button
              className="popup__option-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                context?.dispatch({
                  type: 'updateConfirmModal',
                  payload: {
                    isActive: true,
                    function: 'handleRemoveContact',
                    contactKey: contactInfo.key,
                  },
                })
              }}
            >
              Remove from contacts
            </button>
          </div>
        )
      )}
    </div>
  )
}

export default ContactOptionsPopup
