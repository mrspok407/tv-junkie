import { ContactsInterface, ContactsStateInterface, MessageInterface } from "../../Types"
import { MESSAGES_TO_RENDER, UNREAD_MESSAGES_TO_RENDER } from "./Constants"

export type ACTIONTYPES =
  | { type: "updateContactUnreadMessages"; payload: string[] }
  | { type: "updateAuthUserUnreadMessages"; payload: { chatKey: string; unreadMessages: number } }
  | { type: "updateActiveChat"; payload: { chatKey: string; contactKey: string } }
  | { type: "updateMessagesListRef"; payload: { ref: any } }
  | {
      type: "setInitialMessages"
      payload: { messagesData: MessageInterface[]; startIndex?: number; endIndex?: number; chatKey: string }
    }
  | { type: "loadTopMessages"; payload: { newTopMessages: MessageInterface[] } }
  | { type: "renderMessagesOnLoad"; payload: { startIndex?: number; endIndex?: number; chatKey: string } }
  | { type: "renderTopMessages" }
  | { type: "renderBottomMessages" }
  | { type: "addNewMessage"; payload: { newMessage: MessageInterface; chatKey: string } }
  | { type: "removeMessage"; payload: { removedMessage: MessageInterface; chatKey: string } }
  | { type: "changeMessage"; payload: { changedMessage: MessageInterface; chatKey: string } }
  | { type: "updateContacts"; payload: ContactsInterface }
  | { type: "updateLastScrollPosition"; payload: { scrollTop: number; chatKey: string } }
  | { type: "updateMessagePopup"; payload: string }
  | { type: "updateContactPopup"; payload: string }

const reducer = (state: ContactsStateInterface, action: ACTIONTYPES) => {
  const {
    contactsUnreadMessages,
    authUserUnreadMessages,
    activeChat,
    messages,
    renderedMessagesList,
    messagePopup,
    contactPopup,
    lastScrollPosition,
    messagesListRef
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

    case "renderTopMessages": {
      if (messages[activeChat.chatKey][0].key === renderedMessagesList[activeChat.chatKey][0].key) {
        return { ...state }
      }

      const indexStart = Math.max(
        messages[activeChat.chatKey].findIndex((item) => item.key === renderedMessagesList[activeChat.chatKey][0].key) -
          (MESSAGES_TO_RENDER - 50),
        0
      )
      const indexEnd = indexStart + MESSAGES_TO_RENDER

      return {
        ...state,
        renderedMessagesList: {
          ...renderedMessagesList,
          [activeChat.chatKey]: messages[activeChat.chatKey].slice(indexStart, indexEnd)
        }
      }
    }

    case "renderBottomMessages": {
      const messagesData = messages[activeChat.chatKey]
      const renderedMessages = renderedMessagesList[activeChat.chatKey]

      if (messagesData[messagesData.length - 1].key === renderedMessages[renderedMessages.length - 1].key) {
        console.log("at the bottom")
        return { ...state }
      }

      console.log("bottom msg render")

      const indexEnd = Math.max(
        messagesData.findIndex((item) => item.key === renderedMessages[renderedMessages.length - 1].key) +
          (MESSAGES_TO_RENDER - 50),
        0
      )
      const indexStart = indexEnd - MESSAGES_TO_RENDER

      return {
        ...state,
        renderedMessagesList: {
          ...renderedMessagesList,
          [activeChat.chatKey]: messages[activeChat.chatKey].slice(indexStart, indexEnd)
        }
      }
    }

    case "renderMessagesOnLoad":
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

    case "addNewMessage": {
      const messagesData = messages[action.payload.chatKey]
      const lastMessage = messagesData[messagesData.length - 1]
      const renderedMessages = renderedMessagesList[action.payload.chatKey]
      const lastRenderedMessage = renderedMessages[renderedMessages.length - 1]

      if (activeChat.chatKey !== action.payload.chatKey) {
        if (lastMessage.key !== lastRenderedMessage.key) {
          return {
            ...state,
            messages: {
              ...messages,
              [action.payload.chatKey]: [...messagesData, action.payload.newMessage]
            }
          }
        } else {
          return {
            ...state,
            messages: {
              ...messages,
              [action.payload.chatKey]: [...messagesData, action.payload.newMessage]
            },
            renderedMessagesList: {
              ...renderedMessagesList,
              [action.payload.chatKey]: [...messagesData, action.payload.newMessage].slice(-MESSAGES_TO_RENDER)
            }
          }
        }
      } else {
        if (lastMessage.key !== lastRenderedMessage.key) {
          return {
            ...state,
            messages: {
              ...messages,
              [action.payload.chatKey]: [...messagesData, action.payload.newMessage]
            }
          }
        } else {
          if (authUserUnreadMessages[action.payload.chatKey]! <= UNREAD_MESSAGES_TO_RENDER) {
            return {
              ...state,
              messages: {
                ...messages,
                [action.payload.chatKey]: [...messagesData, action.payload.newMessage]
              },
              renderedMessagesList: {
                ...renderedMessagesList,
                [action.payload.chatKey]: [...messagesData, action.payload.newMessage].slice(-MESSAGES_TO_RENDER)
              }
            }
          } else {
            const endIndexRender =
              [...messagesData, action.payload.newMessage].length -
              (authUserUnreadMessages[action.payload.chatKey]! - UNREAD_MESSAGES_TO_RENDER)
            const startIndexRender = Math.max(endIndexRender - MESSAGES_TO_RENDER, 0)
            return {
              ...state,
              messages: {
                ...messages,
                [action.payload.chatKey]: [...messagesData, action.payload.newMessage]
              },
              renderedMessagesList: {
                ...renderedMessagesList,
                [action.payload.chatKey]: [...messagesData, action.payload.newMessage].slice(
                  startIndexRender,
                  endIndexRender
                )
              }
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

    case "updateLastScrollPosition":
      if (activeChat.chatKey !== action.payload.chatKey) {
        return { ...state }
      }
      return {
        ...state,
        lastScrollPosition: {
          ...lastScrollPosition,
          [action.payload.chatKey]: action.payload.scrollTop
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
      console.log({ messagesListRef })
      if (messagesListRef) {
        // messagesListRef.style.setProperty("--isShown", "0")
      }
      return {
        ...state,
        activeChat: action.payload
      }

    case "updateMessagesListRef":
      console.log(action.payload)
      return {
        ...state,
        messagesListRef: action.payload.ref
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
  lastScrollPosition: {},
  messagePopup: "",
  contactPopup: "",
  messagesListRef: ""
}

export default reducer
