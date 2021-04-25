import { ContactsInterface, ContactsStateInterface, MessageInterface } from "../../Types"

export type ACTIONTYPES =
  | { type: "updateContactUnreadMessages"; payload: string[] }
  | { type: "updateAuthUserUnreadMessages"; payload: number | null }
  | { type: "updateActiveChat"; payload: { chatKey: string; contactKey: string } }
  | {
      type: "setInitialMessages"
      payload: { messagesData: MessageInterface[]; loadedMessages?: number; chatKey: string }
    }
  | { type: "addNewMessage"; payload: { newMessage: MessageInterface; chatKey: string } }
  | { type: "removeMessage"; payload: { removedMessage: MessageInterface; chatKey: string } }
  | { type: "changeMessage"; payload: { changedMessage: MessageInterface; chatKey: string } }
  | { type: "updateContacts"; payload: ContactsInterface }
  | { type: "updateMessagePopup"; payload: string }
  | { type: "updateContactPopup"; payload: string }

const reducer = (state: ContactsStateInterface, action: ACTIONTYPES) => {
  const { contactsUnreadMessages, activeChat, messages, renderedMessages, messagePopup, contactPopup } = state
  switch (action.type) {
    case "setInitialMessages":
      return {
        ...state,
        messages: {
          ...messages,
          [action.payload.chatKey]: action.payload.messagesData
        },
        renderedMessages: {
          ...renderedMessages,
          [action.payload.chatKey]: action.payload.loadedMessages
        }
      }

    case "addNewMessage":
      return {
        ...state,
        messages: {
          ...messages,
          [action.payload.chatKey]: [...messages[action.payload.chatKey], action.payload.newMessage]
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
        }
      }

    case "changeMessage":
      const prevStateMessages = [...messages[action.payload.chatKey]]
      const changedMessageIndex = prevStateMessages.findIndex(
        (message) => message.key === action.payload.changedMessage.key
      )

      prevStateMessages[changedMessageIndex] =
        changedMessageIndex !== -1 ? action.payload.changedMessage : prevStateMessages[changedMessageIndex]

      return {
        ...state,
        messages: {
          ...messages,
          [action.payload.chatKey]: prevStateMessages
        }
      }

    case "updateContacts":
      return {
        ...state,
        contacts: action.payload
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
        authUserUnreadMessages: action.payload
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
  authUserUnreadMessages: null,
  contactsUnreadMessages: {},
  activeChat: {
    chatKey: "",
    contactKey: ""
  },
  messages: {},
  renderedMessages: {},
  contacts: {},
  messagePopup: "",
  contactPopup: ""
}

export default reducer
