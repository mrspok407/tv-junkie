import classNames from "classnames"
import { MessageInterface } from "Components/Pages/Contacts/@Types"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import React, { useState, useEffect } from "react"
import "./InfoMessage.scss"

type Props = {
  renderedMessage: MessageInterface
}

const InfoMessage: React.FC<Props> = ({ renderedMessage }) => {
  const { authUser } = useFrequentVariables()
  const newMembers = Object.values(renderedMessage.newMembers || {})
    .map((member) => member.username)
    .join(", ")

  const { removedMember, leftMember } = renderedMessage
  const isAuthUser = removedMember?.key === authUser?.uid

  return (
    <div className="chat-window__message-wrapper chat-window__message-wrapper--info-message">
      <div
        className={classNames(`chat-window__message chat-window__message--${renderedMessage.key}`, {})}
        data-key={renderedMessage.key}
      >
        <div className="chat-window__message-inner-wrapper">
          <div className="chat-window__message-inner">
            {removedMember ? (
              <div className="chat-window__message-text">
                {isAuthUser ? "You" : `${removedMember.username}`}{" "}
                <span>{isAuthUser ? "were" : "was"} removed from this group</span>
              </div>
            ) : leftMember ? (
              <div className="chat-window__message-text">
                {leftMember.username} <span>left the group</span>
              </div>
            ) : (
              <div className="chat-window__message-text">
                {newMembers} <span>joined the group</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfoMessage
