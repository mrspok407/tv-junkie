import { ContactsInterface, ContactsStateInterface, MessageInterface } from "../../Types"

export type ACTIONTYPES =
  | { type: "updateContactUnreadMessages"; payload: string[] }
  | { type: "updateAuthUserUnreadMessages"; payload: number }
  | { type: "updateActiveChat"; payload: { chatKey: string; contactKey: string } }
  | { type: "updateMessages"; payload: MessageInterface[] }
  | { type: "updateContacts"; payload: ContactsInterface }
  | { type: "updateMessagePopup"; payload: string }
  | { type: "updateContactPopup"; payload: string }

const reducer = (state: ContactsStateInterface, action: ACTIONTYPES) => {
  const { contactsUnreadMessages, activeChat, messages, messagePopup, contactPopup } = state
  switch (action.type) {
    case "updateMessages":
      return {
        ...state,
        messages: {
          ...messages,
          [activeChat.chatKey]: action.payload
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
  authUserUnreadMessages: 0,
  contactsUnreadMessages: {},
  activeChat: {
    chatKey: "",
    contactKey: ""
  },
  messages: {},
  contacts: {},
  messagePopup: "",
  contactPopup: ""
}

export default reducer
