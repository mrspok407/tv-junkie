import classNames from "classnames"
import { MessageInterface } from "Components/Pages/Contacts/@Types"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import React from "react"
import "./InfoMessage.scss"

type Props = {
  renderedMessage: MessageInterface
  privateChat?: boolean
}

const InfoMessage: React.FC<Props> = ({ renderedMessage, privateChat = false }) => {
  const { authUser, contactsState } = useFrequentVariables()
  const { activeChat, contacts } = contactsState
  const contactInfo = contacts[activeChat.contactKey]
  const newMembers = Object.values(renderedMessage.newMembers || {})
    .map((member) => member.userName)
    .join(", ")

  const { removedMember, leftMember, isRemovedFromContacts, isNowContacts } = renderedMessage
  const isAuthUser = removedMember?.key === authUser?.uid

  return (
    <div className="chat-window__message-wrapper chat-window__message-wrapper--info-message">
      <div
        className={classNames(`chat-window__message chat-window__message--${renderedMessage.key}`, {})}
        data-key={renderedMessage.key}
      >
        <div className="chat-window__message-inner-wrapper">
          {!privateChat ? (
            <div className="chat-window__message-inner">
              {removedMember ? (
                <div className="chat-window__message-text">
                  {isAuthUser ? "You" : `${removedMember.userName}`}{" "}
                  <span>{isAuthUser ? "were" : "was"} removed from this group</span>
                </div>
              ) : leftMember ? (
                <div className="chat-window__message-text">
                  {leftMember.userName} <span>left the group</span>
                </div>
              ) : (
                <div className="chat-window__message-text">
                  {newMembers} <span>joined the group</span>
                </div>
              )}
            </div>
          ) : isRemovedFromContacts ? (
            <div className="chat-window__message-inner">
              <div className="chat-window__message-text">
                {renderedMessage.sender !== authUser?.uid ? (
                  <>
                    {contactInfo.userName} <span>removed you from contacts</span>
                  </>
                ) : (
                  <>
                    <span>You remove</span> {contactInfo.userName} <span>from contacts</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            isNowContacts && (
              <div className="chat-window__message-inner">
                <div className="chat-window__message-text">
                  <span>You are now have connection with</span> {contactInfo.userName}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default InfoMessage
