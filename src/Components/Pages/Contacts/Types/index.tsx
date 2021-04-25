export interface ContactInfoInterface {
  status: boolean | string
  receiver: boolean
  userName: string
  timeStamp: number
  pinned_lastActivityTS: string
  key: string
  newContactsActivity: boolean | null
  newContactsRequests: boolean | null
  lastMessage: MessageInterface
  unreadMessagesAuth: number
  unreadMessagesContact: number
}

export const CONTACT_INFO_INITIAL_DATA = {
  status: [false, ""],
  receiver: false,
  userName: "",
  timeStamp: 0,
  pinned_lastActivityTS: ""
}

export interface ContactsInterface {
  [key: string]: ContactInfoInterface
}

export interface MessageInterface {
  message: string
  sender: string
  timeStamp: number
  key: string
}

export const MESSAGE_INITIAL_DATA = {
  message: "",
  sender: "",
  timeStamp: 0
}

export interface ContactsStateInterface {
  contactsUnreadMessages: {
    [key: string]: string[]
  }
  authUserUnreadMessages: number | null
  activeChat: {
    chatKey: string
    contactKey: string
  }
  messages: {
    [key: string]: MessageInterface[]
  }
  renderedMessages: {
    [key: string]: number | undefined
  }
  contacts: {
    [key: string]: ContactInfoInterface
  }
  messagePopup: string
  contactPopup: string
}

export interface SnapshotStringBooleanInterface {
  val: () => { [key: string]: boolean | null } | null
  numChildren: () => number
}
