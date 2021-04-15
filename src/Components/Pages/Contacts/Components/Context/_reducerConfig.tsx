import * as React from "react"
import { ContactsStateInterface } from "../../Types"

export enum ActionTypes {
  UpdateUnreadMessages = "updateUnreadMessages",
  UpdateActiveChat = "updateActiveChat",
  UpdateContactInfo = "updateContactInfo"
}

const reducer: React.Reducer<ContactsStateInterface, ActionInterface> = (state, action) => {
  const { unreadMessages, activeChat } = state
  if (action.type === ActionTypes.UpdateUnreadMessages) {
    return {
      ...state,
      unreadMessages: action.payload
    }
  } else if (action.type === ActionTypes.UpdateActiveChat) {
    return {
      ...state,
      activeChat: action.payload
    }
  } else if (action.type === ActionTypes.UpdateContactInfo) {
    return {
      ...state,
      contactInfo: action.payload
    }
  } else {
    throw new Error()
  }
}

export interface ActionInterface {
  type: ActionTypes
  payload?: any
}

const INITIAL_STATE: ContactsStateInterface = {
  unreadMessages: null,
  activeChat: {
    contactKey: "",
    chatKey: ""
  },
  contactInfo: {
    status: false,
    receiver: false,
    userName: "",
    timeStamp: 0,
    pinned_lastActivityTS: "",
    recipientNotified: false,
    key: ""
  }
}

export default reducer
export { INITIAL_STATE }
