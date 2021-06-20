import classNames from "classnames"
import { MessageInterface } from "Components/Pages/Contacts/@Types"
import React, { useState, useEffect } from "react"
import "./NewMembersMessages.scss"

type Props = {
  renderedMessage: MessageInterface
}

const NewMembersMessages: React.FC<Props> = ({ renderedMessage }) => {
  const newMembers = Object.values(renderedMessage.members || {})
    .map((member) => member.username)
    .join(", ")

  return (
    <div
      className={classNames("chat-window__message-wrapper", {
        "chat-window__message-wrapper--new-members": renderedMessage.isNewMembers
      })}
    >
      <div
        className={classNames(`chat-window__message chat-window__message--${renderedMessage.key}`, {})}
        data-key={renderedMessage.key}
      >
        <div className="chat-window__message-inner-wrapper">
          <div className="chat-window__message-inner">
            <div className="chat-window__message-text">
              {newMembers} <span>joined the group</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewMembersMessages
