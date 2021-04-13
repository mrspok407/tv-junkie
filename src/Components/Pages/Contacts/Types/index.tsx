export interface ContactInfoInterface {
  status: boolean
  receiver: boolean
  userName: string
  timeStamp: number
  pinned_lastActivityTS: string
  recipientNotified: boolean
  key: string
}

export interface MessagesInterface {
  message: string
  sender: string
  timeStamp: number
  key: string
}

export interface ContactsStateInterface {
  unreadMessages: null | number
  activeChat: {
    contactKey: string | null
    chatKey: string | null
  }
}
