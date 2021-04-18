import { ContactsInterface, ContactsStateInterface, MessageInterface } from "../../Types"

export type ACTIONTYPES =
  | { type: "updateContactUnreadMessages"; payload: string[] }
  | { type: "updateAuthUserUnreadMessages"; payload: number }
  | { type: "updateActiveChat"; payload: { chatKey: string; contactKey: string } }
  // | { type: "updateContactInfo"; payload: ContactInfoInterface }
  | { type: "updateMessages"; payload: MessageInterface[] }
  | { type: "updateContacts"; payload: ContactsInterface }

const reducer = (state: ContactsStateInterface, action: ACTIONTYPES) => {
  const { contactsUnreadMessages, activeChat, messages, contacts } = state
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
  contacts: {}
}

export default reducer
