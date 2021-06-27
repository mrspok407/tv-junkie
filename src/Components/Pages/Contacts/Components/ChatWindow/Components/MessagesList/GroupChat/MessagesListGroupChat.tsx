import classNames from "classnames"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import React, { useState, useEffect } from "react"
import { convertTimeStampToDate } from "Utils"
import MessageInfo from "../../MessageInfo/MessageInfo"
import InfoMessage from "./Components/NewMembersMessages/InfoMessage"
import "./MessagesListGroupChat.scss"

type Props = {}

const MessagesList: React.FC<Props> = ({}) => {
  const { authUser, contactsContext, contactsState } = useFrequentVariables()
  const { activeChat, messages, renderedMessagesList, selectedMessages, contacts } = contactsState
  const messagesData = messages[activeChat.chatKey]
  const renderedMessages = renderedMessagesList[activeChat.chatKey] || []
  const selectedMessagesData = selectedMessages[activeChat.chatKey] || []
  const contactInfo = contacts[activeChat.contactKey] || {}

  return (
    <>
      {messagesData === undefined ? (
        <div className="chat-window__loader-container">
          <span className="chat-window__loader"></span>
        </div>
      ) : !messagesData?.length ? (
        <div className="chat-window__no-messages">
          The chat is very empty, <span>so sad</span>.
        </div>
      ) : (
        <div
          className={classNames("chat-window__messages-list", {
            "chat-window__messages-list--group-chat": contactInfo.isGroupChat
          })}
        >
          {renderedMessages?.map((renderedMessage, index, array) => {
            const nextMessage = array[index + 1]
            const prevMessage = array[Math.max(index - 1, 0)]

            const date = convertTimeStampToDate({ timeStamp: renderedMessage?.timeStamp })

            const currentMessageDate = new Date(renderedMessage?.timeStamp).toDateString()
            const prevMessageDate = new Date(prevMessage?.timeStamp).toDateString()

            return (
              <React.Fragment key={renderedMessage.key}>
                {currentMessageDate !== prevMessageDate || renderedMessage.timeStamp === prevMessage.timeStamp ? (
                  <div
                    key={renderedMessage.timeStamp}
                    className={classNames("chat-window__date", {
                      "chat-window__date--top": renderedMessage.timeStamp === prevMessage.timeStamp
                    })}
                    data-timestamp={renderedMessage.timeStamp}
                  >
                    {date}
                  </div>
                ) : (
                  ""
                )}
                {renderedMessage.isNewMembers || renderedMessage.isRemovedMember ? (
                  <InfoMessage renderedMessage={renderedMessage} />
                ) : (
                  <div
                    className={classNames("chat-window__message-wrapper", {
                      "chat-window__message-wrapper--new-bunch": renderedMessage.sender !== prevMessage.sender,
                      "chat-window__message-wrapper--last-in-bunch": renderedMessage.sender !== nextMessage?.sender,
                      // "chat-window__message-wrapper--send": renderedMessage.sender === authUser?.uid,
                      // "chat-window__message-wrapper--receive": renderedMessage.sender === activeChat.contactKey,
                      "chat-window__message-wrapper--selected": selectedMessagesData.includes(renderedMessage.key),
                      "chat-window__message-wrapper--selection-active": selectedMessagesData.length
                    })}
                    onClick={() => {
                      if (!selectedMessagesData.length || renderedMessage.sender !== authUser?.uid) return
                      contactsContext?.dispatch({
                        type: "updateSelectedMessages",
                        payload: { messageKey: renderedMessage.key, chatKey: activeChat.chatKey }
                      })
                    }}
                  >
                    {renderedMessage.sender !== nextMessage?.sender && renderedMessage.sender !== authUser?.uid && (
                      <div className="chat-window__message-avatar">{renderedMessage.username?.slice(0, 1)}</div>
                    )}
                    <div
                      className={classNames(`chat-window__message chat-window__message--${renderedMessage.key}`, {
                        "chat-window__message--auth-sender": renderedMessage.sender === authUser?.uid,
                        "chat-window__message--not-auth-sender": renderedMessage.sender !== authUser?.uid,
                        "chat-window__message--last-in-bunch": renderedMessage.sender !== nextMessage?.sender,
                        "chat-window__message--deliver-failed": renderedMessage.isDelivered === false,
                        "chat-window__message--selected": selectedMessagesData.includes(renderedMessage.key)
                      })}
                      data-key={renderedMessage.key}
                    >
                      <div className="chat-window__message-inner-wrapper">
                        {renderedMessage.sender !== authUser?.uid && renderedMessage.sender !== prevMessage.sender && (
                          <div className="chat-window__message-username">{renderedMessage.username}</div>
                        )}

                        <div className="chat-window__message-inner">
                          <div
                            className="chat-window__message-text"
                            dangerouslySetInnerHTML={{
                              __html: `${renderedMessage.message}`
                            }}
                          ></div>
                          <MessageInfo messageData={renderedMessage} />
                        </div>
                      </div>
                    </div>
                    {renderedMessage.sender === authUser?.uid && (
                      <button type="button" className="chat-window__select-btn"></button>
                    )}
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      )}
    </>
  )
}

export default MessagesList
