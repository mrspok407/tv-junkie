export interface ContactInfoInterface {
  status: boolean | string
  receiver: boolean
  userName: string
  timeStamp: number
  pinned_lastActivityTS: string
  recipientNotified: boolean
  key: string
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

export interface ContactsStateInterface {
  unreadMessages: null | number
  activeChat: {
    chatKey: string
    contactKey: string
  }
  messages: {
    [key: string]: MessageInterface[]
  }
  contacts: {
    [key: string]: ContactInfoInterface
  }
}
