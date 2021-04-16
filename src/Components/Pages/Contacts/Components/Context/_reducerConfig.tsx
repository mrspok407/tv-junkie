import { ContactsInterface, ContactsStateInterface, MessageInterface } from "../../Types"

export type ACTIONTYPES =
  | { type: "updateUnreadMessages"; payload: number | null }
  | { type: "updateActiveChat"; payload: { chatKey: string; contactKey: string } }
  // | { type: "updateContactInfo"; payload: ContactInfoInterface }
  | { type: "updateMessages"; payload: MessageInterface[] }
  | { type: "updateContacts"; payload: ContactsInterface }

const reducer = (state: ContactsStateInterface, action: ACTIONTYPES) => {
  const { unreadMessages, activeChat, messages, contacts } = state
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

    case "updateUnreadMessages":
      return {
        ...state,
        unreadMessages: action.payload
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
  unreadMessages: null,
  activeChat: {
    chatKey: "",
    contactKey: ""
  },
  messages: {},
  contacts: {}
}

export default reducer
