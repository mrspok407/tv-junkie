import { ContactsInterface, ContactsStateInterface, MessageInterface } from "../../Types"
import { MESSAGES_TO_RENDER, UNREAD_MESSAGES_TO_RENDER } from "./Constants"

export type ACTIONTYPES =
  | { type: "updateContactUnreadMessages"; payload: string[] }
  | { type: "updateAuthUserUnreadMessages"; payload: { chatKey: string; unreadMessages: number } }
  | { type: "updateActiveChat"; payload: { chatKey: string; contactKey: string } }
  | {
      type: "setInitialMessages"
      payload: { messagesData: MessageInterface[]; startIndex?: number; endIndex?: number; chatKey: string }
    }
  | { type: "loadTopMessages"; payload: { newTopMessages: MessageInterface[] } }
  | { type: "updateRenderedMessages"; payload: { startIndex?: number; endIndex?: number; chatKey: string } }
  | { type: "renderTopMessages" }
  | { type: "addNewMessage"; payload: { newMessage: MessageInterface; chatKey: string } }
  | { type: "removeMessage"; payload: { removedMessage: MessageInterface; chatKey: string } }
  | { type: "changeMessage"; payload: { changedMessage: MessageInterface; chatKey: string } }
  | { type: "updateContacts"; payload: ContactsInterface }
  | { type: "updateLastScrollTop"; payload: { scrollTop: number; chatKey: string } }
  | { type: "updateMessagePopup"; payload: string }
  | { type: "updateContactPopup"; payload: string }

const reducer = (state: ContactsStateInterface, action: ACTIONTYPES) => {
  const {
    contactsUnreadMessages,
    authUserUnreadMessages,
    activeChat,
    messages,
    renderedMessages,
    renderedMessagesList,
    messagePopup,
    contactPopup,
    lastScrollTop
  } = state

  switch (action.type) {
    case "setInitialMessages":
      console.log(action.payload.startIndex)
      console.log(action.payload.endIndex)
      const { startIndex, endIndex } = action.payload
      return {
        ...state,
        messages: {
          ...messages,
          [action.payload.chatKey]: action.payload.messagesData
        },
        renderedMessagesList: {
          ...renderedMessagesList,
          [action.payload.chatKey]: action.payload.messagesData.slice(startIndex, endIndex)
        }
      }

    case "loadTopMessages":
      return {
        ...state,
        messages: {
          ...messages,
          [activeChat.chatKey]: [...action.payload.newTopMessages, ...messages[activeChat.chatKey]]
        }
      }

    case "renderTopMessages":
      console.log(renderedMessages[activeChat.chatKey])
      if (messages[activeChat.chatKey][0].key === renderedMessagesList[activeChat.chatKey][0].key) {
        return { ...state }
      }

      const indexStart = Math.max(
        messages[activeChat.chatKey].findIndex((item) => item.key === renderedMessagesList[activeChat.chatKey][0].key) -
          (MESSAGES_TO_RENDER - 50),
        0
      )
      const indexEnd = indexStart + MESSAGES_TO_RENDER
      // const indexEnd = messages[activeChat.chatKey].findIndex(
      //   (item) =>
      //     item.key === renderedMessagesList[activeChat.chatKey][renderedMessagesList[activeChat.chatKey].length - 1].key
      // )

      return {
        ...state,
        renderedMessagesList: {
          ...renderedMessagesList,
          [activeChat.chatKey]: messages[activeChat.chatKey].slice(indexStart, indexEnd)
        }
      }

    case "updateRenderedMessages":
      return {
        ...state,
        renderedMessagesList: {
          ...renderedMessagesList,
          [action.payload.chatKey]: messages[action.payload.chatKey].slice(
            action.payload.startIndex,
            action.payload.endIndex
          )
        }
      }

    case "addNewMessage":
      const optionsAdd = {
        messages: messages[action.payload.chatKey],
        lastMessage: messages[action.payload.chatKey][messages[action.payload.chatKey].length - 1],
        renderedMessages: renderedMessagesList[action.payload.chatKey],
        lastRenderedMessage:
          renderedMessagesList[action.payload.chatKey][renderedMessagesList[action.payload.chatKey].length - 1]
      }

      if (activeChat.chatKey !== action.payload.chatKey) {
        if (optionsAdd.lastMessage.key !== optionsAdd.lastRenderedMessage.key) {
          return {
            ...state,
            messages: {
              ...messages,
              [action.payload.chatKey]: [...optionsAdd.messages, action.payload.newMessage]
            }
          }
        } else {
          return {
            ...state,
            messages: {
              ...messages,
              [action.payload.chatKey]: [...optionsAdd.messages, action.payload.newMessage]
            },
            renderedMessagesList: {
              ...renderedMessagesList,
              [action.payload.chatKey]: [...optionsAdd.messages, action.payload.newMessage].slice(-MESSAGES_TO_RENDER)
            }
          }
        }
      } else {
        if (optionsAdd.lastMessage.key !== optionsAdd.lastRenderedMessage.key) {
          return {
            ...state,
            messages: {
              ...messages,
              [action.payload.chatKey]: [...optionsAdd.messages, action.payload.newMessage]
            }
          }
        } else {
          if (authUserUnreadMessages[action.payload.chatKey]! <= UNREAD_MESSAGES_TO_RENDER) {
            return {
              ...state,
              messages: {
                ...messages,
                [action.payload.chatKey]: [...optionsAdd.messages, action.payload.newMessage]
              },
              renderedMessagesList: {
                ...renderedMessagesList,
                [action.payload.chatKey]: [...optionsAdd.messages, action.payload.newMessage].slice(-MESSAGES_TO_RENDER)
              }
            }
          } else {
            const endIndexRender =
              [...optionsAdd.messages, action.payload.newMessage].length -
              (authUserUnreadMessages[action.payload.chatKey]! - UNREAD_MESSAGES_TO_RENDER)
            const startIndexRender = Math.max(endIndexRender - MESSAGES_TO_RENDER, 0)
            return {
              ...state,
              messages: {
                ...messages,
                [action.payload.chatKey]: [...optionsAdd.messages, action.payload.newMessage]
              },
              renderedMessagesList: {
                ...renderedMessagesList,
                [action.payload.chatKey]: [...optionsAdd.messages, action.payload.newMessage].slice(
                  startIndexRender,
                  endIndexRender
                )
              }
            }
          }
        }
      }

    case "removeMessage":
      return {
        ...state,
        messages: {
          ...messages,
          [action.payload.chatKey]: [
            ...messages[action.payload.chatKey].filter((message) => message.key !== action.payload.removedMessage.key)
          ]
        },
        renderedMessagesList: {
          ...renderedMessagesList,
          [action.payload.chatKey]: [
            ...renderedMessagesList[action.payload.chatKey].filter(
              (message) => message.key !== action.payload.removedMessage.key
            )
          ]
        }
      }

    case "changeMessage":
      const prevStateMessages = [...messages[action.payload.chatKey]]
      const changedMessageIndex = prevStateMessages.findIndex(
        (message) => message.key === action.payload.changedMessage.key
      )
      prevStateMessages[changedMessageIndex] =
        changedMessageIndex !== -1 ? action.payload.changedMessage : prevStateMessages[changedMessageIndex]

      const prevStateRenderedMessages = [...renderedMessagesList[action.payload.chatKey]]
      const changedRenderedMessageIndex = prevStateRenderedMessages.findIndex(
        (message) => message.key === action.payload.changedMessage.key
      )
      prevStateRenderedMessages[changedRenderedMessageIndex] =
        changedRenderedMessageIndex !== -1
          ? action.payload.changedMessage
          : prevStateMessages[changedRenderedMessageIndex]

      return {
        ...state,
        messages: {
          ...messages,
          [action.payload.chatKey]: prevStateMessages
        },
        renderedMessagesList: {
          ...renderedMessagesList,
          [action.payload.chatKey]: prevStateRenderedMessages
        }
      }

    case "updateContacts":
      return {
        ...state,
        contacts: action.payload
      }

    case "updateLastScrollTop":
      console.log(activeChat.chatKey)
      console.log(action.payload.chatKey)
      if (activeChat.chatKey !== action.payload.chatKey) {
        return { ...state }
      }
      return {
        ...state,
        lastScrollTop: {
          ...lastScrollTop,
          [activeChat.chatKey]: action.payload.scrollTop
        }
      }

    case "updateContactUnreadMessages":
      return {
        ...state,
        contactsUnreadMessages: {
          ...contactsUnreadMessages,
          [activeChat.chatKey]: action.payload
        }
      }

    case "updateAuthUserUnreadMessages":
      return {
        ...state,
        authUserUnreadMessages: {
          ...authUserUnreadMessages,
          [action.payload.chatKey]: action.payload.unreadMessages
        }
      }

    case "updateActiveChat":
      return {
        ...state,
        activeChat: action.payload
      }

    case "updateMessagePopup":
      return {
        ...state,
        messagePopup: messagePopup === action.payload ? "" : action.payload
      }

    case "updateContactPopup":
      return {
        ...state,
        contactPopup: contactPopup === action.payload ? "" : action.payload
      }

    default:
      throw new Error()
  }
}

export const INITIAL_STATE = {
  authUserUnreadMessages: {},
  contactsUnreadMessages: {},
  activeChat: {
    chatKey: "",
    contactKey: ""
  },
  messages: {},
  renderedMessages: {},
  renderedMessagesList: {},
  contacts: {},
  lastScrollTop: {},
  messagePopup: "",
  contactPopup: ""
}

export default reducer
