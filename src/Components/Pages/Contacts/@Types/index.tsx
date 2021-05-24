export interface ContactInfoInterface {
  status: boolean | string
  receiver: boolean
  userName: string
  timeStamp: number
  pinned_lastActivityTS: string
  key: string
  chatKey: string
  newContactsActivity: boolean | null
  lastContactActivity: number | null
  newContactsRequests: boolean | null
  lastMessage: MessageInterface
  unreadMessages: string[]
  unreadMessagesContact: boolean
}

export const CONTACT_INFO_INITIAL_DATA = {
  status: [false, ""],
  receiver: false,
  userName: "",
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

export interface ContactStatusInterface {
  isOnline: boolean
  lastSeen: number | undefined
  chatBottom: boolean | undefined
  pageInFocus: boolean | undefined
}

export const MESSAGE_INITIAL_DATA = {
  message: "",
  sender: "",
  timeStamp: 0
}

export interface MessageInputInterface {
  message: string
  anchorOffset: number
  scrollTop: number
}

export interface ContactsStateInterface {
  contactsUnreadMessages: {
    [key: string]: string[]
  }
  authUserUnreadMessages: {
    [key: string]: string[]
  }
  activeChat: {
    chatKey: string
    contactKey: string
  }
  messages: {
    [key: string]: MessageInterface[]
  }
  messagesInput: {
    [key: string]: MessageInputInterface
  }
  renderedMessagesList: {
    [key: string]: MessageInterface[]
  }
  contacts: {
    [key: string]: ContactInfoInterface
  }
  lastScrollPosition: {
    [key: string]: number | undefined
  }
  contactsStatus: {
    [key: string]: ContactStatusInterface
  }
  messagesListRef: any
  messagePopup: string
  optionsPopupContactList: string
  optionsPopupChatWindow: string
  confirmModal: {
    isActive: boolean
    function: string
    contactKey?: string
  }
}

export interface SnapshotStringBooleanInterface {
  val: () => { [key: string]: boolean | null } | null
  numChildren: () => number
}

export interface ContainerRectInterface {
  height: number
  scrollHeight: number
  scrollTop: number
  thresholdTopLoad: number
  thresholdTopRender: number
  thresholdBottomRender: number
}

export interface ConfirmFunctionsInterface {
  [key: string]: ({ contactInfo }: { contactInfo: ContactInfoInterface }) => any
}
